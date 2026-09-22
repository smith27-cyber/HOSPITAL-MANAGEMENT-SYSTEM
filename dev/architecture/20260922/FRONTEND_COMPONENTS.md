# HMS Frontend Components

**Version:** 1.1
**Last Updated:** 2026-09-22

---

## Component Overview

13 major feature modules plus core infrastructure. Each feature is
independently developed and integrated through services and shared
utilities.

---

## Core Infrastructure

### 1. Auth Module
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

### 2. Core Module
**Location:** `src/app/core/`
**Responsibility:** Shared services and guards

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

**Services (15 total):**

| Service | File | Responsibility |
|---------|------|-----------------|
| AuthService | auth.service.ts | Authentication, login/logout, token management |
| UserService | user.service.ts | User account & RBAC management |
| PatientService | patient.service.ts | Patient CRUD operations, search |
| DoctorService | doctor.service.ts | Doctor management |
| AppointmentService | appointment.service.ts | Appointment scheduling and management |
| ConsultationService | consultation.service.ts | Consultation records |
| AdmissionService | admission.service.ts | Patient admission, ward/bed, transfer, discharge |
| PharmacyService | pharmacy.service.ts | Prescriptions, stock management |
| LaboratoryService | laboratory.service.ts | Lab tests, requests, results |
| BillingService | billing.service.ts | Invoices, payments |
| InventoryService | inventory.service.ts | Equipment and supplies |
| DepartmentService | department.service.ts | Department management |
| DashboardService | dashboard.service.ts | Analytics and metrics |
| ReportService | report.service.ts | Report generation |
| SettingsService | settings.service.ts | Hospital settings, system preferences (backed by `/api/settings/hospital`) |

### 3. Layout Module
**Location:** `src/app/layout/`
**Responsibility:** Main application layout wrapper
**Components:**
- `MainLayoutComponent` - Wrapper for authenticated pages
  - Navigation menu
  - Sidebar or top navigation
  - Content outlet for feature components
  - Footer

---

## Feature Modules (13 total)

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

#### 7. Admissions Module
**Location:** `src/app/features/admissions/`
**Status:** ✅ Complete
**Responsibility:** Inpatient admission management

**Sub-Components:**
- `AdmissionListComponent` - List all admissions
- `AdmissionRegisterComponent` - Admit a patient
- `AdmissionEditComponent` - Update admission, transfer ward/bed
- `AdmissionDetailsComponent` - Admission details, discharge/cancel actions

**Routes:**
- `GET /admissions`
- `GET /admissions/register`
- `GET /admissions/:id`
- `GET /admissions/:id/edit`

**Services Used:**
- AdmissionService
- PatientService
- DoctorService
- DepartmentService

**Key Features:**
- Admit patient to a ward/bed
- Track admission type (emergency, routine, referral, surgical, maternity, other)
- Transfer between wards/beds
- Discharge and cancellation
- Admission statistics (active, discharged, transferred, cancelled counts)

**Key Fields:**
- Patient ID/Name, Doctor ID/Name, Department ID/Name
- Ward (general, private, pediatric, maternity, surgical, ICU, emergency, other)
- Bed Number
- Admission Type, Admission/Expected Discharge/Discharge Dates
- Reason, Diagnosis, Notes, Status

---

#### 8. Pharmacy Module
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

#### 9. Laboratory Module
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

#### 10. Billing Module
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

#### 11. Inventory Module
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

#### 12. Reports Module
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

#### 13. Settings Module
**Location:** `src/app/features/settings/`
**Status:** ✅ Complete (hospital settings backend-backed; system/notification preferences frontend-only)
**Responsibility:** System configuration

**Sub-Components:**
- `HospitalSettingsComponent` - Hospital configuration (backed by `HospitalSettingsController`/`HospitalSettingsService`)
- `SystemPreferencesComponent` - System settings (frontend only)
- `NotificationSettingsComponent` - Notification preferences (frontend only)
- `ProfileSettingsComponent` - User profile settings
- `UserManagementComponent` - User/role administration (RBAC)

**Routes:**
- `GET /settings/hospital`
- `GET /settings/system`
- `GET /settings/notifications`
- `GET /settings/profile`
- `GET /settings/users`

**Services Used:**
- SettingsService (hospital settings — real backend calls)
- UserService (user/role management)
- None for system preferences / notification settings (frontend configuration only)

**Settings Available:**
- Hospital name, address, contact, operating hours (persisted via `GET/PUT /api/settings/hospital`, `POST /api/settings/hospital/reset`)
- Department names
- System preferences (frontend only)
- Email notifications (frontend only)
- User preferences

---

## Related Documentation

- [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) — the Spring Boot side each service talks to
- [DATA_MODEL.md](./DATA_MODEL.md) — entities backing these features
- [API_DESIGN.md](./API_DESIGN.md) — full endpoint specifications
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — overall architecture
