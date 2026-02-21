import axios from 'axios';

// 1. POINT TO YOUR PYTHON BACKEND
const PYTHON_URL = "http://127.0.0.1:8000/tourism/check";

/**
 * The "Bridge" Function
 * This sends User Data + Goal Data to Python.
 * NOW WITH USER PROFILE PERSISTENCE!
 */
const callPythonEngine = async (payload: any) => {
  try {
    console.log("✈️ Sending to Python:", payload);
    const response = await axios.post(PYTHON_URL, payload);
    console.log("✅ Received from Python:", response.data);
    
    // Check if backend is asking for more info
    if (response.data.status === "INCOMPLETE") {
      console.log("⚠️ Backend needs more information:", response.data.awaiting_feedback);
    }
    
    return response.data;
  } catch (error) {
    console.error("❌ TARA Python Bridge Error:", error);
    // Fallback data so the app doesn't crash if Python is off
    return {
      status: "ERROR",
      documents: ['Passport (Fallback)', 'Application Form'],
      steps: [{ id: '1', text: 'Check connection to backend', isCompleted: false }],
      forms: [],
      submissionPoints: [],
      awaiting_feedback: {}
    };
  }
};

// --- CORE FUNCTIONS CALLED BY APP.TSX ---

/**
 * NEW: Helper to ensure user_id is included in profile
 * This extracts user_id from the profile or generates one
 */
const ensureUserId = (profile: any): any => {
  if (!profile) {
    return { user_id: null };
  }
  
  // If user_id already exists, use it
  if (profile.user_id) {
    return profile;
  }
  
  // Otherwise, use email as user_id (fallback)
  if (profile.email) {
    return {
      ...profile,
      user_id: profile.email
    };
  }
  
  // If no email either, try to get from localStorage or generate temp ID
  const storedUserId = localStorage.getItem('tara_user_id');
  if (storedUserId) {
    return {
      ...profile,
      user_id: storedUserId
    };
  }
  
  // Last resort: generate a temporary ID and store it
  const tempId = `temp_${Date.now()}`;
  localStorage.setItem('tara_user_id', tempId);
  
  return {
    ...profile,
    user_id: tempId
  };
};

/**
 * NEW: Helper to add citizenship to profile if provided separately
 * This handles the case where citizenship is collected after initial request
 */
export const addCitizenshipToProfile = (profile: any, citizenship: string, citizenshipCode: string): any => {
  return {
    ...profile,
    nationalities: [
      {
        country: citizenship,
        code: citizenshipCode
      }
    ]
  };
};

// 1. This is called when you finish the "New Goal" wizard
export const getDetailedRequirements = async (
  country: string, 
  type: string, 
  profile: any, 
  context: any
) => {
  // CRITICAL: Ensure user_id is included
  const profileWithId = ensureUserId(profile);
  
  return callPythonEngine({
    request_type: 'requirements',
    country: country,
    type: type,
    profile: profileWithId,  // Now includes user_id
    context: context
  });
};

// 2. This gets forms/locations for the new goal
export const getApplicationResources = async (
  country: string, 
  type: string, 
  profile: any, 
  context: any
) => {
  // CRITICAL: Ensure user_id is included
  const profileWithId = ensureUserId(profile);
  
  return callPythonEngine({
    request_type: 'resources',
    country: country,
    type: type,
    profile: profileWithId,  // Now includes user_id
    context: context
  });
};

/**
 * NEW: Function to update user profile on backend
 * Call this when user provides citizenship for the first time
 */
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/profile/update', {
      user_id: userId,
      ...profileData
    });
    console.log("✅ Profile updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update profile:", error);
    return { status: "error" };
  }
};

/**
 * NEW: Function to get user profile from backend
 * Useful for pre-filling forms with stored data
 */
export const getUserProfile = async (userId: string) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/profile/${userId}`);
    console.log("✅ Profile retrieved:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to retrieve profile:", error);
    return { status: "not_found" };
  }
};

// --- REQUIRED PLACEHOLDERS (To prevent blank screen crashes) ---
export const getTravelAdvisory = async (country: string) => {
  const data = await callPythonEngine({ 
    country, 
    request_type: 'advisory', 
    profile: ensureUserId({}), 
    type: 'general' 
  });
  return typeof data === 'string' ? data : "Exercise normal safety precautions.";
};

export const getBureaucracyGuidance = async (country: string, purpose: string, profile: any) => 
  callPythonEngine({ 
    country, 
    type: purpose, 
    profile: ensureUserId(profile), 
    request_type: 'guidance' 
  });

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