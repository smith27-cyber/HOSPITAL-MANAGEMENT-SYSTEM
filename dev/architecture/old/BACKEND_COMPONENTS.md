# HMS Backend Components

**Version:** 1.1
**Last Updated:** 2026-09-22

---

## Configuration Layer

### 1. SecurityConfig
**File:** `src/main/java/com/hms/backend/config/SecurityConfig.java`
**Responsibility:** Spring Security configuration

**Key Methods:**
- Configure JWT filter
- Configure CORS — a global `CorsConfigurationSource` bean restricting
  origins to `http://localhost:4200`, registered on `/**`. **Note:**
  `ConsultationController` overrides this per-controller with
  `@CrossOrigin(origins = "*")`, opening its endpoints to any origin
  despite the global policy — see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) (P0).
- Configure authorization rules
- Configure password encoder

**Security Rules:**
- Public endpoints: `/api/auth/login`, `/api/auth/register`
- Protected endpoints: All other `/api/**` paths require JWT
- Role-based access control (`Role`/`Permission` entities, `RbacDataInitializer` seed data, `@PreAuthorize` authority checks per endpoint)

See [SECURITY.md](./SECURITY.md) for the full authentication/authorization picture.

### 2. PasswordConfig
**File:** `src/main/java/com/hms/backend/config/PasswordConfig.java`
**Responsibility:** Password encoding configuration

**Components:**
- BCryptPasswordEncoder bean
- Password encoding algorithm selection

### 3. OpenApiConfig
**File:** `src/main/java/com/hms/backend/config/OpenApiConfig.java`
**Responsibility:** Swagger/OpenAPI documentation configuration (backs the
`/swagger-ui/index.html` and `/api-docs` endpoints referenced in
README.md's Quick Start)

---

## Entity Layer

See [DATA_MODEL.md](./DATA_MODEL.md) for the full entity table and
relationship diagrams — 18 JPA entities total.

---

## Repository Layer

16 Spring Data JPA repositories providing CRUD operations and custom queries:

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
- AdmissionRepository
- PharmacyPrescriptionRepository
- LaboratoryTestRepository
- LaboratoryRequestRepository
- BillingRepository
- BillingItemRepository
- InventoryRepository
- HospitalSettingsRepository
- RoleRepository
- PermissionRepository
- UserRepository (auth package)

---

## Service Layer

16 business logic services:

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
- AdmissionService
- PharmacyService
- LaboratoryService
- InventoryService
- DashboardService
- HospitalSettingsService
- AuthService, JwtService, UserService (auth package)

---

## Controller Layer

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
- LaboratoryTestController
- LaboratoryRequestController
- AdmissionController
- InventoryController
- PharmacyPrescriptionController
- HospitalSettingsController
- DashboardController
- HealthController
- AuthController, LoginFormController, UserController (auth package)

See [API_DESIGN.md](./API_DESIGN.md) for full endpoint specifications.

---

## DTO Layer (Data Transfer Objects)

**Inconsistently applied** — most controllers bind `@RequestBody` directly
to the JPA entity, not a DTO. Only some request bodies actually go through
a dedicated DTO. The naming pattern is `<Entity>Request` /
`<Entity>Response` (not `<Entity>DTO`).

**Actually used by a controller:**
- `AppointmentRequest`/`AppointmentResponse` — used by `AppointmentController`
- `ConsultationRequest`/`ConsultationResponse` — used by `ConsultationController`
- `BillingRequest`/`BillingItemRequest`/`PaymentRequest` — used by `BillingController`
- `DashboardResponse` — used by `DashboardController`

**Defined in `dto/` but not referenced anywhere (dead code):**
- `PatientRequest`, `PatientResponse` — `PatientController` binds
  `@RequestBody Patient patient` directly instead
- `DoctorRequest` — `DoctorController` binds the `Doctor` entity directly
- `ErrorResponse` — see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) (P1); no global
  exception handling exists to construct one

**No DTO at all — controller binds the JPA entity directly as the request
body:** `DepartmentController`, `AdmissionController`, `InventoryController`,
`PatientController`, `LaboratoryRequestController`, `DoctorController`,
`LaboratoryTestController`, `HospitalSettingsController`,
`PharmacyPrescriptionController`.

**PatientRequest** (unused, but present)
```java
- String firstName
- String lastName
- String dateOfBirth
- String gender
- String phone
- String email
- String address
- String nationalId
- String emergencyContactName
```

---

## Related Documentation

- [DATA_MODEL.md](./DATA_MODEL.md) — entities and relationships
- [FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md) — what calls these components
- [SECURITY.md](./SECURITY.md) — SecurityConfig details
- [API_DESIGN.md](./API_DESIGN.md) — full endpoint specifications
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — CORS override, missing exception handling
