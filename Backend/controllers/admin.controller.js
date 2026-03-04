const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const Review = require('../models/review.model');

// 1. Get logged-in admin details
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Get vendor requests (unverified vendors)
const getVendorRequests = async (req, res) => {
  try {
    const vendorRequests = await User.find({ role: 'vendor', verified: false })
      .select('full_name email phone role verified createdAt')
      .sort({ createdAt: -1 });

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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 3. Accept vendor request
const acceptVendorRequest = async (req, res) => {
  try {
    const vendor = await User.findOne({ _id: req.params.vendorId, role: 'vendor', verified: false });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor request not found or already verified' });
    }

    vendor.verified = true;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor approved successfully',
      data: { vendor_id: vendor._id, full_name: vendor.full_name, verified: vendor.verified }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Reject vendor request
const rejectVendorRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const vendor = await User.findOne({ _id: req.params.vendorId, role: 'vendor', verified: false });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor request not found or already processed' });
    }

    await User.findByIdAndDelete(vendor._id);

    res.status(200).json({
      success: true,
      message: 'Vendor request rejected',
      data: { vendor_id: vendor._id, reason: reason || 'No reason provided' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, verified, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (verified !== undefined) filter.verified = verified === 'true';

    const skip = (page - 1) * limit;
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 6. Get all bookings
const getAllBookings = async (req, res) => {
  try {
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

    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const revenue = revenueAgg[0]?.total || 0;

    const statusCountsAgg = await Booking.aggregate([
      { $group: { _id: { $toLower: '$status' }, count: { $sum: 1 } } }
    ]);
    const statusCounts = statusCountsAgg.reduce((acc, curr) => {
      const key = curr._id.charAt(0).toUpperCase() + curr._id.slice(1);
      acc[key] = curr.count;
      acc.Total = (acc.Total || 0) + curr.count;
      return acc;
    }, {});

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
          service: booking.service ? {
            service_id: booking.service._id,
            title: booking.service.title,
            price: booking.service.price,
            category: booking.service.category
          } : null,
          booking_date: booking.booking_date,
          status: booking.status,
          total_amount: booking.total_amount,
          created_at: booking.createdAt
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalBookings / limit),
          total_bookings: totalBookings,
          bookings_per_page: parseInt(limit)
        },
        total_revenue: revenue,
        status_count: statusCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 7. Get overall platform stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalClients, totalBookings, totalServices, totalReviews] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'vendor', verified: true }),
      User.countDocuments({ role: 'client' }),
      Booking.countDocuments(),
      Service.countDocuments({ status: 'active' }),
      Review.countDocuments()
    ]);

    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$total_amount', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const chartData = monthlyBookings.map(m => ({
      month: months[m._id.month - 1],
      bookings: m.count,
      revenue: m.revenue
    }));

    const statusCountsAgg = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: { totalUsers, totalVendors, totalClients, totalBookings, totalServices, totalReviews, totalRevenue },
        chartData,
        statusCounts: statusCountsAgg.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAdminProfile,
  getVendorRequests,
  acceptVendorRequest,
  rejectVendorRequest,
  getAllUsers,
  getAllBookings,
  getStats
};
