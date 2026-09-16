MB1 Grouped Product UI V22.1

Keeps the improved V22 Choose Style layout and restores/preserves all V20 + V21 groupings.

V21 groups preserved:
- Split Scroll Letter Signs
- Steampunk Letter Monogram Signs
- Bee & Honeycomb Signs
- Classic Cars & Trucks Signs
- Antler Base Letter Signs
- Truck Signs (Truck 001–017)

Important change:
The JavaScript now contains embedded backup copies of the V20 and V21 grouping configurations. Even if a JSON file is stale, cached, missing, or temporarily unavailable, all grouping families remain available.

Replace in mb1-catalog/main:
1. monogram-grouping-v20.js
2. catalog-groups-v21.json
3. monogram-groups-v20.json only if your repository copy differs.

After commit, hard refresh with Command + Shift + R.
