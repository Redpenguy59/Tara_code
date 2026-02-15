import sqlite3
import os

def query_visa_db(origin_code: str, dest_code: str):
    DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'tara_migration.db')
    if not os.path.exists(DB_PATH): return None
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT rule FROM mobility_logic WHERE origin=? AND dest=?", (origin_code, dest_code))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else "unknown"