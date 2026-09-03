# HMS API Design Specification

**Version:** 1.0  
**Last Updated:** 2026-09-03  
**Base URL:** `http://localhost:8080/api`

---

## API Overview

The HMS API follows RESTful principles with JSON request/response payloads. All endpoints (except authentication) require JWT token authentication via `Authorization` header.

### API Characteristics
- **Style:** RESTful
- **Format:** JSON
- **Authentication:** JWT Bearer Tokens
- **Versioning:** URL-based (api/v1, api/v2, etc.)
- **Pagination:** Supported via query parameters
- **Filtering:** Supported via query parameters

---

## Authentication Endpoints

### Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "doctor@hospital.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "username": "doctor@hospital.com",
    "name": "Dr. John Smith",
    "role": "doctor"
  }
}

Response (401 Unauthorized):
{
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "status": 401
}
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer {token}

Response (200 OK):
{
  "message": "Logged out successfully"
}
```

---

## Patient Endpoints

### List All Patients
```
GET /api/patients
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 0)
- size: number (default: 20)
- search: string (name/email search)
- sort: string (default: id,desc)

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-01-15",
      "gender": "Male",
      "address": "123 Main St",
      "createdAt": "2026-09-01T10:00:00Z",
      "updatedAt": "2026-09-01T10:00:00Z"
    },
    ...
  ],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0,
  "size": 20
}
```

### Get Patient By ID
```
GET /api/patients/{id}
Authorization: Bearer {token}

Response (200 OK):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "address": "123 Main St",
  "medicalHistory": "Previous surgeries, allergies...",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+1987654321",
  "createdAt": "2026-09-01T10:00:00Z",
  "updatedAt": "2026-09-01T10:00:00Z"
}

Response (404 Not Found):
{
  "error": "Not Found",
  "message": "Patient with ID 999 not found",
  "status": 404
}
```

### Create Patient
```
POST /api/patients
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1992-05-20",
  "gender": "Female",
  "address": "456 Oak Ave",
  "medicalHistory": "No known allergies",
  "emergencyContact": "John Smith",
  "emergencyPhone": "+1987654321"
}

Response (201 Created):
{
  "id": 150,
  "name": "Jane Smith",
  "email": "jane@example.com",
  ...
  "createdAt": "2026-09-03T14:30:00Z"
}

Response (400 Bad Request):
{
  "error": "Validation Error",
  "message": "Email already exists",
  "status": 400,
  "field": "email"
}
```

### Update Patient
```
PUT /api/patients/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phoneNumber": "+1234567890",
  "address": "789 Elm St"
}

Response (200 OK):
{
  "id": 1,
  "name": "Jane Smith",
  ...
  "updatedAt": "2026-09-03T14:30:00Z"
}

Response (404 Not Found):
{
  "error": "Not Found",
  "message": "Patient with ID 999 not found",
  "status": 404
}
```

### Delete Patient
```
DELETE /api/patients/{id}
Authorization: Bearer {token}

Response (204 No Content):
(Empty body)

Response (404 Not Found):
{
  "error": "Not Found",
  "message": "Patient with ID 999 not found",
  "status": 404
}
```

---

## Doctor Endpoints

### List All Doctors
```
GET /api/doctors
Authorization: Bearer {token}

Query Parameters:
- page: number
- size: number
- department: string (filter by department)
- specialization: string

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "name": "Dr. Robert Johnson",
      "email": "robert@hospital.com",
      "phoneNumber": "+1234567890",
      "licenseNumber": "LIC123456",
      "specialization": "Cardiology",
      "departmentId": 2,
      "departmentName": "Cardiology Department",
      "qualifications": "MD, Board Certified",
      "createdAt": "2026-09-01T10:00:00Z"
    },
    ...
  ],
  "totalElements": 45,
  "totalPages": 3,
  "currentPage": 0,
  "size": 20
}
```

### Create Doctor
```
POST /api/doctors
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Dr. Sarah Davis",
  "email": "sarah@hospital.com",
  "phoneNumber": "+1234567890",
  "licenseNumber": "LIC789012",
  "specialization": "Pediatrics",
  "departmentId": 3,
  "qualifications": "MD, PhD"
}

Response (201 Created):
{
  "id": 46,
  "name": "Dr. Sarah Davis",
  ...
  "createdAt": "2026-09-03T14:30:00Z"
}
```

---

## Appointment Endpoints

### Schedule Appointment
```
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "patientId": 1,
  "doctorId": 2,
  "dateTime": "2026-09-10T14:00:00Z",
  "reason": "Regular checkup",
  "notes": "Patient has mentioned chest pain"
}

Response (201 Created):
{
  "id": 50,
  "patientId": 1,
  "patientName": "John Doe",
  "doctorId": 2,
  "doctorName": "Dr. Robert Johnson",
  "dateTime": "2026-09-10T14:00:00Z",
  "status": "scheduled",
  "reason": "Regular checkup",
  "notes": "Patient has mentioned chest pain",
  "createdAt": "2026-09-03T14:30:00Z"
}

Response (409 Conflict):
{
  "error": "Conflict",
  "message": "Doctor is not available at this time",
  "status": 409
}
```

### Get Appointment Queue
```
GET /api/appointments/queue
Authorization: Bearer {token}

Response (200 OK):
{
  "content": [
    {
      "id": 50,
      "patientName": "John Doe",
      "doctorName": "Dr. Robert Johnson",
      "dateTime": "2026-09-10T14:00:00Z",
      "status": "scheduled",
      "waitTime": "15 minutes",
      "queuePosition": 1
    },
    ...
  ],
  "totalWaiting": 12,
  "estimatedWaitTime": "2 hours"
}
```

### Update Appointment Status
```
PUT /api/appointments/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "status": "completed"
}

Response (200 OK):
{
  "id": 50,
  "status": "completed",
  "updatedAt": "2026-09-10T14:30:00Z"
}
```

---

## Consultation Endpoints

### Create Consultation
```
POST /api/consultations
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "appointmentId": 50,
  "patientId": 1,
  "doctorId": 2,
  "notes": "Patient presents with chest pain. EKG normal.",
  "diagnosis": "Anxiety-related chest pain",
  "treatmentPlan": "Prescribe beta-blockers, stress management counseling"
}

Response (201 Created):
{
  "id": 25,
  "appointmentId": 50,
  "patientId": 1,
  "doctorId": 2,
  "notes": "Patient presents with chest pain. EKG normal.",
  "diagnosis": "Anxiety-related chest pain",
  "treatmentPlan": "Prescribe beta-blockers, stress management counseling",
  "createdAt": "2026-09-10T14:30:00Z"
}
```

### Link Prescription to Consultation
```
POST /api/consultations/{id}/prescriptions
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "medications": [
    {
      "name": "Metoprolol",
      "dosage": "25mg",
      "frequency": "Once daily",
      "duration": "30 days"
    },
    {
      "name": "Sertraline",
      "dosage": "50mg",
      "frequency": "Once daily",
      "duration": "90 days"
    }
  ]
}

Response (201 Created):
{
  "id": 15,
  "consultationId": 25,
  "medications": [...],
  "createdAt": "2026-09-10T14:30:00Z"
}
```

---

## Pharmacy Endpoints

### Get Pharmacy Queue
```
GET /api/pharmacy/queue
Authorization: Bearer {token}

Response (200 OK):
{
  "content": [
    {
      "prescriptionId": 15,
      "patientName": "John Doe",
      "medications": ["Metoprolol", "Sertraline"],
      "status": "pending",
      "queuePosition": 1,
      "estimatedTime": "15 minutes"
    },
    ...
  ],
  "totalPending": 8
}
```

### Get Medication Stock
```
GET /api/pharmacy/stock
Authorization: Bearer {token}

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "medicationName": "Metoprolol",
      "dosage": "25mg",
      "currentStock": 500,
      "reorderLevel": 100,
      "unit": "tablets",
      "supplier": "MediSupply Inc",
      "lastRestocked": "2026-09-01",
      "status": "adequate"
    },
    {
      "id": 2,
      "medicationName": "Insulin",
      "currentStock": 45,
      "reorderLevel": 100,
      "status": "low"
    },
    ...
  ],
  "totalItems": 156,
  "lowStockItems": 12
}
```

---

## Laboratory Endpoints

### Submit Lab Request
```
POST /api/laboratory/requests
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "patientId": 1,
  "consultationId": 25,
  "tests": [
    {
      "testId": 1,
      "testName": "Complete Blood Count"
    },
    {
      "testId": 5,
      "testName": "Liver Function Test"
    }
  ],
  "urgency": "normal"
}

Response (201 Created):
{
  "id": 100,
  "patientId": 1,
  "consultationId": 25,
  "tests": [...],
  "status": "submitted",
  "estimatedCompletion": "2026-09-05T10:00:00Z",
  "createdAt": "2026-09-03T14:30:00Z"
}
```

### Get Lab Results
```
GET /api/laboratory/requests/{id}
Authorization: Bearer {token}

Response (200 OK):
{
  "id": 100,
  "patientId": 1,
  "status": "completed",
  "completedAt": "2026-09-05T10:00:00Z",
  "results": [
    {
      "testName": "Complete Blood Count",
      "result": "Normal",
      "values": {
        "hemoglobin": "13.5 g/dL",
        "whiteBloodCells": "7.2 x10^9/L",
        "platelets": "250 x10^9/L"
      },
      "referenceRange": "Normal range values"
    },
    ...
  ]
}
```

---

## Billing Endpoints

### Create Billing Record
```
POST /api/billing
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "patientId": 1,
  "consultationId": 25,
  "items": [
    {
      "description": "Consultation Fee",
      "amount": 50.00
    },
    {
      "description": "EKG Test",
      "amount": 75.00
    },
    {
      "description": "Lab Tests",
      "amount": 150.00
    }
  ],
  "discount": 10.00,
  "taxRate": 0.10
}

Response (201 Created):
{
  "id": 200,
  "patientId": 1,
  "invoiceNumber": "INV-2026-0200",
  "items": [...],
  "subtotal": 275.00,
  "discount": 10.00,
  "tax": 26.50,
  "total": 291.50,
  "status": "pending",
  "createdAt": "2026-09-03T14:30:00Z"
}
```

### Record Payment
```
POST /api/billing/{id}/payments
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "amount": 291.50,
  "paymentMethod": "credit_card",
  "transactionId": "TXN123456"
}

Response (201 Created):
{
  "id": 300,
  "billingId": 200,
  "amount": 291.50,
  "paymentMethod": "credit_card",
  "status": "completed",
  "createdAt": "2026-09-03T14:35:00Z"
}
```

### Get Billing Details
```
GET /api/billing/{id}
Authorization: Bearer {token}

Response (200 OK):
{
  "id": 200,
  "patientId": 1,
  "patientName": "John Doe",
  "invoiceNumber": "INV-2026-0200",
  "invoiceDate": "2026-09-03",
  "items": [...],
  "subtotal": 275.00,
  "discount": 10.00,
  "tax": 26.50,
  "total": 291.50,
  "paidAmount": 291.50,
  "status": "paid",
  "payments": [...]
}
```

---

## Inventory Endpoints

### List Inventory Items
```
GET /api/inventory
Authorization: Bearer {token}

Query Parameters:
- category: string
- lowStock: boolean
- page: number
- size: number

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "itemName": "Surgical Masks",
      "category": "PPE",
      "currentStock": 5000,
      "minimumStock": 1000,
      "reorderLevel": 2000,
      "unitCost": 0.25,
      "supplier": "MediSupply Inc",
      "lastRestocked": "2026-09-01"
    },
    ...
  ],
  "totalItems": 500,
  "lowStockCount": 15
}
```

### Update Stock
```
PATCH /api/inventory/{id}/stock
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "quantity": 1000,
  "operation": "add" // or "reduce"
}

Response (200 OK):
{
  "id": 1,
  "itemName": "Surgical Masks",
  "currentStock": 6000,
  "lastUpdated": "2026-09-03T14:30:00Z"
}
```

---

## Error Response Format

### General Error Response
```json
{
  "timestamp": "2026-09-03T14:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/patients",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "dateOfBirth",
      "message": "Date cannot be in the future"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request body/params |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Business rule violation |
| 500 | Server Error | Internal server error |

---

## Request/Response Headers

### Request Headers
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

### Response Headers
```
Content-Type: application/json
X-Total-Count: {number}
X-Total-Pages: {number}
```

---

## Pagination

All list endpoints support pagination:

```
GET /api/patients?page=0&size=20&sort=name,asc

Response includes:
{
  "content": [...],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0,
  "size": 20,
  "numberOfElements": 20,
  "first": true,
  "last": false
}
```

---

## Filtering & Searching

Query string parameters for filtering:

```
GET /api/patients?search=john&gender=male&page=0&size=20

GET /api/doctors?department=cardiology&specialization=cardiologist

GET /api/appointments?status=scheduled&date=2026-09-10

GET /api/laboratory/requests?status=completed&from=2026-09-01&to=2026-09-03
```

---

## Rate Limiting

(Optional - future implementation)

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1693667400
```

---

## Related Documentation

- See [PROJECT_STATE.md](./PROJECT_STATE.md) for current status
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [COMPONENTS.md](./COMPONENTS.md) for detailed component breakdown
- See [DATA_FLOW.md](./DATA_FLOW.md) for data flow patterns
