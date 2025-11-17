# Vendor APIs Documentation

This document describes all the APIs available for individual vendors in the ShadiSeva application.

## Base URL
```
http://localhost:5000/api/vendor
```

## ⚠️ IMPORTANT: Vendor Verification Required

**ALL vendor operations require admin verification before access is granted.**
- New vendors are created with `verified: false` by default
- Unverified vendors cannot access ANY functionality
- Only admins can change verification status to `verified: true`
- This ensures platform quality and security

## Authentication & Authorization
All vendor APIs require:
1. **Authentication**: Valid JWT token in the Authorization header
2. **Authorization**: User must have 'vendor' role
3. **Verification**: User account must be verified by admin (`verified: true`)

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Get Logged-in Vendor Profile
**GET** `/profile`

Returns the profile information of the currently authenticated vendor.

**Response:**
```json
{
  "success": true,
  "data": {
    "vendor": {
      "vendor_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "full_name": "Photo Studio Pro",
      "email": "studio@example.com",
      "phone": "9876543210",
      "role": "vendor",
      "created_at": "2023-09-06T10:30:00.000Z",
      "updated_at": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 2. Get Booking Requests (Pending Bookings)
**GET** `/booking-requests`

Returns all pending booking requests for the vendor's dashboard to accept/reject.

**Response:**
```json
{
  "success": true,
  "data": {
    "pending_bookings": [
      {
        "booking_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "client": {
          "client_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "full_name": "John Doe",
          "email": "john@example.com",
          "phone": "1234567890"
        },
        "service": {
          "service_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "title": "Wedding Photography",
          "description": "Professional wedding photography services",
          "price": 5000,
          "category": "photography",
          "images": ["image1.jpg", "image2.jpg"]
        },
        "booking_date": "2023-12-25T10:00:00.000Z",
        "total_amount": 5000,
        "created_at": "2023-09-06T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Get Booked Services (Current/Future Bookings)
**GET** `/booked-services`

Returns all current and future bookings for the vendor's services.

**Response:**
```json
{
  "success": true,
  "data": {
    "booked_services": [
      {
        "booking_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "client": {
          "client_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "full_name": "John Doe",
          "email": "john@example.com",
          "phone": "1234567890"
        },
        "service": {
          "service_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "title": "Wedding Photography",
          "description": "Professional wedding photography services",
          "price": 5000,
          "category": "photography",
          "images": ["image1.jpg", "image2.jpg"]
        },
        "booking_date": "2023-12-25T10:00:00.000Z",
        "status": "confirmed",
        "total_amount": 5000,
        "created_at": "2023-09-06T10:30:00.000Z"
      }
    ]
  }
}
```

### 4. Add New Service
**POST** `/services`

Creates a new service for the vendor.

**Request Body:**
```json
{
  "title": "Wedding Photography",
  "description": "Professional wedding photography services with high-quality equipment",
  "price": 5000,
  "category": "photography",
  "location": "Mumbai",
  "images": ["image1.jpg", "image2.jpg"]
}
```

**Required Fields:**
- `title`: Service title (max 100 characters)
- `description`: Service description (max 1000 characters)
- `price`: Service price (must be > 0)
- `category`: Service category
- `location`: Service location

**Optional Fields:**
- `images`: Array of image URLs

**Response:**
```json
{
  "success": true,
  "message": "Service added successfully",
  "data": {
    "service": {
      "service_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "title": "Wedding Photography",
      "description": "Professional wedding photography services with high-quality equipment",
      "price": 5000,
      "category": "photography",
      "location": "Mumbai",
      "images": ["image1.jpg", "image2.jpg"],
      "status": "active",
      "vendor": "64f8a1b2c3d4e5f6a7b8c9d0",
      "created_at": "2023-09-06T10:30:00.000Z",
      "updated_at": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 5. Get Vendor's Services
**GET** `/my-services`

Returns all services created by the authenticated vendor.

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "service_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "title": "Wedding Photography",
        "description": "Professional wedding photography services",
        "price": 5000,
        "category": "photography",
        "location": "Mumbai",
        "images": ["image1.jpg", "image2.jpg"],
        "status": "active",
        "created_at": "2023-09-06T10:30:00.000Z",
        "updated_at": "2023-09-06T10:30:00.000Z"
      }
    ]
  }
}
```

### 6. Change Booking Status
**PATCH** `/bookings/:bookingId/status`

Allows vendors to change the status of their bookings.

**Parameters:**
- `bookingId` (path): ID of the booking to update

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending` → `confirmed` or `cancelled`
- `confirmed` → `completed` or `cancelled`
- `completed` → Cannot change
- `cancelled` → Cannot change

**Response:**
```json
{
  "success": true,
  "message": "Booking status changed to confirmed successfully",
  "data": {
    "booking_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "status": "confirmed",
    "updated_at": "2023-09-06T10:35:00.000Z"
  }
}
```

**Error Response (invalid status transition):**
```json
{
  "success": false,
  "message": "Cannot change status from completed to confirmed"
}
```

### 7. Update Service
**PUT** `/services/:serviceId`

Updates an existing service owned by the vendor.

**Parameters:**
- `serviceId` (path): ID of the service to update

**Request Body:**
```json
{
  "title": "Premium Wedding Photography",
  "price": 6000,
  "status": "active"
}
```

**All fields are optional.** Only provide the fields you want to update.

**Response:**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "service": {
      "service_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "title": "Premium Wedding Photography",
      "description": "Professional wedding photography services",
      "price": 6000,
      "category": "photography",
      "location": "Mumbai",
      "images": ["image1.jpg", "image2.jpg"],
      "status": "active",
      "vendor": "64f8a1b2c3d4e5f6a7b8c9d0",
      "created_at": "2023-09-06T10:30:00.000Z",
      "updated_at": "2023-09-06T10:35:00.000Z"
    }
  }
}
```

### 8. Get Individual Service by ID (Public)
**GET** `/services/:serviceId`

Returns details of a specific service. This endpoint is public (no authentication required).

**Parameters:**
- `serviceId` (path): ID of the service to retrieve

**Response:**
```json
{
  "success": true,
  "data": {
    "service": {
      "service_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "title": "Wedding Photography",
      "description": "Professional wedding photography services",
      "price": 5000,
      "category": "photography",
      "location": "Mumbai",
      "images": ["image1.jpg", "image2.jpg"],
      "status": "active",
      "vendor": {
        "vendor_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "full_name": "Photo Studio Pro",
        "email": "studio@example.com",
        "phone": "9876543210"
      },
      "created_at": "2023-09-06T10:30:00.000Z",
      "updated_at": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 9. Delete Service
**DELETE** `/services/:serviceId`

Deletes a service owned by the vendor. Cannot delete if there are active bookings.

**Parameters:**
- `serviceId` (path): ID of the service to delete

**Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

**Error Response (if service has active bookings):**
```json
{
  "success": false,
  "message": "Cannot delete service with active bookings. Please cancel all bookings first."
}
```

### 10. Update Profile (Unified for All Users)
**PUT** `/profile`

Updates the profile information of the authenticated user. This endpoint works for all user roles (clients, vendors, admins).

**Request Body:**
```json
{
  "full_name": "Premium Photo Studio",
  "phone": "9876543210",
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
      "full_name": "Premium Photo Studio",
      "email": "studio@example.com",
      "phone": "9876543210",
      "role": "vendor",
      "created_at": "2023-09-06T10:30:00.000Z",
      "updated_at": "2023-12-25T12:35:00.000Z"
    }
  }
}
```

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

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Vendor role required."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Service not found"
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

1. **Get Vendor Profile:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/vendor/profile
```

2. **Add New Service:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Wedding Photography","description":"Professional services","price":5000,"category":"photography","location":"Mumbai"}' \
     http://localhost:5000/api/vendor/services
```

3. **Change Booking Status:**
```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status":"confirmed"}' \
     http://localhost:5000/api/vendor/bookings/64f8a1b2c3d4e5f6a7b8c9d0/status
```

4. **Get Public Service:**
```bash
curl http://localhost:5000/api/vendor/services/64f8a1b2c3d4e5f6a7b8c9d2
```

### Using JavaScript/Fetch

```javascript
const token = 'YOUR_JWT_TOKEN';
const baseUrl = 'http://localhost:5000/api/vendor';

// Get vendor profile
const getProfile = async () => {
  const response = await fetch(`${baseUrl}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// Add new service
const addService = async (serviceData) => {
  const response = await fetch(`${baseUrl}/services`, {
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

// Change booking status
const changeBookingStatus = async (bookingId, status) => {
  const response = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  const data = await response.json();
  return data;
};
```

## Business Logic & Rules

### Booking Status Transitions
- **Pending** → **Confirmed** or **Cancelled** (by vendor)
- **Confirmed** → **Completed** or **Cancelled** (by vendor)
- **Completed** → Cannot change (final state)
- **Cancelled** → Cannot change (final state)

### Service Management
- Vendors can only manage their own services
- Services cannot be deleted if they have active bookings
- Service status can be toggled between 'active' and 'inactive'

### Security Features
- All endpoints require authentication (JWT token)
- All endpoints require vendor role verification
- Vendors can only access their own data
- Email field is protected from updates

## Notes

1. **Authentication Required**: All endpoints (except public service view) require a valid JWT token.
2. **Vendor Role Required**: All endpoints require the user to have 'vendor' role.
3. **Vendor Verification Required**: **ALL vendor operations require the account to be verified by an admin.**
4. **Complete Access Restriction**: Unverified vendors cannot access ANY functionality including profile, services, or bookings.
5. **Data Ownership**: Verified vendors can only access and modify their own services and bookings.
6. **Business Rules**: Strict status transition rules prevent invalid booking state changes.
7. **Public Access**: Individual service details are publicly accessible for client browsing.
8. **Data Validation**: Comprehensive input validation for all service and profile updates.
9. **Error Handling**: Detailed error messages for better debugging and user experience.
10. **Unified Profile Update**: Profile updates use the same endpoint (`/api/auth/profile`) for all user roles.
