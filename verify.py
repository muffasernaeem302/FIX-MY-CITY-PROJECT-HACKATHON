with open(r'E:\FIXMYCITY\frontend\src\pages\ReportIssuePage.jsx', 'r') as f:
    lines = f.readlines()
print('Total lines:', len(lines))
print('Line 58 (submit start):', lines[57].strip())
print('Line 97 (submit end):', lines[96].strip())
print('Line 98 (return start):', lines[97].strip())
# Check for 'const { default: api }'
for i, line in enumerate(lines):
    if 'const { default: api }' in line:
        print(f'API call at line {i+1}: {line.strip()}')
# Check for 'navigate('
for i, line in enumerate(lines):
    if 'navigate(' in line:
        print(f'navigate at line {i+1}: {line.strip()}')
