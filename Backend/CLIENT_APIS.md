# Client APIs Documentation

This document describes all the APIs available for individual clients in the ShadiSeva application.

## Base URL
```
http://localhost:5000/api/client
```

## Authentication
All client APIs require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Get Logged-in User Profile
**GET** `/profile`

Returns the profile information of the currently authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "client",
      "created_at": "2023-09-06T10:30:00.000Z",
      "updated_at": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 2. Get All Bookings for Logged-in Client
**GET** `/bookings`

Returns all bookings made by the authenticated client.

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "booking_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "service": {
          "service_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "title": "Wedding Photography",
          "description": "Professional wedding photography services",
          "price": 5000,
          "category": "photography",
          "images": ["image1.jpg", "image2.jpg"]
        },
        "vendor": {
          "vendor_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "full_name": "Photo Studio Pro",
          "email": "studio@example.com",
          "phone": "9876543210"
        },
        "booking_date": "2023-12-25T10:00:00.000Z",
        "status": "pending",
        "total_amount": 5000,
        "created_at": "2023-09-06T10:30:00.000Z",
        "updated_at": "2023-09-06T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Cancel Booking
**PATCH** `/bookings/:bookingId/cancel`

Cancels a pending booking. Only pending status bookings can be cancelled.

**Parameters:**
- `bookingId` (path): ID of the booking to cancel

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "status": "cancelled",
    "updated_at": "2023-09-06T10:30:00.000Z"
  }
}
```

**Error Response (if booking is not pending):**
```json
{
  "success": false,
  "message": "Only pending bookings can be cancelled"
}
```

### 4. Get All Services with Filtering
**GET** `/services`

Returns all active services with advanced filtering options.

**Query Parameters:**
- `category` (optional): Filter by service category
- `location` (optional): Filter by service location
- `search` (optional): Search in title and description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `vendor` (optional): Filter by specific vendor ID

**Example Request:**
```
GET /api/client/services?category=photography&location=mumbai&minPrice=1000&maxPrice=10000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "service_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "title": "Wedding Photography",
        "description": "Professional wedding photography services",
        "price": 5000,
        "category": "photography",
        "location": "Mumbai",
        "images": ["image1.jpg", "image2.jpg"],
        "vendor": {
          "vendor_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "full_name": "Photo Studio Pro",
          "email": "studio@example.com",
          "phone": "9876543210"
        },
        "status": "active",
        "created_at": "2023-09-06T10:30:00.000Z",
        "updated_at": "2023-09-06T10:30:00.000Z"
      }
    ]
  }
}
```

### 5. Book a Service
**POST** `/book-service`

Books a service with a specific vendor.

**Request Body:**
```json
{
  "serviceId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "vendorId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "bookingDate": "2023-12-25T10:00:00.000Z",
  "totalAmount": 5000
}
```

**Required Fields:**
- `serviceId`: ID of the service to book
- `vendorId`: ID of the vendor providing the service
- `bookingDate`: Date and time for the booking (must be in the future)

**Optional Fields:**
- `totalAmount`: Custom amount (if not provided, uses service price)

**Response:**
```json
{
  "success": true,
  "message": "Service booked successfully",
  "data": {
    "booking": {
      "booking_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "service": {
        "service_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "title": "Wedding Photography",
        "description": "Professional wedding photography services",
        "price": 5000,
        "category": "photography"
      },
      "vendor": {
        "vendor_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "full_name": "Photo Studio Pro",
        "email": "studio@example.com",
        "phone": "9876543210"
      },
      "booking_date": "2023-12-25T10:00:00.000Z",
      "status": "pending",
      "total_amount": 5000,
      "created_at": "2023-09-06T10:30:00.000Z",
      "updated_at": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

**Error Response (if booking date is in the past):**
```json
{
  "success": false,
  "message": "Booking date must be in the future"
}
```

### 6. Update User Profile
**PUT** `/profile`

Updates the profile information of the authenticated user.

**Request Body:**
```json
{
  "full_name": "John Smith",
  "phone": "1234567890",
  "password": "newpassword123"
}
```

**All fields are optional.** Only provide the fields you want to update. **Note: Email cannot be updated for security reasons.**

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "full_name": "John Smith",
      "email": "johnsmith@example.com",
      "phone": "1234567890",
      "role": "client",
      "created_at": "2023-09-06T10:30:00.000Z",
      "updated_at": "2023-09-06T10:35:00.000Z"
    }
  }
}
```

**Note:** Email field cannot be updated for security reasons. If you need to change your email, please contact support.

## Error Responses

All APIs return consistent error responses:

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Error message 1", "Error message 2"]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "No token provided"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details"
}
```

## Usage Examples

### Using cURL

1. **Get User Profile:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/client/profile
```

2. **Book a Service:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"serviceId":"64f8a1b2c3d4e5f6a7b8c9d1","vendorId":"64f8a1b2c3d4e5f6a7b8c9d2","bookingDate":"2023-12-25T10:00:00.000Z"}' \
     http://localhost:5000/api/client/book-service
```

3. **Get Services with Filters:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:5000/api/client/services?category=photography&location=mumbai&minPrice=1000&maxPrice=10000"
```

### Using JavaScript/Fetch

```javascript
const token = 'YOUR_JWT_TOKEN';
const baseUrl = 'http://localhost:5000/api/client';

// Get user profile
const getProfile = async () => {
  const response = await fetch(`${baseUrl}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// Book a service
const bookService = async (serviceData) => {
  const response = await fetch(`${baseUrl}/book-service`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(serviceData)
  });
  const data = await response.json();
  return data;
};
```

## Notes

1. **Authentication Required**: All endpoints require a valid JWT token in the Authorization header.
2. **Role Restriction**: These APIs are designed for clients. Vendors and admins can also use them if they have client accounts.
3. **Data Validation**: All input data is validated according to the model schemas.
4. **Error Handling**: Comprehensive error handling with meaningful error messages.
5. **Filtering**: Advanced filtering options for services including category, location, price range, and search.
6. **Vendor Verification**: Only services from verified vendors are displayed and can be booked.
7. **Unified Profile Update**: Profile updates use the same endpoint (`/api/auth/profile`) for all user roles.
