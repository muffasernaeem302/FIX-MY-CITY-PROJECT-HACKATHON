import sys
sys.path.insert(0, r'E:\FIXMYCITY\backend')
import os
os.chdir(r'E:\FIXMYCITY\backend')
try:
    from app import models
    print("models OK")
except Exception as e:
    print(f"models ERR: {e}")
try:
    from app import database
    print("database OK")
except Exception as e:
    print(f"database ERR: {e}")
try:
    from app import main
    print("main OK")
except Exception as e:
    print(f"main ERR: {e}")
    import traceback
    traceback.print_exc()
