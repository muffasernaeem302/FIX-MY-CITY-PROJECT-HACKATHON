"""Test API workflow."""
import http.client
import json

conn = http.client.HTTPConnection('127.0.0.1', 8000, timeout=10)

# Test 1: Create incident
print("Test 1: Creating incident...")
body = (
    "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n"
    "Content-Disposition: form-data; name=\"lat\"\r\n\r\n40.7128\r\n"
    "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n"
    "Content-Disposition: form-data; name=\"lng\"\r\n\r\n-74.0060\r\n"
    "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n"
    "Content-Disposition: form-data; name=\"category\"\r\n\r\nPOTHOLE_ROAD_DAMAGE\r\n"
    "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n"
    "Content-Disposition: form-data; name=\"title\"\r\n\r\nTest Pothole\r\n"
    "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n"
    "Content-Disposition: form-data; name=\"description\"\r\n\r\nLarge pothole on Main Street\r\n"
    "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n"
    "Content-Disposition: form-data; name=\"address\"\r\n\r\n123 Main St\r\n"
    "------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n"
)

headers = {
    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
}

conn.request('POST', '/api/incidents/', body, headers)
r = conn.getresponse()
print("Create incident status:", r.status)
data = r.read().decode()
print("Create response:", data[:500])

# Test 2: List incidents
print("\nTest 2: Listing incidents...")
conn.request('GET', '/api/incidents/?limit=5')
r = conn.getresponse()
print("List incident status:", r.status)
data = r.read().decode()
print("List response:", data[:1000])

conn.close()
