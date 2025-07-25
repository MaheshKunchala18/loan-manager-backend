# CreditSea API Documentation

## Overview
RESTful API for CreditSea loan management system with role-based authentication.

**Base URL:** `http://localhost:5000/api`

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles
- **User**: Can apply for loans and view own applications
- **Verifier**: Can verify/reject loan applications + all user permissions
- **Admin**: Can approve/reject applications and manage users + all verifier permissions

## Default Accounts (Development)
- **Admin**: `admin@creditsea.com` / `Admin123!`
- **Verifier**: `verifier@creditsea.com` / `Verifier123!`
- **Users**: `user1@example.com` / `User123!`, `user2@example.com` / `User123!`

---

## Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
```
**Body:**
```json
{
  "firstName": "UpdatedFirstName",
  "lastName": "UpdatedLastName"
}
```

---

### Loan Routes (`/api/loans`)

#### Create Loan Application
```http
POST /api/loans
Authorization: Bearer <token>
```
**Body:**
```json
{
  "applicantFirstName": "John",
  "applicantLastName": "Doe",
  "employmentStatus": "employed",
  "employmentAddress": "123 Tech Street, San Francisco, CA",
  "reasonForLoan": "Home renovation and improvement",
  "loanAmount": 250000
}
```

#### Get User's Applications
```http
GET /api/loans/my-applications
Authorization: Bearer <token>
```

#### Get All Applications (Verifier/Admin)
```http
GET /api/loans?page=1&limit=10&status=pending&search=john
Authorization: Bearer <token>
```

#### Get Single Application
```http
GET /api/loans/:applicationId
Authorization: Bearer <token>
```

#### Verify Application (Verifier/Admin)
```http
PUT /api/loans/:applicationId/verify
Authorization: Bearer <token>
```
**Body:**
```json
{
  "action": "verify",
  "comments": "All documents verified successfully"
}
```

#### Approve Application (Admin)
```http
PUT /api/loans/:applicationId/approve
Authorization: Bearer <token>
```
**Body:**
```json
{
  "action": "approve",
  "comments": "Loan approved for disbursement"
}
```

---

### Dashboard Routes (`/api/dashboard`)

#### Get Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

#### Get Monthly Metrics
```http
GET /api/dashboard/metrics
Authorization: Bearer <token>
```

#### Get Recent Loans
```http
GET /api/dashboard/recent-loans?limit=5
Authorization: Bearer <token>
```

#### Get User Dashboard
```http
GET /api/dashboard/user
Authorization: Bearer <token>
```

---

### Admin Routes (`/api/admin`)

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10&role=user&search=john
Authorization: Bearer <token>
```

#### Create Admin
```http
POST /api/admin/create-admin
Authorization: Bearer <token>
```
**Body:**
```json
{
  "email": "newadmin@creditsea.com",
  "password": "Admin123!",
  "firstName": "New",
  "lastName": "Admin"
}
```

#### Create Verifier
```http
POST /api/admin/create-verifier
Authorization: Bearer <token>
```
**Body:**
```json
{
  "email": "newverifier@creditsea.com",
  "password": "Verifier123!",
  "firstName": "New",
  "lastName": "Verifier"
}
```

#### Update User
```http
PUT /api/admin/users/:userId
Authorization: Bearer <token>
```
**Body:**
```json
{
  "role": "verifier",
  "isActive": true
}
```

#### Delete User
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <token>
```

#### Get System Stats
```http
GET /api/admin/stats
Authorization: Bearer <token>
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized / Invalid Token
- `403` - Forbidden / Insufficient Permissions
- `404` - Not Found
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

## Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

## Success Response Format
```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

## Loan Application Statuses
- `pending` - Newly submitted, awaiting verification
- `verified` - Verified by verifier, awaiting admin approval
- `approved` - Approved by admin for disbursement
- `rejected` - Rejected at any stage

## Employment Status Options
- `employed`
- `self-employed`
- `unemployed`
- `student`
- `retired` 