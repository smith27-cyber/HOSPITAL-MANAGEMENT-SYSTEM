# HMS Data Model

**Version:** 1.1
**Last Updated:** 2026-09-22

---

## Entities (18 Total)

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| User | Authentication and user accounts | ID, Username, Password, Email, Role |
| Role | RBAC role definitions | ID, Name, Permissions |
| Permission | RBAC permission definitions | ID, Name (e.g. `ADMISSION_VIEW`) |
| Patient | Patient records | ID, Name, Email, DOB, Gender, Address |
| Doctor | Doctor profiles | ID, Name, Specialization, License, Department |
| Department | Hospital departments | ID, Name, Description, Location |
| Appointment | Doctor-patient meetings | ID, PatientID, DoctorID, DateTime, Status |
| Consultation | Consultation records | ID, PatientID, DoctorID, Notes, Date |
| Admission | Inpatient admission records | ID, PatientID, DoctorID, DepartmentID, Ward, BedNumber, AdmissionType, Status, Dates |
| PharmacyPrescription | Medication prescriptions | ID, PatientID, Medications, Date |
| PharmacyPrescriptionItem | Individual medications | ID, PrescriptionID, Medication, Dosage |
| LaboratoryTest | Lab test definitions | ID, Name, Type, Cost |
| LaboratoryRequest | Lab test orders | ID, PatientID, TestID, Status |
| Billing | Invoices | ID, PatientID, Date, Total, Status |
| BillingPayment | Payment records | ID, BillingID, Amount, Date, Method |
| BillingItem | Invoice line items | ID, BillingID, Description, Cost |
| Inventory | Equipment/supplies | ID, Name, Quantity, Category |
| HospitalSettings | Hospital configuration (singleton) | ID, Name, Address, Contact, OperatingHours |

---

## Entity Relationships

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

## Related Documentation

- [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) — repository/service/controller layers built on these entities
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — design principles, scalability
- [API_DESIGN.md](./API_DESIGN.md) — how entities map to API payloads
