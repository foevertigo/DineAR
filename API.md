# API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require a `Bearer` token in the `Authorization` header.

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": "error message" // Only on errors
}
```

## Rate Limits

- **Global:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 5 requests per 15 minutes per IP
- **Dish endpoints:** 30 requests per 15 minutes per IP

Rate limit exceeded returns `429` with `Retry-After` header.

---

## Authentication

### POST /auth/signup

Create a new user account.

**Rate Limit:** 5 requests / 15 min

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Validation:**
- Email: Valid format, max 255 chars
- Password: Min 8 chars, must contain 1 letter and 1 number

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

**Errors:**
- `409 Conflict` - Email already registered
- `400 Bad Request` - Validation failed

---

### POST /auth/login

Login to existing account.

**Rate Limit:** 5 requests / 15 min

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

---

### GET /auth/me

Get current user information.

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid/expired token

---

### POST /auth/logout

Logout (client-side operation, token should be removed client-side).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Dishes

### GET /dishes

Get all dishes for authenticated user (paginated).

**Auth Required:** Yes  
**Rate Limit:** 30 requests / 15 min

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20, max 100

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "dishes": [
      {
        "_id": "dish_id",
        "userId": "user_id",
        "name": "Spicy Ramen",
        "plateSize": "medium",
        "thumbnailUrl": "http://localhost:5000/uploads/image.jpg",
        "modelUrl": "http://localhost:5000/uploads/image.jpg",
        "qrUrl": "data:image/png;base64,...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

### GET /dishes/:id

Get single dish by ID (public for AR viewing).

**Auth Required:** No

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "dish": {
      "_id": "dish_id",
      "name": "Spicy Ramen",
      "plateSize": "medium",
      "thumbnailUrl": "http://localhost:5000/uploads/image.jpg",
      "modelUrl": "http://localhost:5000/uploads/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors:**
- `404 Not Found` - Dish doesn't exist
- `400 Bad Request` - Invalid ID format

---

### POST /dishes

Create a new dish with image upload.

**Auth Required:** Yes  
**Rate Limit:** 30 requests / 15 min

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `name` (required): Dish name, 1-100 chars
- `plateSize` (optional): "small", "medium", or "large", default "medium"
- `image` (required): Image file, max 5MB, JPEG/PNG/WebP only

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "dish": {
      "_id": "dish_id",
      "name": "Spicy Ramen",
      "plateSize": "medium",
      "thumbnailUrl": "http://localhost:5000/uploads/image.jpg",
      "modelUrl": "http://localhost:5000/uploads/image.jpg",
      "qrUrl": "data:image/png;base64,...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors:**
- `400 Bad Request` - Missing image or validation failed
- `413 Payload Too Large` - File size exceeded

---

### PUT /dishes/:id

Update an existing dish.

**Auth Required:** Yes  
**Rate Limit:** 30 requests / 15 min

**Content-Type:** `multipart/form-data`

**Form Fields (all optional):**
- `name`: Updated dish name
- `plateSize`: Updated plate size
- `image`: New image file

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "dish": { ... }
  }
}
```

**Errors:**
- `404 Not Found` - Dish doesn't exist
- `403 Forbidden` - Not the dish owner
- `400 Bad Request` - Validation failed

---

### DELETE /dishes/:id

Delete a dish.

**Auth Required:** Yes  
**Rate Limit:** 30 requests / 15 min

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Dish deleted successfully"
}
```

**Errors:**
- `404 Not Found` - Dish doesn't exist
- `403 Forbidden` - Not the dish owner

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // Optional, for validation errors
}
```

### Common Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Not authorized for this resource
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Authentication Header

Include JWT token in requests:

```
Authorization: Bearer <your_jwt_token>
```

Example with curl:
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:5000/api/dishes
```

Example with Axios:
```javascript
axios.get('/dishes', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```
