import requests
import os

def test_backend():
    base_url = "http://127.0.0.1:8000"
    
    print(f"🔍 Testing connection to {base_url}...")
    try:
        res = requests.get(f"{base_url}/health")
        print(f"✅ Health Check: {res.status_code} - {res.json()}")
    except Exception as e:
        print(f"❌ Health Check FAILED: {e}")
        print("Is the backend running? Run 'uv run main.py' first.")
        return

    print("\n📄 Testing File Upload...")
    # Create a dummy text file
    test_file = "test_upload.txt"
    with open(test_file, "w") as f:
        f.write("This is a test document for RAG Assistant. It contains information about AI agents.")
    
    try:
        with open(test_file, "rb") as f:
            files = {"file": (test_file, f, "text/plain")}
            res = requests.post(f"{base_url}/upload", files=files)
        
        if res.ok:
            print(f"✅ Upload SUCCESS: {res.status_code} - {res.json()}")
        else:
            print(f"❌ Upload FAILED: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ Upload ERROR: {e}")
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)

    print("\n💬 Testing Chat...")
    try:
        res = requests.post(
            f"{base_url}/chat", 
            json={"message": "What is in the test document?"}
        )
        if res.ok:
            print(f"✅ Chat SUCCESS: {res.status_code} - {res.json()}")
        else:
            print(f"❌ Chat FAILED: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ Chat ERROR: {e}")

if __name__ == "__main__":
    test_backend()
