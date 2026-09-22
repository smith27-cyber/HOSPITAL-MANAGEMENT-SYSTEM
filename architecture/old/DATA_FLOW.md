# HMS Data Flow Patterns

**Version:** 1.0  
**Last Updated:** 2026-09-22

---

## Overview

This document describes how data flows through the HMS system across different operations. The system follows a request-response pattern with clear separation between frontend and backend.

---

## General Data Flow Architecture

```
┌─────────────────────────────────┐
│   User Interaction              │
│   (Click, Form Submit, etc)     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Angular Component             │
│   (Captures user input)         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Validation                    │
│   (Form level checks)           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Service Layer                 │
│   (Prepares API call)           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Auth Interceptor              │
│   (Adds JWT token)              │
└────────────┬────────────────────┘
             │
        HTTP Request (JSON)
        POST/GET/PUT/DELETE
             │
             ▼
┌─────────────────────────────────┐
│   Backend Controller            │
│   (Route matching)              │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Validation                    │
│   (Server-side checks)          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Service Layer                 │
│   (Business logic)              │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Repository Layer              │
│   (Database interaction)        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Database                      │
│   (Persist/Retrieve data)       │
└────────────┬────────────────────┘
             │
        HTTP Response (JSON)
             │
             ▼
┌─────────────────────────────────┐
│   Service Layer                 │
│   (Process response)            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Component                     │
│   (Update UI with data)         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   User Sees Updated View        │
└─────────────────────────────────┘
```

---

## Patient Registration Flow

### Sequence Diagram

```
User                Component         Service           Interceptor         Controller        Service         Repository        Database
│                    │                  │                    │                   │                 │                  │              │
├──Submit Form────→  │                  │                    │                   │                 │                  │              │
│                    ├─Validate────────→ │                    │                   │                 │                  │              │
│                    │ (Format checks)   │                    │                   │                 │                  │              │
│                    │                   ├──HTTP POST────────→ │                   │                 │                  │              │
│                    │                   │(with patient data)  ├──Add JWT token──→ │                 │                  │              │
│                    │                   │                    │                   │                 │                  │              │
│                    │                   │                    │                   ├──Parse────────→ │                 │                  │              │
│                    │                   │                    │                   │ (DTO→Entity)   │                  │                  │              │
│                    │                   │                    │                   │                 ├──Validate──────→ │                 │                  │              │
│                    │                   │                    │                   │                 │ (Email unique)  │                 │                  │              │
│                    │                   │                    │                   │                 │                 ├──INSERT────────→ │              │
│                    │                   │                    │                   │                 │                 │ (New Patient)   ├─Save────────→ │
│                    │                   │                    │                   │                 │                 │                 │              │ Store
│                    │                   │                    │                   │                 │                 │ ←──Return ID───← │              │
│                    │                   │                    │                   │                 │ ←──OK────────────│                 │              │
│                    │                   │                    │                   │ ←──Return Patient Data──────────────│                 │              │
│                    │                   │ ←──HTTP 201────────│                   │                 │                  │              │
│                    │ ←──Observable────→ │ (with patient ID) │                   │                 │                  │              │
│                    │ (Emit success)    │                    │                   │                 │                  │              │
│                    ├──Navigate────────→ │                   │                   │                 │                  │              │
│                    │ (to patient list)  │                   │                   │                 │                  │              │
│ Show success msg ←─┤                    │                   │                   │                 │                  │              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

### Step-by-Step Breakdown

**Step 1: User Action**
- User fills patient registration form
- Clicks "Register" button
- Component captures form data

**Step 2: Frontend Validation**
```javascript
// PatientFormComponent
const formData = {
  name: "Jane Smith",
  email: "jane@example.com",
  phoneNumber: "+1234567890",
  dateOfBirth: "1990-05-20",
  gender: "Female",
  address: "456 Oak Ave"
};

// Validate format
if (!this.isValidEmail(formData.email)) {
  showError("Invalid email format");
  return;
}
```

**Step 3: Service Call**
```typescript
// PatientService
this.http.post('/api/patients', formData)
  .pipe(
    tap(response => console.log('Patient created:', response)),
    catchError(error => this.handleError(error))
  )
  .subscribe(
    patient => this.navigateToProfile(patient.id)
  );
```

**Step 4: HTTP Interceptor**
```typescript
// AuthInterceptor
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.getToken();
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next.handle(clonedReq);
}
```

**Step 5: Backend Request Handling**
```java
// PatientController
@PostMapping
public ResponseEntity<PatientDTO> createPatient(@RequestBody PatientDTO patientDTO) {
  PatientDTO savedPatient = patientService.create(patientDTO);
  return ResponseEntity.status(HttpStatus.CREATED).body(savedPatient);
}
```

**Step 6: Business Logic**
```java
// PatientService
@Transactional
public PatientDTO create(PatientDTO patientDTO) {
  // Validate unique email
  if (patientRepository.findByEmail(patientDTO.getEmail()).isPresent()) {
    throw new ValidationException("Email already exists");
  }
  
  // Map DTO to entity
  Patient patient = patientMapper.toEntity(patientDTO);
  
  // Set default values
  patient.setCreatedAt(LocalDateTime.now());
  
  // Save to database
  Patient savedPatient = patientRepository.save(patient);
  
  // Map back to DTO
  return patientMapper.toDTO(savedPatient);
}
```

**Step 7: Database Operation**
```java
// PatientRepository (Spring Data)
// save() method auto-generated, executes:
// INSERT INTO patients (name, email, phone_number, ...) VALUES (?, ?, ?, ...)
```

**Step 8: Response Journey**
```
Database returns generated ID → Service returns DTO → Controller returns 201 
→ HTTP Response with patient data → Frontend receives Observable
→ Component updates with patient ID → Navigation to profile page
```

---

## Appointment Scheduling Flow

### Frontend to Backend Flow

```
User clicks "Schedule Appointment"
           ↓
AppointmentFormComponent renders
           ↓
User selects:
  - Patient
  - Doctor
  - Date/Time
           ↓
Form validation:
  - All fields required
  - Date must be in future
  - Doctor must be available
           ↓
AppointmentService.scheduleAppointment(appointmentData)
           ↓
HTTP POST /api/appointments
           ↓
AuthInterceptor adds JWT
           ↓
AppointmentController.scheduleAppointment()
           ↓
AppointmentService.schedule()
  - Check doctor availability
  - Check patient status
  - Validate date/time
           ↓
AppointmentRepository.save()
           ↓
Database INSERT
           ↓
Returns HTTP 201 with appointment ID
           ↓
Frontend receives appointment
           ↓
Show success message
           ↓
Navigate to appointment queue
```

### Code Example

**Frontend Component:**
```typescript
// AppointmentRegisterComponent
scheduleAppointment() {
  const appointmentData = {
    patientId: this.selectedPatient.id,
    doctorId: this.selectedDoctor.id,
    dateTime: this.selectedDateTime,
    reason: this.reason,
    notes: this.notes
  };

  this.appointmentService.schedule(appointmentData).subscribe(
    (appointment) => {
      this.toastr.success('Appointment scheduled successfully');
      this.router.navigate(['/appointments', appointment.id]);
    },
    (error) => {
      this.toastr.error(error.error.message);
    }
  );
}
```

**Backend Service:**
```java
// AppointmentService
@Transactional
public AppointmentDTO schedule(AppointmentDTO dto) {
  // Validate doctor availability
  List<Appointment> conflicts = appointmentRepository
    .findByDoctorIdAndDateTimeBetween(
      dto.getDoctorId(),
      dto.getDateTime().minus(1, ChronoUnit.HOURS),
      dto.getDateTime().plus(1, ChronoUnit.HOURS)
    );
  
  if (!conflicts.isEmpty()) {
    throw new ConflictException("Doctor not available");
  }

  // Create appointment
  Appointment appointment = new Appointment();
  appointment.setPatient(patientRepository.findById(dto.getPatientId()).get());
  appointment.setDoctor(doctorRepository.findById(dto.getDoctorId()).get());
  appointment.setDateTime(dto.getDateTime());
  appointment.setStatus("scheduled");
  
  // Save
  Appointment saved = appointmentRepository.save(appointment);
  
  return appointmentMapper.toDTO(saved);
}
```

---

## Consultation & Prescription Flow

### Multi-Step Transaction

```
1. Doctor clicks "Create Consultation" from appointment
          ↓
2. ConsultationFormComponent loads
          ↓
3. Doctor enters:
   - Examination notes
   - Diagnosis
   - Treatment plan
          ↓
4. Doctor adds medications:
   - Select drug from pharmacy catalog
   - Enter dosage
   - Enter frequency
   - Enter duration
          ↓
5. Form submission:
   - Validate all fields
   - Call ConsultationService
          ↓
6. Frontend creates consultation object:
   {
     appointmentId: 50,
     patientId: 1,
     doctorId: 2,
     notes: "...",
     diagnosis: "...",
     medications: [
       { name: "Aspirin", dosage: "500mg", frequency: "Twice daily", duration: "7 days" },
       { name: "Amoxicillin", dosage: "500mg", frequency: "Three times daily", duration: "10 days" }
     ]
   }
          ↓
7. HTTP POST /api/consultations
          ↓
8. Backend ConsultationController
          ↓
9. ConsultationService.create() - transactional
   a. Create consultation record
   b. Link to appointment
   c. Create pharmacy prescription
   d. Create pharmacy prescription items for each drug
   e. Commit transaction
          ↓
10. Database operations:
    - INSERT into consultations
    - INSERT into pharmacy_prescriptions
    - INSERT into pharmacy_prescription_items (multiple)
    - UPDATE appointments set consultation_id
          ↓
11. Return consultation ID and prescription ID
          ↓
12. Frontend shows success
          ↓
13. Patient can view prescription at pharmacy
          ↓
14. Pharmacy staff can fulfill order
```

### Database Relationships

```
Appointment (1)
    ↓ (1:1)
    ↓
Consultation (1)
    ↓ (1:N)
    ↓
PharmacyPrescription (many)
    ↓ (1:N)
    ↓
PharmacyPrescriptionItem (many medications)
```

---

## Billing Flow

### Complex Workflow with Multiple Steps

```
Step 1: Consultation Completed
        Doctor submits consultation with diagnosis
                  ↓
Step 2: Billing Generation
        Billing component loads consultation
                  ↓
Step 3: Add Billing Items
        Receptionist adds:
        - Consultation fee
        - Lab test fee
        - Medication cost
        - Other charges
                  ↓
Step 4: Calculate Totals
        System calculates:
        - Subtotal (sum of items)
        - Discount (if any)
        - Tax (percentage based)
        - Final total = (subtotal - discount) + tax
                  ↓
Step 5: Save Billing Record
        BillingService.create(billingDTO)
        - Validate patient exists
        - Create billing header
        - Create billing items
        - Generate invoice number
                  ↓
Step 6: Database Persistence
        INSERT into billing
        INSERT into billing_items (multiple)
                  ↓
Step 7: Patient View Invoice
        Patient or receptionist views billing details
                  ↓
Step 8: Payment Processing
        Patient makes payment:
        - Cash
        - Card
        - Insurance
                  ↓
Step 9: Record Payment
        BillingService.recordPayment()
        - Add to billing_payments table
        - Update billing status to "paid"
        - Update account receivable
                  ↓
Step 10: Generate Receipt
        Print or email receipt
```

### Code Structure

**Frontend - Billing Component:**
```typescript
class BillingRegisterComponent {
  createBilling() {
    const billingData = {
      patientId: this.selectedPatient.id,
      consultationId: this.consultation.id,
      items: [
        { description: "Consultation Fee", amount: 50 },
        { description: "Lab Tests", amount: 150 },
        { description: "Medications", amount: 75 }
      ],
      discount: 10,
      taxRate: 0.10
    };
    
    this.billingService.create(billingData).subscribe(
      (billing) => {
        // Calculate totals on frontend for preview
        const totals = this.calculateTotals(billing);
        console.log('Total Due:', totals.total);
      }
    );
  }
}
```

**Backend - Service Layer:**
```java
@Transactional
public BillingDTO create(BillingDTO dto) {
  // 1. Create billing record
  Billing billing = new Billing();
  billing.setPatient(patientRepository.findById(dto.getPatientId()).get());
  billing.setConsultation(consultationRepository.findById(dto.getConsultationId()).get());
  billing.setInvoiceNumber(generateInvoiceNumber());
  
  // 2. Create billing items
  List<BillingItem> items = dto.getItems().stream()
    .map(itemDTO -> {
      BillingItem item = new BillingItem();
      item.setBilling(billing);
      item.setDescription(itemDTO.getDescription());
      item.setAmount(itemDTO.getAmount());
      return item;
    })
    .collect(Collectors.toList());
  
  billing.setItems(items);
  
  // 3. Calculate totals
  BigDecimal subtotal = billing.getItems().stream()
    .map(BillingItem::getAmount)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
  
  BigDecimal discount = new BigDecimal(dto.getDiscount());
  BigDecimal tax = subtotal.subtract(discount)
    .multiply(new BigDecimal(dto.getTaxRate()));
  
  billing.setSubtotal(subtotal);
  billing.setDiscount(discount);
  billing.setTax(tax);
  billing.setTotal(subtotal.subtract(discount).add(tax));
  billing.setStatus("unpaid");
  
  // 4. Save all (cascade saves items)
  Billing saved = billingRepository.save(billing);
  
  return billingMapper.toDTO(saved);
}
```

---

## Read/Query Flow (Get Patient Profile)

### Simple Query Flow

```
User clicks on patient name in list
        ↓
Angular route changes to /patients/{id}
        ↓
PatientProfileComponent initializes
        ↓
OnInit hook triggers
        ↓
PatientService.getById(id)
        ↓
HTTP GET /api/patients/{id}
        ↓
AuthInterceptor adds JWT token
        ↓
Backend PatientController.getById(id)
        ↓
PatientService.findById(id)
        ↓
PatientRepository.findById(id)
        ↓
Hibernate ORM generates:
  SELECT * FROM patients WHERE id = ?
        ↓
PostgreSQL executes query
        ↓
Database returns patient record
        ↓
Hibernate maps result to Patient entity
        ↓
Repository returns Optional<Patient>
        ↓
Service maps entity to DTO
        ↓
Controller returns DTO in response
        ↓
HTTP 200 OK with patient JSON
        ↓
Frontend Observable emits
        ↓
Component receives data
        ↓
Template binds to {{patient.name}}, {{patient.email}}, etc.
        ↓
User sees patient profile
```

---

## Error Handling Flow

### Exception Propagation

```
Frontend
  │
  └─→ HTTP Request sent
       │
       └─→ Backend receives
            │
            └─→ Exception occurs in Service
                 │
                 └─→ Global Exception Handler catches
                      │
                      └─→ Format error response
                           │
                           └─→ Return HTTP error code
                                │
                                └─→ Frontend receives error
                                     │
                                     └─→ Interceptor handles
                                          │
                                          └─→ Service catches in catchError
                                               │
                                               └─→ Component displays to user
```

### Example: Email Already Exists

**Frontend:**
```typescript
this.patientService.create(formData).subscribe(
  (success) => { /* handle success */ },
  (error) => {
    // error.status = 400
    // error.error.message = "Email already exists"
    this.toastr.error(error.error.message);
  }
);
```

**Backend:**
```java
@PostMapping
public ResponseEntity<?> createPatient(@RequestBody PatientDTO dto) {
  try {
    PatientDTO saved = patientService.create(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  } catch (ValidationException e) {
    // Thrown by service when email exists
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
      .body(new ErrorResponse("Validation Error", e.getMessage(), 400));
  }
}
```

**Response Format:**
```json
{
  "timestamp": "2026-09-03T14:30:00Z",
  "status": 400,
  "error": "Validation Error",
  "message": "Email already exists",
  "path": "/api/patients"
}
```

---

## Data Transformation Flow

### Entity ↔ DTO Mapping

```
Raw Request JSON
    ↓
Deserialize to DTO (Jackson)
    ↓
PatientDTO {
  name: "John Doe",
  email: "john@example.com"
}
    ↓
Service receives DTO
    ↓
Mapper converts DTO → Entity
    ↓
Patient Entity {
  id: null,
  name: "John Doe",
  email: "john@example.com",
  createdAt: now(),
  updatedAt: now()
}
    ↓
Repository saves entity
    ↓
Database INSERT
    ↓
Entity comes back with generated ID
    ↓
Mapper converts Entity → DTO
    ↓
PatientDTO {
  id: 150,
  name: "John Doe",
  email: "john@example.com"
}
    ↓
Serialize to JSON response
    ↓
Client receives JSON
```

---

## Related Documentation

- See [PROJECT_STATE.md](./PROJECT_STATE.md) for current status
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [COMPONENTS.md](./COMPONENTS.md) for detailed component breakdown
- See [API_DESIGN.md](./API_DESIGN.md) for API specifications
