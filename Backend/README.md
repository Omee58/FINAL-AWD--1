# 💍 Wedding Planning Website – Backend (Private Notes)

This backend powers the **Wedding Planning Website**, a final year project for Advanced Web Development. It connects clients with vendors (called Vanders) offering services for Indian weddings such as venues, photography, catering, decoration, pandits, and more.

---

## 🔧 Core Features

### 👤 User System

- Role-based access: `Client`, `Vander`, `Admin`
- JWT-based login and registration
- Password encryption using `bcryptjs`
- Admin approval system for Vanders

### 🧑‍💼 Vander Module

- Create/update/delete service listings
- Categories: Venue, Catering, Photography, Pandit, Mehendi, Band, Car, Decoration, Event Manager, etc.
- View inquiries from clients
- View bookings made for their services

### 👰 Client Module

- Browse/search vendor services by category and city
- View vendor profile and service details
- Send inquiry messages to vendors
- Make a booking for a selected service
- View and cancel own bookings

### 🧑‍⚖️ Admin Module

- Approve or reject Vanders
- View all users and services
- Remove abusive users or vendors

### 📩 Inquiries System

- Client sends message to vendor
- Vendor can respond and mark as replied
- Admin can optionally monitor inquiry logs

### 📑 Booking System

- Clients can book a service
- Each booking links a client, vendor, and service
- Status: `pending`, `confirmed`, `cancelled`

### 📂 Additional Functionalities

- REST API with proper route separation
- Middleware for auth, logging, and error handling
- Centralized `.env` config with port, DB URI, and secret
- Morgan logger for request logging

---

## 🧠 Backend Components

### 📁 Folder Structure

```
backend/
├── models/          # Mongoose schemas
├── controllers/     # Logic for each route
├── routes/          # API endpoints
├── middleware/      # Auth, error handling
├── utils/           # Utility functions
├── uploads/         # Image storage (optional)
├── .env             # Config variables
├── app.js           # Express config
└── server.js        # Server init
```

### 🧾 Models

- **User**: name, email, password, role, isApproved
- **Service**: title, category, price, description, vendor (ref), imageUrl
- **Booking**: client (ref), vendor (ref), service (ref), status
- **Inquiry**: user (ref), vendor (ref), message, replyMessage, replied

---

## 📡 API Routes

### Auth (`/api/auth`)

- POST `/register`
- POST `/login`

### Services (via `/api/vendor` and `/api/client`)

- **Vendor Operations**: Create, update, delete services via `/api/vendor/services`
- **Client Operations**: Browse and filter services via `/api/client/services`
- **Public Access**: View individual services via `/api/vendor/services/:id`

### Inquiries (`/api/inquiries`)

- POST `/` – client sends inquiry
- GET `/user` – client's inquiries
- GET `/vendor` – vendor's inquiries
- PUT `/reply/:id` – vendor replies

### Bookings (`/api/bookings`)

- POST `/` – client books
- GET `/user` – client's bookings
- GET `/vendor` – vendor's bookings
- PUT `/:id/cancel`

### Admin (`/api/admin`)

- GET `/users` – all users
- PUT `/approve-vendor/:id`
- DELETE `/user/:id`

---

## 🔗 Flow Summary

```
Client --> Register/Login --> JWT Token
Client --> Browse Services --> Book / Send Inquiry
Vander --> Login --> Add Service --> View Inquiries & Bookings
Admin --> Manage Users & Vanders
```

---

## 🔒 Authentication

- JWT tokens issued on login
- Protected routes using `authMiddleware`
- Roles checked for vendor/admin actions

---

## 📦 Dev Dependencies

| Package       | Use                      |
| ------------- | ------------------------ |
| express       | Server                   |
| mongoose      | MongoDB ORM              |
| bcryptjs      | Password hashing         |
| jsonwebtoken  | Auth tokens              |
| morgan        | Request logs             |
| dotenv        | Env variables            |
| cors          | CORS headers             |
| cookie-parser | Read cookies             |
| debug         | Server debugging         |
| nodemailer    | (optional) Email support |

---

## 🧪 Tools Used

- **MongoDB Compass** – DB GUI
- **Postman** – API Testing
- **Nodemon** – Dev server

---

## ✅ To Do (If Time Permits)

- Add Review/Rating model
- Allow image uploads (Cloudinary or Multer)
- Client-side dashboard (React)
- Search/filter improvements

---

## 🧠 Internal Notes

- Avoid frontend code in this file.
- Don’t expose `.env` or secrets.
- Focus on backend modularity and security.
- Log important events with `debug()`.
- Use `.populate()` for vendor/user details on service/booking.

---

**This markdown is for my reference only.**

