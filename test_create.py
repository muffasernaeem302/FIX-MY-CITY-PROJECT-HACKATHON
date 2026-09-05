import urllib.request, json, urllib.parse

# Create incident
url = "http://127.0.0.1:8000/api/incidents"
# Need to use multipart form data for file upload
boundary = '----FormBoundary7MA4YWxkTrZu0gW'
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="lat"\r\n\r\n28.6139\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="lng"\r\n\r\n77.2090\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="category"\r\n\r\nPOTHOLE_ROAD_DAMAGE\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="title"\r\n\r\nLarge pothole on main road\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="description"\r\n\r\nDangerous pothole near intersection causing traffic problems\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="address"\r\n\r\nMG Road, New Delhi\r\n'
    f'--{boundary}--\r\n'
).encode('utf-8')

req = urllib.request.Request(url, data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read().decode())
        print("Create incident:", json.dumps(result, indent=2)[:1000])
        incident_id = result["data"]["id"]
        print(f"\nIncident ID: {incident_id}, Risk Score: {result['data']['risk_score']}, Severity: {result['data']['severity']}")
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.read().decode()[:500]}")

# List incidents
url2 = "http://127.0.0.1:8000/api/incidents"
try:
    with urllib.request.urlopen(url2, timeout=5) as resp:
        result = json.loads(resp.read().decode())
        print(f"\nList incidents: total={result['data']['total']}")
        for inc in result['data']['incidents']:
            print(f"  ID={inc['id']}, title={inc['title']}, risk={inc['risk_score']}, severity={inc['severity']}, status={inc['status']}")
except urllib.error.HTTPError as e:
    print(f"List HTTP {e.code}: {e.read().decode()[:500]}")

# Get specific incident
url3 = "http://127.0.0.1:8000/api/incidents/1"
try:
    with urllib.request.urlopen(url3, timeout=5) as resp:
        result = json.loads(resp.read().decode())
        print(f"\nIncident 1: {result['data']['title']}, status={result['data']['status']}")
except urllib.error.HTTPError as e:
    print(f"Get HTTP {e.code}: {e.read().decode()[:300]}")
