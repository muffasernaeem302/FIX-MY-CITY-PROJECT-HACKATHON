"""Start the FixMyCity backend server."""
import subprocess, sys, os, time

log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server.log')
proc = subprocess.Popen(
    [sys.executable, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'],
    stdout=open(log_path, 'w'),
    stderr=subprocess.STDOUT,
    cwd=os.path.dirname(os.path.abspath(__file__))
)
print(f"Started PID {proc.pid}")
time.sleep(3)
if proc.poll() is None:
    print("Server is running on http://127.0.0.1:8000")
else:
    print("Server exited immediately. Check server.log")
