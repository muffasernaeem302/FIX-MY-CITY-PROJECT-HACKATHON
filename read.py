with open(r'E:\FIXMYCITY\frontend\src\pages\ReportIssuePage.jsx', 'r') as f:
    lines = f.readlines()
print('Total lines:', len(lines))
for i in range(55, min(90, len(lines)+1)):
    print(f'{i}: {lines[i-1].rstrip()}')
