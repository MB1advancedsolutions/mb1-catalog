MB1 Grouping Layout V25.1

This file targets the exact Choose Style elements created by mb1-grouping-v24.js:
- #mb1StyleBox
- #mb1StyleSelect
- #mb1StyleThumbs
- .mb1-style-thumb
- #mb1StyleSelected

It does NOT modify the V24 grouping engine.

SAFE TEST
1. Upload mb1-grouping-layout-v25-1.css to the ROOT of mb1-catalog.
2. Refresh the direct catalog.
3. In Safari Console run:
   const x=document.createElement('link');x.rel='stylesheet';x.href='mb1-grouping-layout-v25-1.css?v='+Date.now();document.head.appendChild(x);

4. Open a grouped item and click Choose Style.

EXPECTED
- 4 thumbnail columns on desktop
- 3 on narrower screens
- 2 on phones
- vertical scrolling inside the style area
- no long horizontal strip
- selected style gets a strong border and checkmark

PERMANENT INSTALL
After the test looks correct, add this to <head> in index.html:
<link rel="stylesheet" href="mb1-grouping-layout-v25-1.css?v=251">

Do not change:
- mb1-grouping-v24.js
- monogram-groups-v20.json
- catalog-groups-v21.json

SHA-256:
92f9eb590fddcba2cd0dfb2309977d703f45f2800176fbc010bfa4a4ec75ee8f
