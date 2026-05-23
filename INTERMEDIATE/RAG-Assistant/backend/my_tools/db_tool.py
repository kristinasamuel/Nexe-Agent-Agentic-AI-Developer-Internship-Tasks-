import os
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Using the specific key DATABASE_UR found in your .env
DATABASE_URL = os.getenv("DATABASE_UR")

def get_connection():
    if not DATABASE_URL:
        raise ValueError("DATABASE_UR not found in .env file")
    return psycopg2.connect(DATABASE_URL)

def init_db():
    print("🚀 Initializing SQL Database (Neon)...")
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS interaction_memory (
                id SERIAL PRIMARY KEY,
                user_query TEXT,
                agent_response TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        cur.close()
        conn.close()
        print("✅ SQL Database initialized successfully.")
    except Exception as e:
        print(f"❌ SQL Database initialization failed: {e}")

def save_interaction(user_query: str, agent_response: str):
    """Saves the chat interaction to the database."""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO interaction_memory (user_query, agent_response) VALUES (%s, %s)",
            (user_query, agent_response)
        )
        conn.commit()
        cur.close()
        conn.close()
        print("💾 Interaction saved to memory.")
    except Exception as e:
        print(f"❌ Failed to save to memory: {e}")

def get_recent_memory(limit=5):
    """Retrieves recent chat history for context."""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT user_query, agent_response FROM interaction_memory ORDER BY timestamp DESC LIMIT %s",
            (limit,)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        memory_text = ""
        for row in reversed(rows):
            memory_text += f"User: {row[0]}\nAssistant: {row[1]}\n"
        return memory_text
    except Exception as e:
        print(f"❌ Failed to retrieve memory: {e}")
        return ""
