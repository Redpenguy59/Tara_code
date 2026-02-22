
export enum ApplicationStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  PENDING_REVIEW = 'Pending Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  VISA_FREE = 'Visa Free'
}

export interface ApplicationForm {
  name: string;
  url: string;
  type: 'PDF' | 'Portal';
  description?: string;
  submittedAt?: string; 
}

export interface SubmissionPoint {
  name: string;
  type: 'Online Portal' | 'Embassy/Consulate' | 'Local Office' | 'Mail';
  location?: string;
  url?: string;
}

export interface TravelAdvisory {
  level: 'Low' | 'Medium' | 'High' | 'Extreme';
  message: string;
  lastUpdated: string;
}

export interface ApplicationStep {
  id: string;
  text: string;  // ✅ Matches backend
  title?: string;  // Optional
  description?: string;  // Optional  
  isCompleted: boolean;
}

export interface Application {
  id: string;
  title: string;
  country: string;
  type: 'Visa' | 'Residency' | 'Work Permit' | 'Tax ID' | 'Health Insurance' | 'Citizenship' | 'Asylum Application';
  status: ApplicationStatus;
  progress: number;
  lastUpdated: string;
  dueDate: string;
  requiredDocs: string[];
  completedDocs?: string[];
  steps?: ApplicationStep[];
  forms?: ApplicationForm[];
  submissionPoints?: SubmissionPoint[];
  advisory?: TravelAdvisory;
  isVisaFree?: boolean;
  visaFreeDuration?: string;
  travelContext?: {
    reason: string;
    duration: string;
    occupation: string;
    income?: string;
    [key: string]: string | undefined;
  };
}

export interface Nationality {
  country: string;
  isVerified: boolean;
  docId?: string;
}

export interface UserProfile {
  nationalities: Nationality[];
  currentResidence: string;
  displayName: string;
  email: string;
  isSecurityEnabled: boolean;
  language: string;
  profilePicture?: string;
  pinCode?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  maritalStatus?: string;
  passportNumber?: string;
  passportExpiry?: string;
  phoneNumber?: string;
  address?: string;
  isOnboarded: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Portal' | 'Document' | 'Guide';
  url: string;
  category: string;
  description: string;
  matchCriteria?: {
    occupations?: string[];
    minIncome?: number;
    excludedNationalities?: string[];
  };
}

export interface CountryData {
  name: string;
  code: string;
  flag: string;
  continent: string;
  summary: string;
  resources: Resource[];
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: 'Visa Update' | 'Citizenship' | 'Safety' | 'Policy';
  url: string;
}

export interface UserDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate?: string;
  content?: string;
  fileSize: string;
}

export interface Appointment {
  id: string;
  title: string;
  location: string;
  dateTime: string;
  applicationId: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

export interface ExtractionResult {
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  expiryDate?: string;
  nationality?: string;
  birthDate?: string;
}

export interface FormField {
  label: string;
  value: string;
  category: string;
  type: string;
  options?: string[];
}
