import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  PharmacyService
} from '../../../core/services/pharmacy.service';

import {
  PharmacyPrescriptionItem
} from '../../../shared/models/pharmacy.model';


interface PharmacyMedicine {
  id: string;
  name: string;
  category: string;
  form?: string;
  strength?: string;
  batchNumber?: string;
  quantity: number;
  unitPrice: number;
  expiryDate?: string;
  status: string;
}


@Component({
  selector: 'app-pharmacy-add-prescription',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './pharmacy-add-prescription.html',

  styleUrl:
    './pharmacy-add-prescription.css'
})
export class PharmacyAddPrescription
  implements OnInit {


  // =====================================================
  // CUSTOMER
  // =====================================================

  customerName =
    '';


  // =====================================================
  // MEDICINES
  // =====================================================

  medicines:
    PharmacyMedicine[] = [];

  filteredMedicines:
    PharmacyMedicine[] = [];

  searchTerm =
    '';

  selectedMedicine:
    PharmacyMedicine | null = null;

  showMedicineResults =
    false;


  // =====================================================
  // MEDICINE FORM
  // =====================================================

  medicineQuantity =
    1;

  dosage =
    '';

  frequency =
    '';

  duration =
    '';

  instructions =
    '';


  // =====================================================
  // PRESCRIPTION ITEMS
  // =====================================================

  prescriptionItems:
    PharmacyPrescriptionItem[] = [];


  // =====================================================
  // STATE
  // =====================================================

  isSaving =
    false;

  isAddingMedicine =
    false;

  errorMessage =
    '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly pharmacyService:
      PharmacyService,

    private readonly router:
      Router,

    private readonly changeDetectorRef:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadMedicines();

  }


  // =====================================================
  // LOAD MEDICINES
  // =====================================================

  private loadMedicines(): void {

    try {

      const medicines =
        this.pharmacyService
          .getAvailableMedicines();


      console.log(
        'Medicines returned from PharmacyService:',
        medicines
      );


      if (
        !Array.isArray(
          medicines
        )
      ) {

        this.medicines =
          [];

        this.filteredMedicines =
          [];

        this.errorMessage =
          'No pharmacy medicines are available.';

        this.changeDetectorRef.detectChanges();

        return;

      }


      this.medicines =
        medicines

          .filter(
            medicine =>
              Number(
                medicine.quantity
              ) > 0
          )

          .map(
            medicine => ({

              id:
                String(
                  medicine.id
                ),

              name:
                String(
                  medicine.name || ''
                )
                  .trim() ||
                'Unnamed Medicine',

              category:
                String(
                  medicine.category ||
                  'Medicine'
                ),

              form:
                medicine.form
                  ? String(
                      medicine.form
                    )
                  : undefined,

              strength:
                medicine.strength
                  ? String(
                      medicine.strength
                    )
                  : undefined,

              batchNumber:
                medicine.batchNumber
                  ? String(
                      medicine.batchNumber
                    )
                  : undefined,

              quantity:
                Number(
                  medicine.quantity
                ) || 0,

              unitPrice:
                Number(
                  medicine.unitPrice
                ) || 0,

              expiryDate:
                medicine.expiryDate
                  ? String(
                      medicine.expiryDate
                    )
                  : undefined,

              status:
                String(
                  medicine.status ||
                  'In Stock'
                )

            })
          );


      console.log(
        'Medicines available for pharmacy:',
        this.medicines
      );


      this.filteredMedicines =
        [
          ...this.medicines
        ];


      this.changeDetectorRef.detectChanges();


    } catch (
      error
    ) {

      console.error(
        'Failed to load pharmacy medicines:',
        error
      );


      this.medicines =
        [];

      this.filteredMedicines =
        [];

      this.errorMessage =
        'Unable to load pharmacy medicines.';


      this.changeDetectorRef.detectChanges();

    }

  }


  // =====================================================
  // MEDICINE SEARCH
  // =====================================================

  onMedicineSearch(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    // ---------------------------------------------------
    // NO SEARCH TEXT
    // ---------------------------------------------------

    if (
      !search
    ) {

      this.filteredMedicines =
        [
          ...this.medicines
        ];

      this.showMedicineResults =
        true;

      this.changeDetectorRef.detectChanges();

      return;

    }


    // ---------------------------------------------------
    // SEARCH MEDICINES
    // ---------------------------------------------------

    this.filteredMedicines =
      this.medicines.filter(
        medicine => {

          return (

            medicine.name
              .toLowerCase()
              .includes(
                search
              ) ||

            String(
              medicine.form || ''
            )
              .toLowerCase()
              .includes(
                search
              ) ||

            String(
              medicine.strength || ''
            )
              .toLowerCase()
              .includes(
                search
              ) ||

            String(
              medicine.batchNumber || ''
            )
              .toLowerCase()
              .includes(
                search
              )

          );

        }
      );


    this.showMedicineResults =
      true;


    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // SHOW MEDICINE DROPDOWN
  // =====================================================

  onMedicineFocus(): void {

    this.onMedicineSearch();

  }


  // =====================================================
  // SELECT MEDICINE
  // =====================================================

  selectMedicine(
    medicine:
      PharmacyMedicine
  ): void {

    if (
      !medicine
    ) {

      return;

    }


    console.log(
      'Selecting pharmacy medicine:',
      medicine
    );


    this.selectedMedicine =
      {
        ...medicine
      };


    this.searchTerm =
      medicine.name;


    this.medicineQuantity =
      1;


    this.showMedicineResults =
      false;


    console.log(
      'Selected pharmacy medicine:',
      this.selectedMedicine
    );


    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // ADD MEDICINE
  // =====================================================

  addMedicine(): void {

    if (
      this.isAddingMedicine
    ) {

      return;

    }


    console.log(
      'Adding pharmacy medicine:',
      this.selectedMedicine
    );


    // ---------------------------------------------------
    // VALIDATE SELECTION
    // ---------------------------------------------------

    if (
      !this.selectedMedicine
    ) {

      alert(
        'Please select a medicine from the search results.'
      );

      return;

    }


    this.isAddingMedicine =
      true;


    try {

      const medicine =
        this.selectedMedicine;


      // -------------------------------------------------
      // VALIDATE QUANTITY
      // -------------------------------------------------

      const quantity =
        Number(
          this.medicineQuantity
        );


      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {

        alert(
          'Please enter a valid quantity.'
        );

        return;

      }


      // -------------------------------------------------
      // VALIDATE STOCK
      // -------------------------------------------------

      const availableQuantity =
        Number(
          medicine.quantity
        );


      if (
        quantity >
        availableQuantity
      ) {

        alert(
          `Only ${availableQuantity} units of ${medicine.name} are available.`
        );

        return;

      }


      // -------------------------------------------------
      // PREVENT DUPLICATES
      // -------------------------------------------------

      const medicineId =
        String(
          medicine.id
        );


      const alreadyAdded =
        this.prescriptionItems.some(
          item =>
            String(
              item.medicineId
            ) ===
            medicineId
        );


      if (
        alreadyAdded
      ) {

        alert(
          'This medicine has already been added.'
        );

        return;

      }


      // -------------------------------------------------
      // PRICE
      // -------------------------------------------------

      const unitPrice =
        Number(
          medicine.unitPrice
        ) || 0;


      const totalPrice =
        unitPrice *
        quantity;


      // -------------------------------------------------
      // BUILD ITEM
      // -------------------------------------------------

      const item:
        PharmacyPrescriptionItem = {

        medicineId:
          medicineId,

        medicineName:
          medicine.name,

        itemCode:
          medicine.batchNumber ||
          undefined,

        quantity:
          quantity,

        unit:
          this.getMedicineUnit(
            medicine
          ),

        unitPrice:
          unitPrice,

        totalPrice:
          totalPrice,

        dosage:
          this.dosage
            .trim() ||
          undefined,

        frequency:
          this.frequency
            .trim() ||
          undefined,

        duration:
          this.duration
            .trim() ||
          undefined,

        instructions:
          this.instructions
            .trim() ||
          undefined

      };


      console.log(
        'Prescription item created:',
        item
      );


      // -------------------------------------------------
      // ADD ITEM
      // -------------------------------------------------

      this.prescriptionItems =
        [
          ...this.prescriptionItems,
          item
        ];


      console.log(
        'Prescription items:',
        this.prescriptionItems
      );


      // -------------------------------------------------
      // RESET FORM
      // -------------------------------------------------

      this.resetMedicineForm();


      this.changeDetectorRef.detectChanges();


    } finally {

      this.isAddingMedicine =
        false;


      this.changeDetectorRef.detectChanges();

    }

  }


  // =====================================================
  // REMOVE MEDICINE
  // =====================================================

  removeMedicine(
    medicineId:
      string
  ): void {

    this.prescriptionItems =
      this.prescriptionItems.filter(
        item =>
          String(
            item.medicineId
          ) !==
          String(
            medicineId
          )
      );


    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // RESET MEDICINE FORM
  // =====================================================

  private resetMedicineForm(): void {

    this.searchTerm =
      '';

    this.selectedMedicine =
      null;

    this.showMedicineResults =
      false;

    this.medicineQuantity =
      1;

    this.dosage =
      '';

    this.frequency =
      '';

    this.duration =
      '';

    this.instructions =
      '';

    this.filteredMedicines =
      [
        ...this.medicines
      ];


    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // MEDICINE UNIT
  // =====================================================

  private getMedicineUnit(
    medicine:
      PharmacyMedicine
  ):
    string {

    const form =
      String(
        medicine.form || ''
      )
        .trim()
        .toLowerCase();


    switch (
      form
    ) {

      case 'tablet':

        return 'Tablet';


      case 'tablets':

        return 'Tablet';


      case 'capsule':

        return 'Capsule';


      case 'capsules':

        return 'Capsule';


      case 'syrup':

        return 'Bottle';


      case 'injection':

        return 'Vial';


      case 'vial':

        return 'Vial';


      case 'bottle':

        return 'Bottle';


      default:

        return 'Piece';

    }

  }


  // =====================================================
  // TOTAL
  // =====================================================

  get prescriptionTotal():
    number {

    return this.prescriptionItems.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.totalPrice || 0
        ),
      0
    );

  }


  // =====================================================
  // SAVE PRESCRIPTION
  // =====================================================

  savePrescription(): void {

    this.errorMessage =
      '';


    // ---------------------------------------------------
    // VALIDATE CUSTOMER
    // ---------------------------------------------------

    if (
      !this.customerName.trim()
    ) {

      alert(
        'Please enter the customer name.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE ITEMS
    // ---------------------------------------------------

    if (
      this.prescriptionItems.length ===
      0
    ) {

      alert(
        'Please add at least one medicine.'
      );

      return;

    }


    // ---------------------------------------------------
    // PREVENT DUPLICATE SAVE
    // ---------------------------------------------------

    if (
      this.isSaving
    ) {

      return;

    }


    this.isSaving =
      true;


    this.changeDetectorRef.detectChanges();


    console.log(
      'Saving pharmacy prescription:',
      {
        patientName:
          this.customerName.trim(),

        items:
          this.prescriptionItems
      }
    );


    this.pharmacyService
      .createPrescription({

        // Backend generates WALKIN-...
        // when no patient ID is supplied.

        patientName:
          this.customerName.trim(),

        items:
          this.prescriptionItems,

        notes:
          undefined

      })
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next:
          prescription => {

            console.log(
              'Pharmacy prescription created:',
              prescription
            );


            this.isSaving =
              false;


            this.changeDetectorRef.detectChanges();


            alert(
              `Prescription ${prescription.prescriptionNumber} created successfully.`
            );


            this.router.navigate(
              [
                '/pharmacy/queue'
              ]
            );

          },


        // =================================================
        // ERROR
        // =================================================

        error:
          error => {

            console.error(
              'Failed to create pharmacy prescription:',
              error
            );


            this.isSaving =
              false;


            this.errorMessage =
              error?.error?.message ||
              error?.message ||
              'Unable to create the pharmacy prescription.';


            this.changeDetectorRef.detectChanges();

          }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate(
      [
        '/pharmacy/queue'
      ]
    );

  }

}