X

import os

with open(r'E:\FIXMYCITY\frontend\src\pages\ReportIssuePage.jsx', 'r', encoding='utf-8-sig') as f:
    content = f.read()

start = content.find('const record = {')
end = content.find('};', start) + 2

old_block = content[start:end]
print(f"Found block of {len(old_block)} bytes")

new_block = '''    const record = {
      title: title.trim(),
      category: cat,
      description: desc.trim(),
      latitude: Number(resolvedCoords.lat),
      longitude: Number(resolvedCoords.lng),
      address: `${Number(resolvedCoords.lat).toFixed(4)}, ${Number(resolvedCoords.lng).toFixed(4)}`,
    };

    setSaving(true);
    setErrs({});

    try {
      const formData = new FormData();
      formData.append("lat", String(record.latitude));
      formData.append("lng", String(record.longitude));
      formData.append("category", record.category);
      formData.append("title", record.title);
      formData.append("description", record.description);
      formData.append("address", record.address);
      if (file) formData.append("image", file);

      const { default: api } = await import("../services/api");
      const resp = await api.createIncident(formData);
      const saved = resp.data;
      navigate(`/report/result/${saved.id}`, { state: { report: saved } });
    } catch (err) {
      setErrs({ submit: err.message || "Failed to submit. Please try again." });
    } finally {
      setSaving(false);
    }
  };'''

if old_block in content:
    content = content.replace(old_block, new_block)
    print("Replaced")

with open(r'E:\FIXMYCITY\frontend\src\pages\ReportIssuePage.jsx', 'w', encoding='utf-8-sig') as f:
    f.write(content)

print(f"Written {len(content)} bytes")
