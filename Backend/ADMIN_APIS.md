# Admin APIs Documentation

This document describes all the APIs available for administrators in the ShadiSeva application.

## Base URL
```
http://localhost:5000/api/admin
```

## Authentication & Authorization
All admin APIs require:
1. **Authentication**: Valid JWT token in the Authorization header
2. **Authorization**: User must have 'admin' role

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Get Logged-in Admin Profile
**GET** `/profile`

Returns the profile information of the currently authenticated admin.

**Response:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "admin_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "full_name": "Admin User",
      "email": "admin@shadiseva.com",
      "phone": "5555555555",
      "role": "admin",
      "created_at": "2023-09-06T10:30:00.000Z",
      "updated_at": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 2. Get Vendor Requests (Unverified Vendors)
**GET** `/vendor-requests`

Returns all vendor requests that need admin verification (users with role="vendor", verified=false).

**Response:**
```json
{
  "success": true,
  "data": {
    "vendor_requests": [
      {
        "vendor_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "full_name": "Photo Studio Pro",
        "email": "studio@example.com",
        "phone": "9876543210",
        "role": "vendor",
        "verified": false,
        "created_at": "2023-09-06T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Accept Vendor Request
**PATCH** `/vendor-requests/:vendorId/accept`

Accepts a vendor request by setting their verification status to true.

**Parameters:**
- `vendorId` (path): ID of the vendor to verify

**Response:**
```json
{
  "success": true,
  "message": "Vendor request accepted successfully",
  "data": {
    "vendor": {
      "vendor_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "full_name": "Photo Studio Pro",
      "email": "studio@example.com",
      "phone": "9876543210",
      "role": "vendor",
      "verified": true,
      "updated_at": "2023-12-25T12:35:00.000Z"
    }
  }
}
```

**Error Response (if vendor not found or already verified):**
```json
{
  "success": false,
  "message": "Vendor request not found or already verified"
}
```

### 4. Get All Users (Clients and Vendors)
**GET** `/users`

Returns all users in the system with pagination and filtering options.

**Query Parameters:**
- `role` (optional): Filter by user role ('client', 'vendor', 'admin')
- `verified` (optional): Filter by verification status ('true' or 'false')
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of users per page (default: 10)

**Example Requests:**
```
GET /api/admin/users                           // All users
GET /api/admin/users?role=vendor              // Only vendors
GET /api/admin/users?verified=false           // Only unverified users
GET /api/admin/users?role=vendor&verified=false&page=2&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "role": "client",
        "verified": true,
        "created_at": "2023-09-06T10:30:00.000Z",
        "updated_at": "2023-09-06T10:30:00.000Z"
      },
      {
        "user_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "full_name": "Photo Studio Pro",
        "email": "studio@example.com",
        "phone": "9876543210",
        "role": "vendor",
        "verified": false,
        "created_at": "2023-09-06T10:35:00.000Z",
        "updated_at": "2023-09-06T10:35:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_users": 25,
      "users_per_page": 10
    }
  }
}
```

### 5. Get All Bookings (All Statuses)
**GET** `/bookings`

Returns all bookings in the system with pagination and filtering options.

**Query Parameters:**
- `status` (optional): Filter by booking status ('pending', 'confirmed', 'cancelled', 'completed')
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of bookings per page (default: 10)

**Example Requests:**
```
GET /api/admin/bookings                    // All bookings
GET /api/admin/bookings?status=pending    // Only pending bookings
GET /api/admin/bookings?page=2&limit=5   // Pagination
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "booking_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "client": {
          "client_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "full_name": "John Doe",
          "email": "john@example.com",
          "phone": "1234567890"
        },
        "vendor": {
          "vendor_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "full_name": "Photo Studio Pro",
          "email": "studio@example.com",
          "phone": "9876543210"
        },
        "service": {
          "service_id": "64f8a1b2c3d4e5f6a7b8c9d3",
          "title": "Wedding Photography",
          "description": "Professional wedding photography services",
          "price": 5000,
          "category": "photography"
        },
        "booking_date": "2023-12-25T10:00:00.000Z",
        "status": "pending",
        "total_amount": 5000,
        "created_at": "2023-09-06T10:30:00.000Z",
        "updated_at": "2023-09-06T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_bookings": 48,
      "bookings_per_page": 10
    }
  }
}
```

### 6. Update Admin Profile (Unified for All Users)
**PUT** `/profile`

Updates the profile information of the authenticated admin. This endpoint works for all user roles (clients, vendors, admins).

**Request Body:**
```json
{
  "full_name": "Super Admin",
  "phone": "5555555555",
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
      "full_name": "Super Admin",
      "email": "admin@shadiseva.com",
      "phone": "5555555555",
      "role": "admin",
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
  "message": "Access denied. Admin role required."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Vendor request not found or already verified"
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

1. **Get Admin Profile:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/admin/profile
```

2. **Get Vendor Requests:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/admin/vendor-requests
```

3. **Accept Vendor Request:**
```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/admin/vendor-requests/64f8a1b2c3d4e5f6a7b8c9d0/accept
```

4. **Get All Users with Filtering:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:5000/api/admin/users?role=vendor&verified=false&page=1&limit=10"
```

5. **Get All Bookings:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:5000/api/admin/bookings?status=pending&page=1&limit=10"
```

6. **Update Admin Profile:**
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"full_name":"Super Admin","phone":"5555555555"}' \
     http://localhost:5000/api/admin/profile
```

### Using JavaScript/Fetch

```javascript
const token = 'YOUR_JWT_TOKEN';
const baseUrl = 'http://localhost:5000/api/admin';

// Get admin profile
const getProfile = async () => {
  const response = await fetch(`${baseUrl}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// Get vendor requests
const getVendorRequests = async () => {
  const response = await fetch(`${baseUrl}/vendor-requests`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// Accept vendor request
const acceptVendorRequest = async (vendorId) => {
  const response = await fetch(`${baseUrl}/vendor-requests/${vendorId}/accept`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// Get all users with filtering
const getAllUsers = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`${baseUrl}/users?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// Get all bookings with filtering
const getAllBookings = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`${baseUrl}/bookings?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};
```

## Business Logic & Rules

### Vendor Verification System
- **New vendors are created with `verified: false` by default**
- **Only admins can change vendor verification status**
- **Verified vendors can access ALL vendor functionality**
- **Unverified vendors cannot access ANY functionality**:
  - Cannot view profile
  - Cannot create services
  - Cannot manage bookings
  - Cannot access any vendor endpoints
- **Complete access restriction until verification**
- This ensures platform quality and security

### User Management
- Admins can view all users in the system
- Filtering by role and verification status
- Pagination for large user lists
- Sensitive information (passwords) are never exposed

### Booking Oversight
- Admins can view all bookings across the platform
- Filtering by booking status
- Complete booking details including client, vendor, and service information
- Pagination for large booking lists

### Security Features
- All endpoints require authentication (JWT token)
- All endpoints require admin role verification
- Admins can only access system-wide data (no individual user data modification)
- Profile updates use the unified endpoint for consistency

## Notes

1. **Authentication Required**: All endpoints require a valid JWT token.
2. **Admin Role Required**: All endpoints require the user to have 'admin' role.
3. **Vendor Verification**: New vendors must be verified by admins before they can operate.
4. **Data Access**: Admins have read-only access to system data for oversight purposes.
5. **Pagination**: User and booking lists include pagination for performance.
6. **Filtering**: Multiple filter options for efficient data retrieval.
7. **Unified Profile Update**: Profile updates use the same endpoint (`/api/auth/profile`) for all user roles.
8. **No Data Modification**: Admins cannot modify user data except for vendor verification and their own profile.

## Database Schema Updates

The User model has been updated to include a `verified` field:

```javascript
verified: {
  type: Boolean,
  default: function() {
    // Only vendors need verification, clients and admins are verified by default
    return this.role !== 'vendor';
  }
}
```

This ensures that:
- **Clients**: Always verified (verified: true)
- **Vendors**: Need admin verification (verified: false by default)
- **Admins**: Always verified (verified: true)
