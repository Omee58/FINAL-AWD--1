const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const User = require('../models/user.model');

// 1. Get logged-in vendor details
const getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Check if vendor is verified
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account must be verified by admin before accessing profile.'
      });
    }

    const vendor = await User.findById(vendorId);
    console.log("Vendor profile : ", vendor);

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          vendor_id: vendor._id,
          full_name: vendor.full_name,
          email: vendor.email,
          phone: vendor.phone,
          role: vendor.role,
          verified: vendor.verified,
          created_at: vendor.createdAt,
          updated_at: vendor.updatedAt
        }
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

// 2. Get booking requests (pending bookings for vendor)
const getBookingRequests = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Check if vendor is verified
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account must be verified by admin before accessing bookings.'
      });
    }

    const pendingBookings = await Booking.find({
      vendor: vendorId,
      status: 'pending'
    })
      .populate('client', 'full_name email phone')
      .populate('service', 'title description price category images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        pending_bookings: pendingBookings.map(booking => ({
          booking_id: booking._id,
          client: {
            client_id: booking.client._id,
            full_name: booking.client.full_name,
            email: booking.client.email,
            phone: booking.client.phone
          },
          service: {
            service_id: booking.service._id,
            title: booking.service.title,
            description: booking.service.description,
            price: booking.service.price,
            category: booking.service.category,
            images: booking.service.images
          },
          booking_date: booking.booking_date,
          total_amount: booking.total_amount,
          created_at: booking.createdAt
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

// 3. Get booked services (current/future bookings)
const getBookedServices = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Check if vendor is verified
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account must be verified by admin before accessing bookings.'
      });
    }

    const currentDate = new Date();
    const currentDateStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const bookedServices = await Booking.find({
      vendor: vendorId,
      booking_date: { $gte: currentDateStart },
      status: { $in: ['pending', 'confirmed', 'cancelled', 'completed'] }
    })
      .populate('client', 'full_name email phone')
      .populate('service', 'title description price category images')
      .sort({ booking_date: 1 });

      console.log(bookedServices);
      
    res.status(200).json({
  success: true,
  data: {
    booked_services: bookedServices.map(booking => ({
      booking_id: booking._id,
      client: booking.client
        ? {
            client_id: booking.client._id,
            full_name: booking.client.full_name,
            email: booking.client.email,
            phone: booking.client.phone
          }
        : null,
      service: booking.service
        ? {
            service_id: booking.service._id,
            title: booking.service.title,
            description: booking.service.description,
            price: booking.service.price,
            category: booking.service.category,
            images: booking.service.images || []
          }
        : null,
      booking_date: booking.booking_date,
      status: booking.status,
      total_amount: booking.total_amount,
      created_at: booking.createdAt
    }))
  }
});

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// 4. Add new service
const addService = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Check if vendor is verified
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account must be verified by admin before creating services.'
      });
    }

    const { title, description, price, category, location, images } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, price, category, and location are required'
      });
    }

    // Validate price
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Create new service
    const service = await Service.create({
      title,
      description,
      price,
      category: category.toLowerCase(),
      location,
      images: images || [],
      vendor: vendorId,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: {
        service: {
          service_id: service._id,
          title: service.title,
          description: service.description,
          price: service.price,
          category: service.category,
          location: service.location,
          images: service.images,
          status: service.status,
          vendor: vendorId,
          created_at: service.createdAt,
          updated_at: service.updatedAt
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

// 5. Get vendor's services
const getMyServices = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Check if vendor is verified
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account must be verified by admin before accessing services.'
      });
    }

    const services = await Service.find({ vendor: vendorId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        services: services.map(service => ({
          service_id: service._id,
          title: service.title,
          description: service.description,
          price: service.price,
          category: service.category,
          location: service.location,
          images: service.images,
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

// 6. Change booking status
const changeBookingStatus = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { bookingId } = req.params;
    const { status } = req.body;

    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Check if vendor is verified
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account must be verified by admin before managing bookings.'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed'
      });
    }

    // Find booking and verify ownership
    const booking = await Booking.findOne({ _id: bookingId, vendor: vendorId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if status change is valid
    const currentStatus = booking.status;

    // Define allowed status transitions for vendors
    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [], // Cannot change from completed
      cancelled: [] // Cannot change from cancelled
    };

    if (!allowedTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status changed to ${status} successfully`,
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

// 7. Update service
const updateService = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { serviceId } = req.params;
    const { title, description, price, category, location, images, status } = req.body;

    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Check if vendor is verified
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account must be verified by admin before managing services.'
      });
    }

    // Find service and verify ownership
    const service = await Service.findOne({ _id: serviceId, vendor: vendorId });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Prepare update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category) updateData.category = category.toLowerCase();
    if (location) updateData.location = location;
    if (images !== undefined) updateData.images = images;
    if (status) updateData.status = status;

    // Validate price if being updated
    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: {
        service: {
          service_id: updatedService._id,
          title: updatedService.title,
          description: updatedService.description,
          price: updatedService.price,
          category: updatedService.category,
          location: updatedService.location,
          images: updatedService.images,
          status: updatedService.status,
          vendor: updatedService.vendor,
          created_at: updatedService.createdAt,
          updated_at: updatedService.updatedAt
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

// 8. Get individual service by ID (public)
const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId)
      .populate('vendor', 'full_name email phone');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        service: {
          service_id: service._id,
          title: service.title,
          description: service.description,
          price: service.price,
          category: service.category,
          location: service.location,
          images: service.images,
          status: service.status,
          vendor: {
            vendor_id: service.vendor._id,
            full_name: service.vendor.full_name,
            email: service.vendor.email,
            phone: service.vendor.phone
          },
          created_at: service.createdAt,
          updated_at: service.updatedAt
        }
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

// 9. Delete service
const deleteService = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { serviceId } = req.params;

    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Check if vendor is verified
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account must be verified by admin before managing services.'
      });
    }

    // Find service and verify ownership
    const service = await Service.findOne({ _id: serviceId, vendor: vendorId });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if service has active bookings
    const activeBookings = await Booking.find({
      service: serviceId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service with active bookings. Please cancel all bookings first.'
      });
    }

    // Delete service
    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Profile update is handled by the unified updateProfile function in auth.controller.js

module.exports = {
  getVendorProfile,
  getBookingRequests,
  getBookedServices,
  addService,
  getMyServices,
  changeBookingStatus,
  updateService,
  getServiceById,
  deleteService
};
