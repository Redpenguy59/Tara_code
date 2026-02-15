import axios from 'axios';

// 1. POINT TO YOUR PYTHON BACKEND
const PYTHON_URL = "http://127.0.0.1:8000/tourism/check";

/**
 * The "Bridge" Function
 * This sends User Data + Goal Data to Python.
 */
const callPythonEngine = async (payload: any) => {
  try {
    console.log("✈️ Sending to Python:", payload); // Debug log to see what is being sent
    const response = await axios.post(PYTHON_URL, payload);
    console.log("✅ Received from Python:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ TARA Python Bridge Error:", error);
    // Fallback data so the app doesn't crash if Python is off
    return {
      documents: ['Passport (Fallback)', 'Application Form'],
      steps: [{ id: '1', text: 'Check connection to backend', isCompleted: false }],
      forms: [],
      submissionPoints: []
    };
  }
};

// --- CORE FUNCTIONS CALLED BY APP.TSX ---

// 1. This is called when you finish the "New Goal" wizard
export const getDetailedRequirements = async (country: string, type: string, profile: any, context: any) => {
  return callPythonEngine({
    request_type: 'requirements',
    country: country,
    type: type,      // e.g., "Visa", "Residency"
    profile: profile, // This contains your User Name, Nationalities, etc.
    context: context  // This contains Wizard answers like duration/reason
  });
};

// 2. This gets forms/locations for the new goal
export const getApplicationResources = async (country: string, type: string, profile: any, context: any) => {
  return callPythonEngine({
    request_type: 'resources',
    country: country,
    type: type,
    profile: profile,
    context: context
  });
};

// --- REQUIRED PLACEHOLDERS (To prevent blank screen crashes) ---

export const getTravelAdvisory = async (country: string) => {
  const data = await callPythonEngine({ country, request_type: 'advisory', profile: {}, type: 'general' });
  return typeof data === 'string' ? data : "Exercise normal safety precautions.";
};

export const getBureaucracyGuidance = async (country: string, purpose: string, profile: any) => 
  callPythonEngine({ country, type: purpose, profile, request_type: 'guidance' });

export const getContextualQuestions = async (country: string, type: string) => {
  return [
    { label: "Specific purpose (e.g. Software Engineer, Student)", key: "reason", type: "text" },
    { label: "Intended duration of stay (months)", key: "duration", type: "number" }
  ];
};

export const checkVisaFreeStatus = async (nationalities: string[], destination: string) => {
  return { isVisaFree: false, duration: "" }; 
};

// These stop the other components from breaking
export const getAppointmentChecklist = async () => ({ items: [] });
export const findAppointments = async () => [];
export const getCitizenshipRoadmap = async () => ({ steps: [], timeline: "Unknown" });
export const extractDocumentData = async () => ({ documentNumber: "", expiryDate: "", name: "" });
export const getApplicationResourcesForCountry = async () => ({ forms: [] });
export const getMigrationAdvice = async (o: string, d: string, p: any) => ({});