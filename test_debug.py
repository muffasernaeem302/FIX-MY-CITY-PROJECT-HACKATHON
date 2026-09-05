import urllib.request, json

url = "http://127.0.0.1:8000/api/public/departments"
try:
    with urllib.request.urlopen(url, timeout=5) as resp:
        print(resp.read().decode())
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP {e.code}: {body[:500]}")

# Also test health
url2 = "http://127.0.0.1:8000/api/health"
try:
    with urllib.request.urlopen(url2, timeout=5) as resp:
        print("Health:", resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"Health HTTP {e.code}: {e.read().decode()[:200]}")

# Test register
url3 = "http://127.0.0.1:8000/api/auth/register"
data = json.dumps({"email": "test@example.com", "password": "testpassword123", "full_name": "Test User"}).encode()
req = urllib.request.Request(url3, data=data, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        print("Register:", resp.read().decode()[:500])
except urllib.error.HTTPError as e:
    print(f"Register HTTP {e.code}: {e.read().decode()[:500]}")
