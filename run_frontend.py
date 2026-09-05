import subprocess, time, os

os.chdir(r'E:\FIXMYCITY\frontend')
proc = subprocess.Popen(['npm', 'run', 'dev'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
time.sleep(5)
print(f"Started frontend with PID: {proc.pid}")
# Check if running
if proc.poll() is None:
    print("Frontend is running")
else:
    stdout, stderr = proc.communicate()
    print("Frontend exited:", stdout.decode(), stderr.decode())
