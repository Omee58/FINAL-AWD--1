const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Service = require('../models/service.model');

// 1. Get logged-in admin details
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user._id;

    // Verify user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const admin = await User.findById(adminId);

    res.status(200).json({
      success: true,
      data: {
        admin: {
          admin_id: admin._id,
          full_name: admin.full_name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          created_at: admin.createdAt,
          updated_at: admin.updatedAt
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

// 2. Get vendor requests (users with role="vendor", verified=false)
const getVendorRequests = async (req, res) => {
  try {
    // Verify user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const vendorRequests = await User.find({
      role: 'vendor',
      verified: false
    })
      .select('full_name email phone role verified createdAt')
      .sort({ createdAt: -1 });

      console.log("vendor :", vendorRequests);
      
    res.status(200).json({
      success: true,
      data: {
        vendor_requests: vendorRequests.map(vendor => ({
          vendor_id: vendor._id,
          full_name: vendor.full_name,
          email: vendor.email,
          phone: vendor.phone,
          role: vendor.role,
          verified: vendor.verified,
          created_at: vendor.createdAt
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

// 3. Accept vendor request (set verified=true)
const acceptVendorRequest = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Verify user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Find vendor and verify they exist and are unverified
    const vendor = await User.findOne({
      _id: vendorId,
      role: 'vendor',
      verified: false
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor request not found or already verified'
      });
    }

    // Update vendor verification status
    vendor.verified = true;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor request accepted successfully',
      data: {
        vendor: {
          vendor_id: vendor._id,
          full_name: vendor.full_name,
          email: vendor.email,
          phone: vendor.phone,
          role: vendor.role,
          verified: vendor.verified,
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

// 4. Get all users (clients and vendors)
const getAllUsers = async (req, res) => {
  try {
    // Verify user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { role, verified, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (verified !== undefined) filter.verified = verified === 'true';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          user_id: user._id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
          created_at: user.createdAt,
          updated_at: user.updatedAt
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalUsers / limit),
          total_users: totalUsers,
          users_per_page: parseInt(limit)
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

// 5. Get all bookings (all statuses)
const getAllBookings = async (req, res) => {
  try {
    // Verify user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate('client', 'full_name email phone')
      .populate('vendor', 'full_name email phone')
      .populate('service', 'title description price category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await Booking.countDocuments(filter);

    const total_revenue = await Booking.aggregate([
      { $match: { status: { $regex: /^completed$/i } } }, // handles 'Completed' or 'completed'
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);

    const revenue = total_revenue[0]?.total || 0;

    const statusCountsAgg = await Booking.aggregate([
      { $group: { _id: { $toLower: "$status" }, count: { $sum: 1 } } }
    ]);

    const statusCounts = statusCountsAgg.reduce(
      (acc, curr) => {
        const key = curr._id.charAt(0).toUpperCase() + curr._id.slice(1);
        acc[key] = curr.count;
        acc.Total += curr.count;
        return acc;
      },
      { Total: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        bookings: bookings.map(booking => ({
          booking_id: booking._id,
          client: {
            client_id: booking.client?._id || null,
            full_name: booking.client?.full_name || null,
            email: booking.client?.email || null,
            phone: booking.client?.phone || null
          },
          vendor: {
            vendor_id: booking.vendor?._id || null,
            full_name: booking.vendor?.full_name || null,
            email: booking.vendor?.email || null,
            phone: booking.vendor?.phone || null
          },
          service: booking.service
            ? {
              service_id: booking.service._id,
              title: booking.service.title,
              description: booking.service.description,
              price: booking.service.price,
              category: booking.service.category
            }
            : null,
          booking_date: booking.booking_date,
          status: booking.status,
          total_amount: booking.total_amount,
          created_at: booking.createdAt,
          updated_at: booking.updatedAt
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalBookings / limit),
          total_bookings: totalBookings,
          bookings_per_page: parseInt(limit),
        },
        total_revenue: revenue,
        status_count : statusCounts
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

module.exports = {
  getAdminProfile,
  getVendorRequests,
  acceptVendorRequest,
  getAllUsers,
  getAllBookings
};
