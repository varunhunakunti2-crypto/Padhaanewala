import urllib.request
import urllib.error
import time

def check_url(name, url, expected_code=200):
    print(f"Checking {name} at {url}...")
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.getcode() == expected_code:
                print(f"✅ {name} is OK")
                return True
            else:
                print(f"❌ {name} returned status code {response.getcode()}")
                return False
    except urllib.error.URLError as e:
        print(f"❌ {name} failed: {e.reason}")
        return False
    except Exception as e:
        print(f"❌ {name} failed: {e}")
        return False

def main():
    print("Running Environment Check...\n")
    
    backend_ok = check_url("Backend API Health", "http://localhost:8000/health")
    frontend_ok = check_url("Frontend Homepage", "http://localhost:3000/")
    
    print("\n--- Summary ---")
    if backend_ok and frontend_ok:
        print("✅ Environment is fully operational!")
    else:
        print("❌ Environment check failed. Please ensure both servers are running.")

if __name__ == "__main__":
    main()
