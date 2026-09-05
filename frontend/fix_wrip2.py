Y

# Remove first line from fix_wrip.py
content = open(r'E:\FIXMYCITY\frontend\fix_wrip.py').read()
lines = content.split('\n')
if lines[0] == 'Y':
    lines = lines[1:]
open(r'E:\FIXMYCITY\frontend\fix_wrip.py', 'w').write('\n'.join(lines))
print(f"fix_wrip.py now has {len(lines)} lines")

# Also remove first line from fix_wrip2.py
content2 = open(r'E:\FIXMYCITY\frontend\fix_wrip2.py').read()
lines2 = content2.split('\n')
if lines2[0] == 'Y':
    lines2 = lines2[1:]
open(r'E:\FIXMYCITY\frontend\fix_wrip2.py', 'w').write('\n'.join(lines2))
print(f"fix_wrip2.py now has {len(lines2)} lines")
