import { FormField } from '../types';

export interface FormTemplate {
  formName: string;
  fields: FormField[];
}

export const FORM_TEMPLATES: Record<string, FormField[]> = {
  'Digital Nomad Visa (D7) Application': [
    { label: 'Full Name', value: '', category: 'Personal', type: 'text' },
    { label: 'Date of Birth', value: '', category: 'Personal', type: 'date' },
    { label: 'Nationality', value: '', category: 'Personal', type: 'select', options: ['USA', 'Canada', 'UK', 'Australia', 'Other'] },
    { label: 'Passport Number', value: '', category: 'Identity', type: 'text' },
    { label: 'Monthly Income (EUR)', value: '', category: 'Financial', type: 'number' },
    { label: 'Occupation', value: '', category: 'Employment', type: 'select', options: ['Software Engineer', 'Designer', 'Writer', 'Consultant', 'Other'] },
    { label: 'Marital Status', value: '', category: 'Personal', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
    { label: 'Current Residence', value: '', category: 'Contact', type: 'text' },
  ],
  'Residency Permit (Anmeldung)': [
    { label: 'First Name', value: '', category: 'Personal', type: 'text' },
    { label: 'Last Name', value: '', category: 'Personal', type: 'text' },
    { label: 'Gender', value: '', category: 'Personal', type: 'select', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
    { label: 'Move-in Date', value: '', category: 'Housing', type: 'date' },
    { label: 'Landlord Name', value: '', category: 'Housing', type: 'text' },
    { label: 'City of Birth', value: '', category: 'Personal', type: 'text' },
  ],
  'Tax ID (NIF) Request': [
    { label: 'Full Name', value: '', category: 'Personal', type: 'text' },
    { label: 'Passport Number', value: '', category: 'Identity', type: 'text' },
    { label: 'Address in Origin Country', value: '', category: 'Contact', type: 'text' },
    { label: 'Fiscal Representative Name', value: '', category: 'Legal', type: 'text' },
  ],
  'Asylum Statement of Fear': [
    { label: 'Full Name', value: '', category: 'Personal', type: 'text' },
    { label: 'Nationality', value: '', category: 'Personal', type: 'text' },
    { label: 'Reason for Seeking Protection', value: '', category: 'Statement', type: 'text' },
    { label: 'Specific Incidents', value: '', category: 'Statement', type: 'text' },
  ]
};
