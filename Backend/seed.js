const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/user.model');
const Service = require('./models/service.model');
const Booking = require('./models/booking.model');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');

  // Clear existing data
  await User.deleteMany({});
  await Service.deleteMany({});
  await Booking.deleteMany({});
  console.log('Existing data cleared');

  const hash = (pwd) => bcrypt.hash(pwd, 10);

  // ─── USERS ───────────────────────────────────────────────────────────────────

  const users = await User.insertMany([
    // Admin
    {
      full_name: 'Admin User',
      email: 'admin@shadiseva.com',
      phone: '03001234567',
      password: await hash('Admin@123'),
      role: 'admin',
      verified: true,
    },

    // Vendors (verified)
    {
      full_name: 'Ravi Photography',
      email: 'ravi@vendor.com',
      phone: '03011234567',
      password: await hash('Vendor@123'),
      role: 'vendor',
      verified: true,
    },
    {
      full_name: 'Sana Catering',
      email: 'sana@vendor.com',
      phone: '03021234567',
      password: await hash('Vendor@123'),
      role: 'vendor',
      verified: true,
    },
    {
      full_name: 'Ali Decoration',
      email: 'ali@vendor.com',
      phone: '03031234567',
      password: await hash('Vendor@123'),
      role: 'vendor',
      verified: true,
    },

    // Vendor (unverified — to test admin approval flow)
    {
      full_name: 'Fatima Events',
      email: 'fatima@vendor.com',
      phone: '03041234567',
      password: await hash('Vendor@123'),
      role: 'vendor',
      verified: false,
    },

    // Clients
    {
      full_name: 'Ahmed Khan',
      email: 'ahmed@client.com',
      phone: '03051234567',
      password: await hash('Client@123'),
      role: 'client',
      verified: true,
    },
    {
      full_name: 'Sara Malik',
      email: 'sara@client.com',
      phone: '03061234567',
      password: await hash('Client@123'),
      role: 'client',
      verified: true,
    },
    {
      full_name: 'Bilal Ahmed',
      email: 'bilal@client.com',
      phone: '03071234567',
      password: await hash('Client@123'),
      role: 'client',
      verified: true,
    },
  ]);

  const [admin, ravi, sana, ali, fatima, ahmed, sara, bilal] = users;
  console.log('Users seeded');

  // ─── SERVICES ────────────────────────────────────────────────────────────────

  const services = await Service.insertMany([
    // Ravi Photography
    {
      title: 'Wedding Photography',
      description: 'Full-day professional wedding photography with edited album.',
      price: 50000,
      category: 'photography',
      status: 'active',
      location: 'Karachi',
      vendor: ravi._id,
    },
    {
      title: 'Pre-Wedding Shoot',
      description: 'Outdoor pre-wedding photoshoot with 50 edited photos.',
      price: 20000,
      category: 'photography',
      status: 'active',
      location: 'Lahore',
      vendor: ravi._id,
    },

    // Sana Catering
    {
      title: 'Wedding Catering (200 guests)',
      description: 'Full wedding catering service for 200 guests with 3-course meal.',
      price: 150000,
      category: 'catering',
      status: 'active',
      location: 'Islamabad',
      vendor: sana._id,
    },
    {
      title: 'Walima Catering (100 guests)',
      description: 'Catering service for walima function up to 100 guests.',
      price: 80000,
      category: 'catering',
      status: 'active',
      location: 'Karachi',
      vendor: sana._id,
    },

    // Ali Decoration
    {
      title: 'Bridal Stage Decoration',
      description: 'Floral bridal stage with fairy lights and backdrop.',
      price: 35000,
      category: 'decoration',
      status: 'active',
      location: 'Lahore',
      vendor: ali._id,
    },
    {
      title: 'Mehndi Decor Package',
      description: 'Colorful mehndi night decoration with tent and flowers.',
      price: 25000,
      category: 'decoration',
      status: 'active',
      location: 'Karachi',
      vendor: ali._id,
    },
    {
      title: 'Full Venue Decoration',
      description: 'Complete venue decoration including entrance, stage, and tables.',
      price: 75000,
      category: 'decoration',
      status: 'inactive',
      location: 'Islamabad',
      vendor: ali._id,
    },
  ]);

  const [weddingPhoto, preWedding, cater200, cater100, bridalStage, mehndiDecor] = services;
  console.log('Services seeded');

  // ─── BOOKINGS ────────────────────────────────────────────────────────────────

  const future = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d;
  };

  await Booking.insertMany([
    {
      client: ahmed._id,
      vendor: ravi._id,
      service: weddingPhoto._id,
      booking_date: future(30),
      status: 'confirmed',
      total_amount: weddingPhoto.price,
    },
    {
      client: sara._id,
      vendor: sana._id,
      service: cater200._id,
      booking_date: future(45),
      status: 'pending',
      total_amount: cater200.price,
    },
    {
      client: bilal._id,
      vendor: ali._id,
      service: bridalStage._id,
      booking_date: future(20),
      status: 'pending',
      total_amount: bridalStage.price,
    },
    {
      client: ahmed._id,
      vendor: ali._id,
      service: mehndiDecor._id,
      booking_date: future(15),
      status: 'cancelled',
      total_amount: mehndiDecor.price,
    },
    {
      client: sara._id,
      vendor: ravi._id,
      service: preWedding._id,
      booking_date: future(10),
      status: 'confirmed',
      total_amount: preWedding.price,
    },
    {
      client: bilal._id,
      vendor: sana._id,
      service: cater100._id,
      booking_date: future(60),
      status: 'pending',
      total_amount: cater100.price,
    },
  ]);

  console.log('Bookings seeded');

  // ─── SUMMARY ─────────────────────────────────────────────────────────────────

  console.log('\n========== SEED COMPLETE ==========');
  console.log('ADMIN:');
  console.log('  Email    : admin@shadiseva.com');
  console.log('  Password : Admin@123');
  console.log('\nVENDORS (verified):');
  console.log('  ravi@vendor.com  / Vendor@123  (Photography)');
  console.log('  sana@vendor.com  / Vendor@123  (Catering)');
  console.log('  ali@vendor.com   / Vendor@123  (Decoration)');
  console.log('\nVENDOR (unverified — needs admin approval):');
  console.log('  fatima@vendor.com / Vendor@123');
  console.log('\nCLIENTS:');
  console.log('  ahmed@client.com / Client@123');
  console.log('  sara@client.com  / Client@123');
  console.log('  bilal@client.com / Client@123');
  console.log('====================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
