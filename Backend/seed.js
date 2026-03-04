const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/user.model');
const Service = require('./models/service.model');
const Booking = require('./models/booking.model');
const Review = require('./models/review.model');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');

  // Clear existing data
  await Review.deleteMany({});
  await Booking.deleteMany({});
  await Service.deleteMany({});
  await User.deleteMany({});
  console.log('Existing data cleared');

  const hash = (pwd) => bcrypt.hash(pwd, 10);

  // ─── USERS ───────────────────────────────────────────────────────────────────

  const users = await User.insertMany([
    // Admin
    {
      full_name: 'Admin User',
      email: 'admin@shadiseva.com',
      phone: '9000000001',
      password: await hash('Admin@123'),
      role: 'admin',
      verified: true,
    },

    // Vendors (verified)
    {
      full_name: 'Rajesh Photography',
      email: 'rajesh@vendor.com',
      phone: '9811234567',
      password: await hash('Vendor@123'),
      role: 'vendor',
      verified: true,
    },
    {
      full_name: 'Priya Catering',
      email: 'priya@vendor.com',
      phone: '9821234567',
      password: await hash('Vendor@123'),
      role: 'vendor',
      verified: true,
    },
    {
      full_name: 'Arjun Decoration',
      email: 'arjun@vendor.com',
      phone: '9831234567',
      password: await hash('Vendor@123'),
      role: 'vendor',
      verified: true,
    },

    // Vendor (unverified — to test admin approval flow)
    {
      full_name: 'Meera Events',
      email: 'meera@vendor.com',
      phone: '9841234567',
      password: await hash('Vendor@123'),
      role: 'vendor',
      verified: false,
    },

    // Clients
    {
      full_name: 'Aarav Sharma',
      email: 'aarav@client.com',
      phone: '9851234567',
      password: await hash('Client@123'),
      role: 'client',
      verified: true,
    },
    {
      full_name: 'Kavya Patel',
      email: 'kavya@client.com',
      phone: '9861234567',
      password: await hash('Client@123'),
      role: 'client',
      verified: true,
    },
    {
      full_name: 'Rohan Gupta',
      email: 'rohan@client.com',
      phone: '9871234567',
      password: await hash('Client@123'),
      role: 'client',
      verified: true,
    },
  ]);

  const [admin, rajesh, priya, arjun, meera, aarav, kavya, rohan] = users;
  console.log('Users seeded');

  // ─── SERVICES ────────────────────────────────────────────────────────────────

  const services = await Service.insertMany([
    // Rajesh Photography
    {
      title: 'Wedding Photography',
      description: 'Full-day professional wedding photography with 500+ edited photos delivered in a beautiful online album. Includes two photographers and drone shots.',
      price: 50000,
      category: 'photography',
      status: 'active',
      location: 'Mumbai',
      vendor: rajesh._id,
    },
    {
      title: 'Pre-Wedding Shoot',
      description: 'Romantic outdoor pre-wedding photoshoot at a location of your choice with 50 fully retouched photos.',
      price: 20000,
      category: 'photography',
      status: 'active',
      location: 'Delhi',
      vendor: rajesh._id,
    },

    // Priya Catering
    {
      title: 'Wedding Catering (200 guests)',
      description: 'Full wedding catering service for 200 guests with 3-course meal, live chaat station, and dessert counter. Includes staff and setup.',
      price: 150000,
      category: 'catering',
      status: 'active',
      location: 'Bangalore',
      vendor: priya._id,
    },
    {
      title: 'Reception Catering (100 guests)',
      description: 'Elegant reception catering for up to 100 guests featuring North Indian, South Indian, and continental dishes.',
      price: 80000,
      category: 'catering',
      status: 'active',
      location: 'Mumbai',
      vendor: priya._id,
    },

    // Arjun Decoration
    {
      title: 'Bridal Stage Decoration',
      description: 'Luxurious floral bridal stage with fairy lights, draping, and custom backdrop. Transforms your venue into a fairy tale.',
      price: 35000,
      category: 'decoration',
      status: 'active',
      location: 'Jaipur',
      vendor: arjun._id,
    },
    {
      title: 'Mehndi Decor Package',
      description: 'Vibrant mehndi night decoration with colorful flowers, hanging lanterns, tent seating, and photo corner setup.',
      price: 25000,
      category: 'decoration',
      status: 'active',
      location: 'Mumbai',
      vendor: arjun._id,
    },
    {
      title: 'Full Venue Decoration',
      description: 'Complete venue decoration including entrance arch, stage, table centerpieces, and lighting. Premium floral arrangements included.',
      price: 75000,
      category: 'decoration',
      status: 'inactive',
      location: 'Bangalore',
      vendor: arjun._id,
    },
  ]);

  const [weddingPhoto, preWedding, cater200, cater100, bridalStage, mehndiDecor] = services;
  console.log('Services seeded');

  // ─── BOOKINGS ────────────────────────────────────────────────────────────────

  const past = (daysAgo) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d; };
  const future = (daysFromNow) => { const d = new Date(); d.setDate(d.getDate() + daysFromNow); return d; };

  // Future bookings (pass Mongoose validation normally)
  await Booking.insertMany([
    {
      client: aarav._id, vendor: rajesh._id, service: weddingPhoto._id,
      booking_date: future(30), status: 'confirmed', total_amount: weddingPhoto.price,
    },
    {
      client: kavya._id, vendor: priya._id, service: cater200._id,
      booking_date: future(45), status: 'pending', total_amount: cater200.price,
    },
    {
      client: rohan._id, vendor: arjun._id, service: bridalStage._id,
      booking_date: future(20), status: 'pending', total_amount: bridalStage.price,
    },
    {
      client: aarav._id, vendor: arjun._id, service: mehndiDecor._id,
      booking_date: future(15), status: 'cancelled', total_amount: mehndiDecor.price,
    },
    {
      client: kavya._id, vendor: rajesh._id, service: preWedding._id,
      booking_date: future(10), status: 'confirmed', total_amount: preWedding.price,
    },
    {
      client: rohan._id, vendor: priya._id, service: cater100._id,
      booking_date: future(60), status: 'pending', total_amount: cater100.price,
    },
  ]);

  // Past completed bookings — use native driver to bypass the future-date validator
  const now = new Date();
  const pastBookingDocs = [
    { client: aarav._id, vendor: rajesh._id, service: weddingPhoto._id, booking_date: past(60), status: 'completed', total_amount: weddingPhoto.price, createdAt: now, updatedAt: now },
    { client: kavya._id, vendor: arjun._id,  service: bridalStage._id,  booking_date: past(45), status: 'completed', total_amount: bridalStage.price,  createdAt: now, updatedAt: now },
    { client: rohan._id, vendor: rajesh._id, service: preWedding._id,   booking_date: past(30), status: 'completed', total_amount: preWedding.price,   createdAt: now, updatedAt: now },
    { client: aarav._id, vendor: priya._id,  service: cater200._id,     booking_date: past(90), status: 'completed', total_amount: cater200.price,     createdAt: now, updatedAt: now },
    { client: rohan._id, vendor: arjun._id,  service: mehndiDecor._id,  booking_date: past(20), status: 'completed', total_amount: mehndiDecor.price,  createdAt: now, updatedAt: now },
    { client: kavya._id, vendor: priya._id,  service: cater100._id,     booking_date: past(15), status: 'completed', total_amount: cater100.price,     createdAt: now, updatedAt: now },
  ];
  const { insertedIds } = await Booking.collection.insertMany(pastBookingDocs);
  const completedAaravPhoto  = { _id: insertedIds[0] };
  const completedKavyaBridal = { _id: insertedIds[1] };
  const completedRohanPreWed = { _id: insertedIds[2] };
  const completedAaravCater  = { _id: insertedIds[3] };
  const completedRohanMehndi = { _id: insertedIds[4] };
  const completedKavyaCater  = { _id: insertedIds[5] };
  console.log('Bookings seeded');

  // ─── REVIEWS ─────────────────────────────────────────────────────────────────

  await Review.insertMany([
    {
      client: aarav._id,
      service: weddingPhoto._id,
      vendor: rajesh._id,
      booking: completedAaravPhoto._id,
      rating: 5,
      comment: 'Absolutely breathtaking photos! Rajesh captured every precious moment perfectly. The edited album was delivered within a week. Highly recommended!',
    },
    {
      client: kavya._id,
      service: bridalStage._id,
      vendor: arjun._id,
      booking: completedKavyaBridal._id,
      rating: 4,
      comment: 'Beautiful stage decoration! The flowers were fresh and the lighting was magical. Would have given 5 stars but setup took a bit longer than expected.',
    },
    {
      client: rohan._id,
      service: preWedding._id,
      vendor: rajesh._id,
      booking: completedRohanPreWed._id,
      rating: 5,
      comment: 'The pre-wedding shoot was a dream come true! Professional team, great locations. Every photo looks like a magazine cover.',
    },
    {
      client: aarav._id,
      service: cater200._id,
      vendor: priya._id,
      booking: completedAaravCater._id,
      rating: 4,
      comment: 'Food was excellent and guests loved the live chaat station. Staff was courteous and professional. Great value for the price!',
    },
    {
      client: rohan._id,
      service: mehndiDecor._id,
      vendor: arjun._id,
      booking: completedRohanMehndi._id,
      rating: 5,
      comment: 'The mehndi decoration was stunning! So vibrant and colorful. The photo corner was a huge hit with the guests. Will book again!',
    },
    {
      client: kavya._id,
      service: cater100._id,
      vendor: priya._id,
      booking: completedKavyaCater._id,
      rating: 3,
      comment: 'Food quality was good but a few dishes were served cold. The dessert section was the highlight. Average overall.',
    },
  ]);
  console.log('Reviews seeded');

  // Update avg_rating and review_count on each reviewed service
  for (const serviceId of [weddingPhoto._id, preWedding._id, cater200._id, cater100._id, bridalStage._id, mehndiDecor._id]) {
    const reviews = await Review.find({ service: serviceId });
    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Service.findByIdAndUpdate(serviceId, {
        avg_rating: Math.round(avg * 10) / 10,
        review_count: reviews.length,
      });
    }
  }
  console.log('Service ratings updated');

  // ─── SUMMARY ─────────────────────────────────────────────────────────────────

  console.log('\n========== SEED COMPLETE ==========');
  console.log('ADMIN:');
  console.log('  Email    : admin@shadiseva.com');
  console.log('  Password : Admin@123');
  console.log('\nVENDORS (verified):');
  console.log('  rajesh@vendor.com / Vendor@123  (Photography - Mumbai/Delhi)');
  console.log('  priya@vendor.com  / Vendor@123  (Catering - Bangalore/Mumbai)');
  console.log('  arjun@vendor.com  / Vendor@123  (Decoration - Jaipur/Mumbai)');
  console.log('\nVENDOR (unverified — needs admin approval):');
  console.log('  meera@vendor.com  / Vendor@123');
  console.log('\nCLIENTS:');
  console.log('  aarav@client.com  / Client@123');
  console.log('  kavya@client.com  / Client@123');
  console.log('  rohan@client.com  / Client@123');
  console.log('====================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
