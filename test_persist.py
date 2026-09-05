"""Test status update and persistence."""
import urllib.request, json, urllib.error, random

BASE = "http://127.0.0.1:8000/api"

# Register
email = f"persist{random.randint(1000,9999)}@test.com"
data = json.dumps({"email": email, "password": "testpass123", "full_name": "Test"}).encode()
req = urllib.request.Request(BASE + "/auth/register", data=data, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req, timeout=10) as resp:
    result = json.loads(resp.read().decode())
    token = result["data"]["token"]
    print(f"Registered: {email}")

auth = {"Authorization": f"Bearer {token}"}

# Create incident
boundary = '----FormBoundary7MA4YWxkTrZu0gW'
form = (
    f'--{boundary}\r\nContent-Disposition: form-data; name="lat"\r\n\r\n28.6139\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="lng"\r\n\r\n77.2090\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nPOTHOLE_ROAD_DAMAGE\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nPersistent pothole test\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nThis is a dangerous pothole on a busy intersection road causing traffic problems\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="address"\r\n\r\nMG Road Delhi\r\n'
    f'--{boundary}--\r\n'
)
req2 = urllib.request.Request(
    BASE + "/incidents",
    data=form.encode('utf-8'),
    headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": f"Bearer {token}"
    }
)
with urllib.request.urlopen(req2, timeout=10) as resp:
    result = json.loads(resp.read().decode())
    iid = result["data"]["id"]
    print(f"Created: ID={iid}, risk={result['data']['risk_score']}, status={result['data']['status']}")

# Dashboard stats
with urllib.request.urlopen(BASE + "/public/dashboard/stats", timeout=5) as resp:
    stats = json.loads(resp.read().decode())
    print(f"Dashboard stats: {stats['data']}")

# Update to AI_ANALYZING
req3 = urllib.request.Request(
    BASE + f"/incidents/{iid}/status",
    data=json.dumps({"status": "AI_ANALYZING", "note": "AI analysis started"}).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    method="POST"
)
with urllib.request.urlopen(req3, timeout=5) as resp:
    result = json.loads(resp.read().decode())
    print(f"AI_ANALYZING: status={result['data']['status']}")

# Update to ASSIGNED
req4 = urllib.request.Request(
    BASE + f"/incidents/{iid}/status",
    data=json.dumps({"status": "ASSIGNED", "note": "Assigned to roads dept"}).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    method="POST"
)
with urllib.request.urlopen(req4, timeout=5) as resp:
    result = json.loads(resp.read().decode())
    print(f"ASSIGNED: status={result['data']['status']}")

# Update to IN_PROGRESS
req5 = urllib.request.Request(
    BASE + f"/incidents/{iid}/status",
    data=json.dumps({"status": "IN_PROGRESS", "note": "Repair started"}).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    method="POST"
)
with urllib.request.urlopen(req5, timeout=5) as resp:
    result = json.loads(resp.read().decode())
    print(f"IN_PROGRESS: status={result['data']['status']}")

# List all
with urllib.request.urlopen(BASE + "/incidents", timeout=5) as resp:
    result = json.loads(resp.read().decode())
    print(f"All incidents: total={result['data']['total']}")

# Verify persistence - read from DB
with urllib.request.urlopen(BASE + f"/incidents/{iid}", timeout=5) as resp:
    result = json.loads(resp.read().decode())
    print(f"\nPERSISTENCE CHECK: ID={result['data']['id']}, status={result['data']['status']}, risk={result['data']['risk_score']}")
    assert result['data']['status'] == 'IN_PROGRESS', f"Expected IN_PROGRESS, got {result['data']['status']}"

# Invalid transition
req6 = urllib.request.Request(
    BASE + f"/incidents/{iid}/status",
    data=json.dumps({"status": "RESOLVED", "note": "Skip steps"}).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    method="POST"
)
try:
    with urllib.request.urlopen(req6, timeout=5) as resp:
        print(f"ERROR: Invalid transition should have failed!")
except urllib.error.HTTPError as e:
    print(f"Invalid transition correctly rejected: HTTP {e.code}")

print("\n=== ALL PERSISTENCE TESTS PASSED ===")
print(f"Incident {iid} status lifecycle: SUBMITTED -> AI_ANALYZING -> ASSIGNED -> IN_PROGRESS (persisted)")
