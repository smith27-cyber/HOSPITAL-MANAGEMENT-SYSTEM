# HMS Feature Completeness Matrix

**Last Updated:** 2026-09-22

---

### Patient Management
- ✅ Register new patient
- ✅ View patient list
- ✅ View patient profile
- ✅ Edit patient information
- ✅ Patient medical history

### Doctor Management
- ✅ Register new doctor
- ✅ View doctor list
- ✅ View doctor profile
- ✅ Edit doctor information
- ✅ Department assignment

### Appointments
- ✅ Schedule appointment
- ✅ View appointment list
- ✅ Manage appointment queue
- ✅ Appointment details
- ✅ Edit appointment

### Consultations
- ✅ Create consultation record
- ✅ View consultations
- ✅ Edit consultation notes
- ✅ Link to prescriptions

### Admissions
- ✅ Admit patient (ward/bed assignment)
- ✅ View admission list & details
- ✅ Transfer between wards/beds
- ✅ Discharge / cancel admission
- ✅ Admission statistics (active, discharged, transferred, cancelled)

### Pharmacy
- ✅ Prescription management
- ✅ Pharmacy queue view
- ✅ Stock management
- ✅ Medication tracking

### Laboratory
- ✅ Lab test management
- ✅ Lab request handling
- ✅ Test result tracking
- ✅ Lab queue management

### Billing
- ✅ Create invoice
- ✅ View billing records
- ✅ Payment processing
- ✅ Billing items management

### Inventory
- ✅ Equipment tracking
- ✅ Supply management
- ✅ Stock levels
- ✅ Reorder management

### Reports & Analytics
- ✅ Dashboard metrics
- ✅ Report generation
- ✅ Analytics visualization

### Settings & Configuration
- ✅ Hospital settings (backend-persisted via `HospitalSettingsController`)
- 🟡 System preferences (frontend only, no backend persistence yet)
- 🟡 Notification settings (frontend only, no backend persistence yet)

### Authentication & RBAC
- ✅ JWT login/logout
- ✅ Role-based access control (`Role`, `Permission` entities, `RbacDataInitializer` seed data)
- ✅ User management (`UserController`, `UserService`)

---

## Related Documentation

- [FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md) — implementation detail per module
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — gaps not reflected in the ✅s above (e.g. CORS, error handling)
- [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) — overall project status
