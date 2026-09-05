import urllib.request, json

base = "http://127.0.0.1:8000/api"

tests = [
    ("GET", "/", None),
    ("GET", "/health", None),
    ("GET", "/public/categories", None),
    ("GET", "/public/departments", None),
    ("GET", "/public/dashboard/stats", None),
]

for method, path, body in tests:
    url = base + path if path.startswith("/public") or path.startswith("/admin") or path.startswith("/auth") or path.startswith("/incidents") else f"http://127.0.0.1:8000{path}"
    if path == "/":
        url = "http://127.0.0.1:8000/"
    try:
        req = urllib.request.Request(url, data=body.encode() if body else None, headers={"Content-Type": "application/json"})
        if method == "POST":
            req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read().decode()
            print(f"OK {method} {path}: {data[:200]}")
    except Exception as e:
        print(f"FAIL {method} {path}: {e}")
