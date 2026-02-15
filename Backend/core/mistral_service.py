import os, json
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()
client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

def get_expert_advice(origin: str, destination: str, specifics: dict):
    # 1. Build a context string ONLY for provided info
    context = "\n".join([f"- {k}: {v}" for k, v in specifics.items() if v])
    
    # 2. Refined Prompt for "Awaiting Feedback" logic
    prompt = f"""
    Act as an International Migration & Security Expert. 
    Analyze travel from {origin} to {destination}.
    
    USER PROFILE PROVIDED:
    {context if context else "None provided."}
    
    YOUR MISSION:
    If the provided profile is missing critical data (Age, Income, Citizenship, or Current Visas) 
    that would change the visa outcome, identify them.
    
    MANDATORY OUTPUT (JSON ONLY):
    {{
      "forms": ["list of required digital forms/ETIAS"],
      "health": ["mandatory vaccinations and insurance"],
      "safety": ["official travel notices"],
      "awaiting_feedback": {{
          "field_name": "Friendly explanation of why this specific info is needed"
      }}
    }}
    
    STRICT: No PII (names/IDs). No guessing.
    """

    try:
        # 3. The actual API Call
        res = client.chat.complete(
            model="mistral-large-latest",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        # Parse the JSON string into a Python Dictionary
        ai_data = json.loads(res.choices[0].message.content)
        
        # 4. Fallback: Ensure 'awaiting_feedback' exists in the dictionary 
        # so engine.py doesn't crash
        if "awaiting_feedback" not in ai_data:
            ai_data["awaiting_feedback"] = {}
            
        return ai_data

    except Exception as e:
        print(f"❌ Mistral API Error: {e}")
        # Return a structured fallback so the engine can still process the response
        return {
            "forms": [],
            "health": [],
            "safety": [],
            "awaiting_feedback": {"error": "Expert service temporarily offline"},
            "error_log": str(e)
        }