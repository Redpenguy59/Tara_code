"""
User Profile Management
Handles storing and retrieving user data to avoid repeat questions
"""
import sqlite3
import os
from typing import Optional, Dict, Any
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'tara_migration.db')

def init_user_profiles_table():
    """
    Create the user_profiles table if it doesn't exist
    Call this when the app starts
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            display_name TEXT,
            citizenship TEXT,
            citizenship_code TEXT,
            date_of_birth TEXT,
            passport_number TEXT,
            existing_visas TEXT,  -- JSON string of existing visas
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversation_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            request_type TEXT,
            origin TEXT,
            destination TEXT,
            purpose TEXT,
            status TEXT,
            ai_response TEXT,  -- JSON string of the AI response
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database tables initialized")

def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a user's profile from the database
    Returns None if user doesn't exist
    """
    if not user_id:
        return None
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT user_id, email, display_name, citizenship, citizenship_code, 
               date_of_birth, passport_number, existing_visas, created_at, updated_at
        FROM user_profiles 
        WHERE user_id = ?
    """, (user_id,))
    
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        return None
    
    return {
        "user_id": result[0],
        "email": result[1],
        "display_name": result[2],
        "citizenship": result[3],
        "citizenship_code": result[4],
        "date_of_birth": result[5],
        "passport_number": result[6],
        "existing_visas": result[7],
        "created_at": result[8],
        "updated_at": result[9]
    }

def save_user_profile(user_id: str, profile_data: Dict[str, Any]) -> bool:
    """
    Save or update a user's profile
    Returns True if successful
    """
    if not user_id:
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    # Check if user exists
    cursor.execute("SELECT user_id FROM user_profiles WHERE user_id = ?", (user_id,))
    exists = cursor.fetchone()
    
    if exists:
        # Update existing profile
        cursor.execute("""
            UPDATE user_profiles
            SET email = ?,
                display_name = ?,
                citizenship = ?,
                citizenship_code = ?,
                date_of_birth = ?,
                passport_number = ?,
                existing_visas = ?,
                updated_at = ?
            WHERE user_id = ?
        """, (
            profile_data.get('email'),
            profile_data.get('display_name'),
            profile_data.get('citizenship'),
            profile_data.get('citizenship_code'),
            profile_data.get('date_of_birth'),
            profile_data.get('passport_number'),
            profile_data.get('existing_visas'),
            now,
            user_id
        ))
    else:
        # Insert new profile
        cursor.execute("""
            INSERT INTO user_profiles 
            (user_id, email, display_name, citizenship, citizenship_code, 
             date_of_birth, passport_number, existing_visas, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            profile_data.get('email'),
            profile_data.get('display_name'),
            profile_data.get('citizenship'),
            profile_data.get('citizenship_code'),
            profile_data.get('date_of_birth'),
            profile_data.get('passport_number'),
            profile_data.get('existing_visas'),
            now,
            now
        ))
    
    conn.commit()
    conn.close()
    return True

def update_user_field(user_id: str, field_name: str, value: Any) -> bool:
    """
    Update a single field in the user's profile
    Useful for updating just citizenship without touching other fields
    """
    if not user_id:
        return False
    
    allowed_fields = ['email', 'display_name', 'citizenship', 'citizenship_code', 
                      'date_of_birth', 'passport_number', 'existing_visas']
    
    if field_name not in allowed_fields:
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    query = f"UPDATE user_profiles SET {field_name} = ?, updated_at = ? WHERE user_id = ?"
    cursor.execute(query, (value, now, user_id))
    
    conn.commit()
    conn.close()
    return True

def save_conversation(user_id: str, conversation_data: Dict[str, Any]) -> bool:
    """
    Save a conversation interaction to history
    Useful for tracking what questions were asked and what guidance was given
    """
    if not user_id:
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    cursor.execute("""
        INSERT INTO conversation_history
        (user_id, request_type, origin, destination, purpose, status, ai_response, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        conversation_data.get('request_type'),
        conversation_data.get('origin'),
        conversation_data.get('destination'),
        conversation_data.get('purpose'),
        conversation_data.get('status'),
        conversation_data.get('ai_response'),
        now
    ))
    
    conn.commit()
    conn.close()
    return True

def get_user_conversation_history(user_id: str, limit: int = 10) -> list:
    """
    Get recent conversation history for a user
    """
    if not user_id:
        return []
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT request_type, origin, destination, purpose, status, created_at
        FROM conversation_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    """, (user_id, limit))
    
    results = cursor.fetchall()
    conn.close()
    
    return [
        {
            "request_type": row[0],
            "origin": row[1],
            "destination": row[2],
            "purpose": row[3],
            "status": row[4],
            "created_at": row[5]
        }
        for row in results
    ]

# Initialize the tables when this module is imported
init_user_profiles_table()
