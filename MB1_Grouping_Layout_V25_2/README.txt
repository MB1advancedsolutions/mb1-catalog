MB1 Grouping Layout V25.2

This is the permanent version of the exact layout that worked in the Safari console test.

INSTALL
1. Upload mb1-grouping-layout-v25-2.css to the ROOT of the mb1-catalog repository.
2. In index.html, inside <head>, add:
   <link rel="stylesheet" href="mb1-grouping-layout-v25-2.css?v=252">

3. If index.html contains any older grouping-layout stylesheet such as:
   mb1-grouping-layout-v25.css
   mb1-grouping-layout-v25-1.css
   remove that older layout line so only V25.2 is loaded.

DO NOT CHANGE
- mb1-grouping-v24.js
- monogram-groups-v20.json
- catalog-groups-v21.json

EXPECTED
- 4 columns on desktop
- 3 columns on tablet
- 2 columns on phone
- vertical scrolling inside Choose Design Style
- no horizontal overflow / giant product window
- grouping remains unchanged

SHA-256:
2695ac8b3238c75c65d029c8ecf8a58981868baedc8ac59aa4e87e84b5506b60
