import sqlite3
import pandas as pd
import os

def sync_data():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DB_PATH = os.path.join(BASE_DIR, 'tara_migration.db')
    URL = "https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-tidy-iso2.csv"
    
    print("🌍 Downloading latest visa rules...")
    df = pd.read_csv(URL).rename(columns={'Passport': 'origin', 'Destination': 'dest', 'Requirement': 'rule'})
    
    conn = sqlite3.connect(DB_PATH)
    df.to_sql('mobility_logic', conn, if_exists='replace', index=False)
    conn.close()
    print(f"✅ Saved {len(df)} rules to {DB_PATH}")

if __name__ == "__main__":
    sync_data()