Y

# Remove first line (X) from w_rip.py and run it
import subprocess, os
content = open(r'E:\FIXMYCITY\frontend\w_rip.py').read()
# Remove first line
lines = content.split('\n')
if lines[0] == 'X':
    lines = lines[1:]
open(r'E:\FIXMYCITY\frontend\w_rip.py', 'w').write('\n'.join(lines))
print(f"w_rip.py now has {len(lines)} lines")
