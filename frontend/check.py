with open(r'E:\FIXMYCITY\frontend\src\pages\ReportIssuePage.jsx', 'r', encoding='utf-8-sig') as f:
    c = f.read()
print(f'File size: {len(c)} chars, {len(c.splitlines())} lines')
print('has api.createIncident:', 'api.createIncident' in c)
print('has FormData:', 'FormData' in c)
print('has navigate:', 'navigate' in c)
print('has return (:', 'return (' in c)
