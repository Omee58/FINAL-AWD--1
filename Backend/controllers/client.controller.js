const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const User = require('../models/user.model');

// Get all bookings for logged-in client
const getClientBookings = async (req, res) => {
  try {
    const clientId = req.user._id;
    const bookings = await Booking.find({ client: clientId })
      .populate('vendor', 'full_name email phone')
      .populate('service', 'title description price category images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        bookings: bookings.map(booking => ({
          booking_id: booking._id,
          service: booking.service
            ? {
              service_id: booking.service._id,
              title: booking.service.title,
              description: booking.service.description,
              price: booking.service.price,
              category: booking.service.category,
              images: booking.service.images || null
            }
            : null,
          vendor: {
            vendor_id: booking.vendor._id,
            full_name: booking.vendor.full_name,
            email: booking.vendor.email,
            phone: booking.vendor.phone
          },
          booking_date: booking.booking_date,
          status: booking.status,
          total_amount: booking.total_amount,
          created_at: booking.createdAt,
          updated_at: booking.updatedAt
        }))
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Cancel booking (only for pending status)
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const clientId = req.user._id;

    // Find booking and verify ownership
    const booking = await Booking.findOne({ _id: bookingId, client: clientId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be cancelled'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking_id: booking._id,
        status: booking.status,
        updated_at: booking.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all services with filtering
const getAllServices = async (req, res) => {
  try {
    const {
      category,
      location,
      search,
      minPrice,
      maxPrice,
      vendor
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (vendor) {
      filter.vendor = vendor;
    }

    // Get all services without pagination (only from verified vendors)
    const services = await Service.find(filter)
      .populate('vendor', 'full_name email phone verified')
      .sort({ createdAt: -1 });

    // Filter out services from unverified vendors
    const verifiedServices = services.filter(service => service.vendor.verified);

    res.status(200).json({
      success: true,
      data: {
        services: verifiedServices.map(service => ({
          service_id: service._id,
          title: service.title,
          description: service.description,
          price: service.price,
          category: service.category,
          location: service.location,
          images: service.images,
          vendor: {
            vendor_id: service.vendor._id,
            full_name: service.vendor.full_name,
            email: service.vendor.email,
            phone: service.vendor.phone
          },
          status: service.status,
          created_at: service.createdAt,
          updated_at: service.updatedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Book a service
const bookService = async (req, res) => {
  try {
    const { serviceId, vendorId, bookingDate, totalAmount } = req.body;
    const clientId = req.user._id;

    // Validate required fields
    if (!serviceId || !vendorId || !bookingDate) {
      return res.status(400).json({
        success: false,
        message: 'Service ID, vendor ID, and booking date are required'
      });
    }

    // Check if service exists and is active
    const service = await Service.findOne({ _id: serviceId, status: 'active' });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or inactive'
      });
    }

    // Check if vendor exists and is verified
    const vendor = await User.findOne({ _id: vendorId, role: 'vendor' });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (!vendor.verified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book service from unverified vendor'
      });
    }

    // Validate booking date
    const bookingDateObj = new Date(bookingDate);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (bookingDateObj <= todayStart) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future'
      });
    }

    // Check if client is trying to book their own service
    if (clientId.toString() === vendorId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book your own service'
      });
    }

    // Create booking
    const booking = await Booking.create({
      client: clientId,
      vendor: vendorId,
      service: serviceId,
      booking_date: bookingDateObj,
      total_amount: totalAmount || service.price,
      status: 'pending'
    });

    // Populate the created booking
    const populatedBooking = await Booking.findById(booking._id)
      .populate('vendor', 'full_name email phone')
      .populate('service', 'title description price category');

    res.status(201).json({
      success: true,
      message: 'Service booked successfully',
      data: {
        booking: {
          booking_id: populatedBooking._id,
          service: {
            service_id: populatedBooking.service._id,
            title: populatedBooking.service.title,
            description: populatedBooking.service.description,
            price: populatedBooking.service.price,
            category: populatedBooking.service.category
          },
          vendor: {
            vendor_id: populatedBooking.vendor._id,
            full_name: populatedBooking.vendor.full_name,
            email: populatedBooking.vendor.email,
            phone: populatedBooking.vendor.phone
          },
          booking_date: populatedBooking.booking_date,
          status: populatedBooking.status,
          total_amount: populatedBooking.total_amount,
          created_at: populatedBooking.createdAt,
          updated_at: populatedBooking.updatedAt
        }
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getClientBookings,
  cancelBooking,
  getAllServices,
  bookService
};
