import http.client
import json

conn = http.client.HTTPConnection('127.0.0.1', 8000, timeout=10)

# Test 1: Health check
print("Test 1: Health check")
conn.request('GET', '/')
r = conn.getresponse()
print(f"Status: {r.status}")
data = r.read().decode()
print(f"Response: {data[:200]}")

# Test 2: List incidents
print("\nTest 2: List incidents")
conn.request('GET', '/api/incidents/?limit=2')
r = conn.getresponse()
print(f"Status: {r.status}")
data = r.read().decode()
d = json.loads(data)
print(f"Total incidents: {d.get('data', {}).get('total')}")

# Test 3: Create incident (without image)
print("\nTest 3: Create incident")
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    f'--{boundary}\r\nContent-Disposition: form-data; name="lat"\r\n\r\n40.7128\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="lng"\r\n\r\n-74.0060\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nPOTHOLE_ROAD_DAMAGE\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nTest Pothole Report\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nLarge pothole on busy street\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="address"\r\n\r\n123 Main St\r\n'
    f'--{boundary}--\r\n'
)
headers = {'Content-Type': f'multipart/form-data; boundary={boundary}'}
conn.request('POST', '/api/incidents/', body, headers)
r = conn.getresponse()
print(f"Status: {r.status}")
data = r.read().decode()
if r.status == 200 or r.status == 201:
    d = json.loads(data)
    incident_id = d.get('data', {}).get('id')
    print(f"Created incident ID: {incident_id}")
    print(f"Risk score: {d.get('data', {}).get('risk_score')}")
    print(f"Status: {d.get('data', {}).get('status')}")
else:
    print(f"Error: {data[:300]}")

conn.close()
print("\nAll tests completed!")