
import { Application, UserDocument, Appointment, UserProfile } from '../types';
import { INITIAL_APPLICATIONS, INITIAL_DOCUMENTS, INITIAL_APPOINTMENTS } from '../constants';

const KEYS = {
  APPLICATIONS: 'tara_applications',
  DOCUMENTS: 'tara_documents',
  APPOINTMENTS: 'tara_appointments',
  ROADMAPS: 'tara_roadmaps',
  PROFILE: 'tara_profile'
};

const DEFAULT_PROFILE: UserProfile = {
  nationalities: [],
  currentResidence: '',
  displayName: '',
  email: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  occupation: '',
  maritalStatus: 'Single',
  isSecurityEnabled: false,
  language: 'en',
  phoneNumber: '',
  address: '',
  isOnboarded: false,
  pinCode: ''
};

export const storage = {
  getApplications: (): Application[] => {
    const data = localStorage.getItem(KEYS.APPLICATIONS);
    return data ? JSON.parse(data) : INITIAL_APPLICATIONS;
  },
  saveApplications: (apps: Application[]) => {
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  },
  
  getDocuments: (): UserDocument[] => {
    const data = localStorage.getItem(KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : INITIAL_DOCUMENTS;
  },
  saveDocuments: (docs: UserDocument[]) => {
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs));
  },
  
  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : INITIAL_APPOINTMENTS;
  },
  saveAppointments: (apts: Appointment[]) => {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(apts));
  },

  getProfile: (): UserProfile => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getSavedRoadmaps: (): any[] => {
    const data = localStorage.getItem(KEYS.ROADMAPS);
    return data ? JSON.parse(data) : [];
  },
  saveRoadmap: (roadmap: any) => {
    const existing = storage.getSavedRoadmaps();
    localStorage.setItem(KEYS.ROADMAPS, JSON.stringify([roadmap, ...existing]));
  }
};
