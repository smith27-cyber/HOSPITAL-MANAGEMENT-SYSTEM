# HMS Components & Modules Breakdown

**Version:** 1.0  
**Last Updated:** 2026-09-03

---

## Component Overview

HMS consists of 14 major feature modules plus core infrastructure. Each feature is independently developed and integrated through services and shared utilities.

---

## Frontend Components Structure

### Core Infrastructure

#### 1. Auth Module
**Location:** `src/app/auth/`  
**Responsibility:** User authentication  
**Components:**
- `LoginComponent` - Login form and authentication handling

**Services:**
- `AuthService` - Authentication and token management
  - `login(username, password)` - User login
  - `logout()` - User logout
  - `isAuthenticated()` - Check auth status
  - `getToken()` - Retrieve JWT token

#### 2. Core Module
**Location:** `src/app/core/`  
**Responsibility:** Shared services and guards

**Subdirectories:**

**Guards:**
- `auth.guard.ts` - Protects routes, requires authentication
  - Checks if user is authenticated
  - Redirects to login if not
  - Prevents unauthorized navigation

**Interceptors:**
- `auth.interceptor.ts` - Automatic JWT injection
  - Adds Authorization header to all requests
  - Handles token refresh (if applicable)
  - Manages error responses

**Services (14 total):**

| Service | File | Responsibility |
|---------|------|-----------------|
| AuthService | auth.service.ts | Authentication, login/logout, token management |
| PatientService | patient.service.ts | Patient CRUD operations, search |
| DoctorService | doctor.service.ts | Doctor management |
| AppointmentService | appointment.service.ts | Appointment scheduling and management |
| ConsultationService | consultation.service.ts | Consultation records |
| PharmacyService | pharmacy.service.ts | Prescriptions, stock management |
| LaboratoryService | laboratory.service.ts | Lab tests, requests, results |
| BillingService | billing.service.ts | Invoices, payments |
| InventoryService | inventory.service.ts | Equipment and supplies |
| DepartmentService | department.service.ts | Department management |
| DashboardService | dashboard.service.ts | Analytics and metrics |
| ReportService | report.service.ts | Report generation |

#### 3. Layout Module
**Location:** `src/app/layout/`  
**Responsibility:** Main application layout wrapper  
**Components:**
- `MainLayoutComponent` - Wrapper for authenticated pages
  - Navigation menu
  - Sidebar or top navigation
  - Content outlet for feature components
  - Footer

### Feature Modules (14 total)

#### 1. Dashboard Module
**Location:** `src/app/features/dashboard/`  
**Status:** ✅ Complete  
**Responsibility:** Centralized analytics and KPIs

**Components:**
- `DashboardComponent`
  - Display key metrics
  - Show charts and visualizations
  - Quick action buttons

**Services Used:**
- DashboardService - Fetch metrics
- PatientService - Patient count
- AppointmentService - Appointment metrics

**Data Displayed:**
- Total patients
- Today's appointments
- Pending consultations
- Pharmacy items in stock
- Revenue metrics

---

#### 2. Patients Module
**Location:** `src/app/features/patients/`  
**Status:** ✅ Complete  
**Responsibility:** Patient management system

**Sub-Components:**
- `PatientListComponent`
  - Display all patients
  - Search and filter
  - Pagination
  - Action buttons (edit, view, delete)

- `PatientFormComponent`
  - Register new patient
  - Edit patient information
  - Form validation
  - Error handling

- `PatientProfileComponent`
  - Display patient details
  - Medical history
  - Related appointments
  - Related consultations
  - Action buttons

**Routes:**
- `GET /patients` - List all
- `GET /patients/register` - Registration form
- `GET /patients/:id` - View profile
- `GET /patients/:id/edit` - Edit form

**Services Used:**
- PatientService

**Key Fields:**
- Name, Email, Phone
- Date of Birth, Gender
- Address, Medical History
- Emergency Contact

---

#### 3. Doctors Module
**Location:** `src/app/features/doctors/`  
**Status:** ✅ Complete  
**Responsibility:** Doctor management

**Sub-Components:**
- `DoctorListComponent` - Display all doctors
- `DoctorFormComponent` - Register/edit doctor
- `DoctorProfileComponent` - Doctor details and specialization

**Routes:**
- `GET /doctors`
- `GET /doctors/register`
- `GET /doctors/:id`
- `GET /doctors/:id/edit`

**Services Used:**
- DoctorService
- DepartmentService

**Key Fields:**
- Name, License Number
- Specialization
- Department
- Contact Information
- Qualifications

---

#### 4. Departments Module
**Location:** `src/app/features/departments/`  
**Status:** ✅ Complete  
**Responsibility:** Department management

**Sub-Components:**
- `DepartmentListComponent` - List departments
- `DepartmentFormComponent` - Create/edit
- `DepartmentProfileComponent` - Department details and staff

**Routes:**
- `GET /departments`
- `GET /departments/register`
- `GET /departments/:id`
- `GET /departments/:id/edit`

**Services Used:**
- DepartmentService
- DoctorService

**Key Fields:**
- Department Name
- Description
- Head of Department
- Staff Count
- Location/Floor

---

#### 5. Appointments Module
**Location:** `src/app/features/appointments/`  
**Status:** ✅ Complete  
**Responsibility:** Appointment scheduling and management

**Sub-Components:**
- `AppointmentListComponent` - List all appointments
- `AppointmentRegisterComponent` - Schedule new appointment
- `AppointmentQueueComponent` - Queue management and waiting list
- `AppointmentDetailsComponent` - View appointment details

**Routes:**
- `GET /appointments`
- `GET /appointments/register`
- `GET /appointments/queue`
- `GET /appointments/:id`
- `GET /appointments/:id/edit`
- `GET /appointments/:id/consultation`

**Services Used:**
- AppointmentService
- PatientService
- DoctorService
- ConsultationService

**Key Features:**
- Schedule appointments
- Manage queue
- Track status (scheduled, completed, cancelled)
- Link to consultations

**Key Fields:**
- Patient ID
- Doctor ID
- Date/Time
- Status
- Notes

---

#### 6. Consultations Module
**Location:** `src/app/features/consultations/`  
**Status:** ✅ Complete  
**Responsibility:** Consultation records

**Sub-Components:**
- `ConsultationListComponent` - List consultations
- `ConsultationFormComponent` - Create/edit consultation
- `ConsultationProfileComponent` - Consultation details

**Routes:**
- `GET /consultations`
- `GET /consultations/register`
- `GET /consultations/:id`
- `GET /consultations/:id/edit`

**Services Used:**
- ConsultationService
- PatientService
- DoctorService
- PharmacyService

**Key Fields:**
- Patient ID
- Doctor ID
- Appointment ID
- Consultation Notes
- Diagnosis
- Prescriptions
- Date/Time

---

#### 7. Pharmacy Module
**Location:** `src/app/features/pharmacy/`  
**Status:** ✅ Complete  
**Responsibility:** Prescription and pharmacy management

**Sub-Components:**
- `PharmacyDashboardComponent` - Pharmacy overview
- `PharmacyQueueComponent` - Prescription queue
- `PharmacyStockComponent` - Medication stock management
- `PharmacyPrescriptionComponent` - View prescription details

**Routes:**
- `GET /pharmacy` - Dashboard
- `GET /pharmacy/queue` - Queue view
- `GET /pharmacy/stock` - Stock management
- `GET /pharmacy/prescriptions/:id` - Prescription details

**Services Used:**
- PharmacyService

**Key Features:**
- Prescription queue management
- Stock level tracking
- Medication reorder alerts
- Prescription fulfillment

**Key Fields:**
- Medication Name
- Quantity
- Stock Level
- Reorder Level
- Supplier Information

---

#### 8. Laboratory Module
**Location:** `src/app/features/laboratory/`  
**Status:** ✅ Complete  
**Responsibility:** Lab tests and request management

**Sub-Components:**
- `LaboratoryListComponent` - List available tests
- `LaboratoryRegisterComponent` - Create new lab test
- `LaboratoryRequestListComponent` - Test requests
- `LaboratoryRequestFormComponent` - Submit test request
- `LaboratoryRequestDetailsComponent` - Request details and results

**Routes:**
- `GET /laboratory` - Tests
- `GET /laboratory/register` - Register test
- `GET /laboratory/:id` - Test details
- `GET /laboratory/requests` - Requests
- `GET /laboratory/requests/register` - Submit request
- `GET /laboratory/requests/:id` - Request details

**Services Used:**
- LaboratoryService

**Key Features:**
- Test catalog management
- Request workflow
- Result tracking
- Report generation

**Key Fields:**
- Test Name
- Test Type
- Sample Type
- Reference Values
- Processing Time
- Cost

---

#### 9. Billing Module
**Location:** `src/app/features/billing/`  
**Status:** ✅ Complete  
**Responsibility:** Billing and payment management

**Sub-Components:**
- `BillingListComponent` - List invoices
- `BillingRegisterComponent` - Create invoice
- `BillingEditComponent` - Edit invoice
- `BillingDetailsComponent` - Invoice details

**Routes:**
- `GET /billing`
- `GET /billing/register`
- `GET /billing/:id`
- `GET /billing/:id/edit`

**Services Used:**
- BillingService
- PatientService
- ConsultationService

**Key Features:**
- Invoice generation
- Payment tracking
- Item-based billing
- Report generation

**Key Fields:**
- Patient ID
- Consultation ID
- Invoice Date
- Total Amount
- Payment Status
- Items (services/procedures)
- Payments Made

---

#### 10. Inventory Module
**Location:** `src/app/features/inventory/`  
**Status:** ✅ Complete  
**Responsibility:** Equipment and supply tracking

**Sub-Components:**
- `InventoryListComponent` - List items
- `InventoryRegisterComponent` - Add item
- `InventoryStockComponent` - Stock management
- `InventoryEditComponent` - Edit item
- `InventoryDetailsComponent` - Item details

**Routes:**
- `GET /inventory`
- `GET /inventory/register`
- `GET /inventory/stock`
- `GET /inventory/:id`
- `GET /inventory/:id/edit`

**Services Used:**
- InventoryService

**Key Features:**
- Item catalog
- Stock tracking
- Reorder alerts
- Usage tracking

**Key Fields:**
- Item Name
- Category
- Current Stock
- Reorder Level
- Unit Cost
- Supplier
- Last Updated

---

#### 11. Reports Module
**Location:** `src/app/features/reports/`  
**Status:** ✅ Complete  
**Responsibility:** Analytics and reporting

**Sub-Components:**
- `ReportComponent` - Report generation and viewing

**Routes:**
- `GET /reports`

**Services Used:**
- ReportService
- DashboardService

**Report Types:**
- Patient statistics
- Appointment analytics
- Financial reports
- Department performance
- Doctor performance

---

#### 12. Settings Module
**Location:** `src/app/features/settings/`  
**Status:** ⚠️ Frontend Only  
**Responsibility:** System configuration (frontend only, no backend implementation)

**Sub-Components:**
- `HospitalSettingsComponent` - Hospital configuration
- `SystemPreferencesComponent` - System settings
- `NotificationSettingsComponent` - Notification preferences

**Routes:**
- `GET /settings/hospital`
- `GET /settings/system`
- `GET /settings/notifications`

**Services Used:**
- None (frontend configuration only)

**Settings Available:**
- Hospital name, address, contact
- Operating hours
- Department names
- System preferences
- Email notifications
- User preferences

---

## Backend Components Structure

### Configuration Layer

#### 1. SecurityConfig
**File:** `src/main/java/com/hms/backend/config/SecurityConfig.java`  
**Responsibility:** Spring Security configuration

**Key Methods:**
- Configure JWT filter
- Configure CORS
- Configure authorization rules
- Configure password encoder

**Security Rules:**
- Public endpoints: `/api/auth/login`, `/api/auth/register`
- Protected endpoints: All other `/api/**` paths require JWT
- Role-based access control (if applicable)

#### 2. PasswordConfig
**File:** `src/main/java/com/hms/backend/config/PasswordConfig.java`  
**Responsibility:** Password encoding configuration

**Components:**
- BCryptPasswordEncoder bean
- Password encoding algorithm selection

---

### Entity Layer (Database Models)

14+ JPA entities representing hospital domain:

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| User | Authentication and user accounts | ID, Username, Password, Email, Role |
| Patient | Patient records | ID, Name, Email, DOB, Gender, Address |
| Doctor | Doctor profiles | ID, Name, Specialization, License, Department |
| Department | Hospital departments | ID, Name, Description, Location |
| Appointment | Doctor-patient meetings | ID, PatientID, DoctorID, DateTime, Status |
| Consultation | Consultation records | ID, PatientID, DoctorID, Notes, Date |
| PharmacyPrescription | Medication prescriptions | ID, PatientID, Medications, Date |
| PharmacyPrescriptionItem | Individual medications | ID, PrescriptionID, Medication, Dosage |
| LaboratoryTest | Lab test definitions | ID, Name, Type, Cost |
| LaboratoryRequest | Lab test orders | ID, PatientID, TestID, Status |
| Billing | Invoices | ID, PatientID, Date, Total, Status |
| BillingPayment | Payment records | ID, BillingID, Amount, Date, Method |
| BillingItem | Invoice line items | ID, BillingID, Description, Cost |
| Inventory | Equipment/supplies | ID, Name, Quantity, Category |

**Entity Relationships:**
```
Department
    ↑
    │ (1:N)
    │
Doctor ────→ Appointment ←─── Patient
             ↓ (1:1)        (1:N) ↑
        Consultation         │
             ↓               │
        Prescriptions    Billing
             ↓
        Pharmacy Items
```

---

### Repository Layer

13+ Spring Data JPA repositories providing CRUD operations and custom queries:

**Pattern:**
```java
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByNameContaining(String name);
    Optional<Patient> findByEmail(String email);
    // Auto-generated: findAll(), findById(), save(), delete()...
}
```

**Repositories:**
- PatientRepository
- DoctorRepository
- DepartmentRepository
- AppointmentRepository
- ConsultationRepository
- PharmacyPrescriptionRepository
- LaboratoryTestRepository
- LaboratoryRequestRepository
- AdmissionRepository
- BillingRepository
- BillingItemRepository
- BillingPaymentRepository
- InventoryRepository

---

### Service Layer

13+ business logic services:

**PatientService**
```java
- createPatient(PatientDTO)
- updatePatient(Long id, PatientDTO)
- getPatient(Long id)
- getAllPatients()
- deletePatient(Long id)
- searchPatient(String name)
```

**AppointmentService**
```java
- scheduleAppointment(AppointmentDTO)
- cancelAppointment(Long id)
- getAppointmentQueue()
- updateAppointmentStatus()
- getAppointmentsByPatient(Long patientId)
```

**BillingService**
```java
- createBilling(BillingDTO)
- addBillingItem()
- recordPayment()
- updateBillingStatus()
- getBillingByPatient()
```

**Similar patterns for other services:**
- DoctorService
- DepartmentService
- ConsultationService
- PharmacyService
- LaboratoryService
- InventoryService
- DashboardService

---

### Controller Layer

REST controllers exposing API endpoints:

**PatientController**
```
POST   /api/patients                  # Create
GET    /api/patients                  # List all
GET    /api/patients/{id}             # Get by ID
PUT    /api/patients/{id}             # Update
DELETE /api/patients/{id}             # Delete
```

**AppointmentController**
```
POST   /api/appointments              # Schedule
GET    /api/appointments              # List
GET    /api/appointments/queue        # Get queue
GET    /api/appointments/{id}         # Get details
PUT    /api/appointments/{id}         # Update
DELETE /api/appointments/{id}         # Cancel
```

**Similar patterns for:**
- DoctorController
- DepartmentController
- ConsultationController
- BillingController
- LaboratoryController
- AdmissionController
- InventoryController
- PharmacyController

---

### DTO Layer (Data Transfer Objects)

Data transfer objects for API communication:

**PatientDTO**
```java
- Long id
- String name
- String email
- LocalDate dateOfBirth
- String gender
- String address
- String phoneNumber
```

**AppointmentDTO**
```java
- Long id
- Long patientId
- Long doctorId
- LocalDateTime dateTime
- String status
- String notes
```

Similar DTOs for all entities:
- DoctorDTO
- DepartmentDTO
- ConsultationDTO
- BillingDTO
- InventoryDTO
- etc.

---

## Data Entity Relationships

### One-to-Many
```
Department 1 ──→ ∞ Doctor
Patient 1 ──→ ∞ Appointment
Patient 1 ──→ ∞ Consultation
Patient 1 ──→ ∞ Admission
Patient 1 ──→ ∞ Billing
Consultation 1 ──→ ∞ Prescription
```

### Many-to-One
```
Doctor ∞ ──→ 1 Department
Appointment ∞ ──→ 1 Patient
Appointment ∞ ──→ 1 Doctor
Consultation ∞ ──→ 1 Patient
```

### One-to-One
```
Appointment 1 ──→ 1 Consultation (Optional)
```

---

## Component Communication Pattern

```
Frontend Component
    ↓
Calls Service Method
    ↓
HTTP Request (with JWT)
    ↓
AuthInterceptor adds token
    ↓
Backend Controller receives
    ↓
Validates request
    ↓
Calls Service method
    ↓
Service calls Repository
    ↓
Repository queries Database
    ↓
Data returned
    ↓
Service processes data
    ↓
Controller formats response
    ↓
HTTP Response
    ↓
AuthInterceptor processes
    ↓
Frontend Service handles
    ↓
Component updates UI
```

---

## Related Documentation

- See [PROJECT_STATE.md](./PROJECT_STATE.md) for current status
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [DATA_FLOW.md](./DATA_FLOW.md) for data flow patterns
- See [API_DESIGN.md](./API_DESIGN.md) for API specifications
