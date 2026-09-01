import { Injectable } from '@angular/core';
import { Department } from '../../shared/models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private readonly STORAGE_KEY = 'hms_departments';

  private departments: Department[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {
    this.loadDepartments();
  }


  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================

  private loadDepartments(): void {

    const storedDepartments =
      localStorage.getItem(this.STORAGE_KEY);


    // =====================================================
    // FIRST RUN
    // =====================================================

    if (!storedDepartments) {

      this.departments =
        this.createDefaultDepartments();

      this.saveDepartments();

      return;
    }


    // =====================================================
    // LOAD EXISTING DATA
    // =====================================================

    try {

      const stored =
        JSON.parse(storedDepartments);


      if (!Array.isArray(stored)) {

        throw new Error(
          'Stored departments data is not an array.'
        );

      }


      this.departments =
        stored as Department[];


      // ---------------------------------------------------
      // Make sure existing departments have valid IDs
      // ---------------------------------------------------

      this.repairDepartmentIds();


      // ---------------------------------------------------
      // Add departments that are missing
      // ---------------------------------------------------

      this.addMissingDefaultDepartments();


    } catch (error) {

      console.error(
        'Failed to load departments:',
        error
      );


      this.departments =
        this.createDefaultDepartments();

      this.saveDepartments();

    }

  }


  // =====================================================
  // DEFAULT DEPARTMENT TEMPLATES
  // =====================================================

  private getDefaultDepartmentTemplates() {

    return [

      {
        name: 'General Medicine',
        code: 'GEN',
        description:
          'Provides diagnosis and treatment for common medical conditions.',
        location: 'Main Hospital'
      },

      {
        name: 'Internal Medicine',
        code: 'IMED',
        description:
          'Provides comprehensive care for adult patients and complex medical conditions.',
        location: 'Medical Block'
      },

      {
        name: 'Cardiology',
        code: 'CARD',
        description:
          'Specialized care for heart and cardiovascular conditions.',
        location: 'Medical Block'
      },

      {
        name: 'Neurology',
        code: 'NEUR',
        description:
          'Diagnosis and treatment of disorders affecting the nervous system.',
        location: 'Medical Block'
      },

      {
        name: 'Neurosurgery',
        code: 'NSUR',
        description:
          'Surgical treatment of conditions affecting the brain, spine and nervous system.',
        location: 'Surgical Block'
      },

      {
        name: 'Orthopedics',
        code: 'ORTH',
        description:
          'Treatment of conditions affecting bones, joints, muscles and the skeletal system.',
        location: 'Surgical Block'
      },

      {
        name: 'Pediatrics',
        code: 'PED',
        description:
          'Medical care for infants, children and adolescents.',
        location: 'Children Block'
      },

      {
        name: 'Obstetrics & Gynecology',
        code: 'OBGYN',
        description:
          'Healthcare services for pregnancy, childbirth and female reproductive health.',
        location: 'Women and Children Block'
      },

      {
        name: 'General Surgery',
        code: 'GSUR',
        description:
          'Surgical treatment for a wide range of medical conditions.',
        location: 'Surgical Block'
      },

      {
        name: 'Dental',
        code: 'DENT',
        description:
          'Diagnosis, prevention and treatment of dental and oral conditions.',
        location: 'Outpatient Block'
      },

      {
        name: 'ENT',
        code: 'ENT',
        description:
          'Treatment of conditions affecting the ear, nose and throat.',
        location: 'Outpatient Block'
      },

      {
        name: 'Ophthalmology',
        code: 'OPHT',
        description:
          'Diagnosis and treatment of eye and vision disorders.',
        location: 'Outpatient Block'
      },

      {
        name: 'Dermatology',
        code: 'DERM',
        description:
          'Diagnosis and treatment of skin, hair and nail conditions.',
        location: 'Outpatient Block'
      },

      {
        name: 'Psychiatry',
        code: 'PSY',
        description:
          'Assessment and treatment of mental and behavioral health conditions.',
        location: 'Medical Block'
      },

      {
        name: 'Radiology',
        code: 'RAD',
        description:
          'Medical imaging and diagnostic imaging services.',
        location: 'Diagnostic Block'
      },

      {
        name: 'Anesthesiology',
        code: 'ANES',
        description:
          'Anesthesia, pain management and perioperative medical care.',
        location: 'Surgical Block'
      },

      {
        name: 'Emergency Medicine',
        code: 'EMER',
        description:
          'Immediate assessment and treatment of urgent and emergency medical conditions.',
        location: 'Emergency Block'
      },

      {
        name: 'Intensive Care Unit',
        code: 'ICU',
        description:
          'Specialized care for critically ill patients requiring continuous monitoring.',
        location: 'Critical Care Block'
      },

      {
        name: 'Neonatal Intensive Care Unit',
        code: 'NICU',
        description:
          'Specialized intensive care for newborns requiring advanced medical support.',
        location: 'Women and Children Block'
      },

      {
        name: 'Laboratory',
        code: 'LAB',
        description:
          'Clinical laboratory testing and diagnostic investigations.',
        location: 'Diagnostic Block'
      },

      {
        name: 'Pharmacy',
        code: 'PHARM',
        description:
          'Medication dispensing, pharmaceutical services and medication management.',
        location: 'Main Hospital'
      },

      {
        name: 'Physiotherapy',
        code: 'PHYS',
        description:
          'Physical rehabilitation and treatment to improve movement and function.',
        location: 'Rehabilitation Block'
      },

      {
        name: 'Nutrition & Dietetics',
        code: 'NUT',
        description:
          'Nutritional assessment, dietary planning and therapeutic nutrition services.',
        location: 'Main Hospital'
      },

      {
        name: 'Oncology',
        code: 'ONCO',
        description:
          'Diagnosis and treatment of cancer and related conditions.',
        location: 'Specialist Block'
      },

      {
        name: 'Urology',
        code: 'UROL',
        description:
          'Diagnosis and treatment of urinary tract and male reproductive conditions.',
        location: 'Specialist Block'
      },

      {
        name: 'Nephrology',
        code: 'NEPH',
        description:
          'Diagnosis and treatment of kidney-related diseases and conditions.',
        location: 'Medical Block'
      },

      {
        name: 'Gastroenterology',
        code: 'GAST',
        description:
          'Diagnosis and treatment of digestive system disorders.',
        location: 'Medical Block'
      },

      {
        name: 'Pulmonology',
        code: 'PULM',
        description:
          'Diagnosis and treatment of respiratory and lung diseases.',
        location: 'Medical Block'
      },

      {
        name: 'Infectious Diseases',
        code: 'ID',
        description:
          'Diagnosis, treatment and prevention of infectious diseases.',
        location: 'Medical Block'
      },

      {
        name: 'Family Medicine',
        code: 'FAM',
        description:
          'Comprehensive healthcare for individuals and families across all age groups.',
        location: 'Outpatient Block'
      },

      {
        name: 'Outpatient Department',
        code: 'OPD',
        description:
          'Medical services provided to patients who do not require hospital admission.',
        location: 'Outpatient Block'
      },

      {
        name: 'Inpatient Department',
        code: 'IPD',
        description:
          'Medical services and care for admitted hospital patients.',
        location: 'Inpatient Block'
      },

      {
        name: 'Accident & Emergency',
        code: 'A&E',
        description:
          'Emergency assessment and treatment for accidents, injuries and acute illnesses.',
        location: 'Emergency Block'
      },

      {
        name: 'Medical Records',
        code: 'MR',
        description:
          'Management, storage and retrieval of patient medical records.',
        location: 'Administration Block'
      },

      {
        name: 'Mortuary',
        code: 'MORT',
        description:
          'Management and care of deceased patients.',
        location: 'Mortuary Block'
      }

    ];

  }


  // =====================================================
  // CREATE DEFAULT DEPARTMENTS
  // =====================================================

  private createDefaultDepartments(): Department[] {

    const templates =
      this.getDefaultDepartmentTemplates();


    const departments: Department[] = [];


    templates.forEach(
      template => {

        departments.push({

          id:
            this.generateDepartmentId(
              departments
            ),

          name:
            template.name,

          code:
            template.code,

          description:
            template.description,

          headOfDepartment:
            undefined,

          phone:
            undefined,

          email:
            undefined,

          location:
            template.location,

          status:
            'Active',

          createdAt:
            new Date().toISOString()

        });

      }
    );


    return departments;

  }


  // =====================================================
  // ADD MISSING DEFAULT DEPARTMENTS
  // =====================================================

  private addMissingDefaultDepartments(): void {

    const defaults =
      this.getDefaultDepartmentTemplates();


    let changed = false;


    for (const template of defaults) {

      const exists =
        this.departments.some(
          department =>

            department.code
              ?.toUpperCase() ===
            template.code
              .toUpperCase()

            ||

            department.name
              ?.toLowerCase() ===
            template.name
              .toLowerCase()
        );


      if (exists) {
        continue;
      }


      this.departments.push({

        id:
          this.generateDepartmentId(
            this.departments
          ),

        name:
          template.name,

        code:
          template.code,

        description:
          template.description,

        headOfDepartment:
          undefined,

        phone:
          undefined,

        email:
          undefined,

        location:
          template.location,

        status:
          'Active',

        createdAt:
          new Date().toISOString()

      });


      changed = true;

    }


    if (changed) {

      this.saveDepartments();

    }

  }


  // =====================================================
  // REPAIR DEPARTMENT IDS
  // =====================================================

  private repairDepartmentIds(): void {

    const usedIds =
      new Set<string>();


    let changed = false;


    this.departments =
      this.departments.map(
        department => {

          let id =
            department.id;


          if (
            !id ||
            usedIds.has(id)
          ) {

            id =
              this.generateDepartmentId(
                this.departments
              );

            changed = true;

          }


          usedIds.add(id);


          return {

            ...department,

            id

          };

        }
      );


    if (changed) {

      this.saveDepartments();

    }

  }


  // =====================================================
  // SAVE DEPARTMENTS
  // =====================================================

  private saveDepartments(): void {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(
        this.departments
      )
    );

  }


  // =====================================================
  // GET ALL DEPARTMENTS
  // =====================================================

  getDepartments(): Department[] {

    return [
      ...this.departments
    ];

  }


  // =====================================================
  // GET ACTIVE DEPARTMENTS
  // =====================================================

  getActiveDepartments(): Department[] {

    return this.departments.filter(
      department =>
        department.status === 'Active'
    );

  }


  // =====================================================
  // GET DEPARTMENT BY ID
  // =====================================================

  getDepartmentById(
    id: string
  ): Department | undefined {

    return this.departments.find(
      department =>
        department.id === id
    );

  }


  // =====================================================
  // GET DEPARTMENT BY NAME
  // =====================================================

  getDepartmentByName(
    name: string
  ): Department | undefined {

    return this.departments.find(
      department =>
        department.name
          .toLowerCase() ===
        name.toLowerCase()
    );

  }


  // =====================================================
  // ADD DEPARTMENT
  // =====================================================

  addDepartment(
    departmentData: Omit<
      Department,
      'id' | 'status' | 'createdAt'
    >
  ): Department {

    const department: Department = {

      id:
        this.generateDepartmentId(
          this.departments
        ),

      name:
        departmentData.name,

      code:
        departmentData.code,

      description:
        departmentData.description,

      headOfDepartment:
        departmentData.headOfDepartment,

      phone:
        departmentData.phone,

      email:
        departmentData.email,

      location:
        departmentData.location,

      status:
        'Active',

      createdAt:
        new Date().toISOString()

    };


    this.departments.push(
      department
    );


    this.saveDepartments();


    return department;

  }


  // =====================================================
  // UPDATE DEPARTMENT
  // =====================================================

  updateDepartment(
    updatedDepartment: Department
  ): void {

    const index =
      this.departments.findIndex(
        department =>
          department.id ===
          updatedDepartment.id
      );


    if (index === -1) {
      return;
    }


    this.departments[index] =
      updatedDepartment;


    this.saveDepartments();

  }


  // =====================================================
  // DEACTIVATE DEPARTMENT
  // =====================================================

  deactivateDepartment(
    id: string
  ): void {

    const department =
      this.getDepartmentById(id);


    if (!department) {
      return;
    }


    department.status =
      'Inactive';


    this.saveDepartments();

  }


  // =====================================================
  // ACTIVATE DEPARTMENT
  // =====================================================

  activateDepartment(
    id: string
  ): void {

    const department =
      this.getDepartmentById(id);


    if (!department) {
      return;
    }


    department.status =
      'Active';


    this.saveDepartments();

  }


  // =====================================================
  // DELETE DEPARTMENT
  // =====================================================

  deleteDepartment(
    id: string
  ): void {

    this.departments =
      this.departments.filter(
        department =>
          department.id !== id
      );


    this.saveDepartments();

  }


  // =====================================================
  // GENERATE DEPARTMENT ID
  // =====================================================

  private generateDepartmentId(
    departments: Department[] = this.departments
  ): string {

    const year =
      new Date().getFullYear();


    const numbers =
      departments
        .map(
          department => {

            const match =
              department.id?.match(
                /DEPT-\d+-(\d+)/
              );


            return match
              ? Number(match[1])
              : 0;

          }
        );


    const nextNumber =
      numbers.length > 0
        ? Math.max(...numbers) + 1
        : 1;


    return `DEPT-${year}-${String(
      nextNumber
    ).padStart(4, '0')}`;

  }

}
