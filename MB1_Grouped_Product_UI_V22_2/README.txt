MB1 Grouped Product UI V22.2

This fixes the V22.1 regression. V22.1 still fetched the V20 and V21 JSON files at runtime, so a stale GitHub Pages/CDN response could make the V21 combined groups disappear.

V22.2 embeds all 26 group definitions directly in monogram-grouping-v20.js. The JSON files are kept in this package only as synchronized source copies.

Verified grouping:
- 20 original V20 groups
- Split Scroll: 26
- Steampunk: 26
- Bee & Honeycomb: 36
- Classic Cars & Trucks: 21
- Antler Base: 26 (0541-0566)
- Truck Signs: 17 (1614-1630 / Truck 001-017)

INSTALL: replace the repository-root monogram-grouping-v20.js.
After GitHub Pages publishes, clear Safari caches and reload.

Browser diagnostic: open the console and run MB1_GROUPING_STATUS.
Expected groupCount=26, v20GroupCount=20, v21GroupCount=6, antlerBaseVariants=26, truckVariants=17.
