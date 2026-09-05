with open(r'E:\FIXMYCITY\frontend\src\pages\ReportIssuePage.jsx', 'r', encoding='utf-8-sig') as f:
    content = f.read()
start = content.find('const record = {')
print(repr(content[start:start+1500]))
