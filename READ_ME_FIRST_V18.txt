MB1 Advanced Solutions — V18 Multi-Photo Product Gallery

WHAT V18 ADDS
- Up to 5 photos per product.
- Main image plus thumbnail strip when 2+ photos exist.
- Previous/next controls.
- Mobile swipe left/right on the main product image.
- Photo count and photo-type label.
- Existing single-photo products continue to display normally.

PRESERVED FROM PRIOR VERSIONS
- 1,397 IP-cleaned products.
- V17 multi-category memberships.
- Direct product links (?design=0004).
- Correct size-based shipping display.
- Stripe checkout, customization, and oversized-shipping flows.

DATA
- Catalog pages now load catalog-data-v18.json?v=18.
- Each product has an images array. Photo 1 is the existing main image.
- Up to five image objects can be stored in images[].
- catalog-data.json is also updated to the V18 data for compatibility.

RECOMMENDED CLOUDINARY FILENAMES
0037_01_main.jpg
0037_02_lifestyle.jpg
0037_03_detail.jpg
0037_04_scale.jpg
0037_05_alternate.jpg

INSTALLATION
1. Copy these files into the local mb1-catalog folder.
2. Replace matching files.
3. Commit in GitHub Desktop: Add multi-photo product galleries V18
4. Push origin.
5. Test: https://mb1advancedsolutions.github.io/mb1-catalog/index.html?v=18

NOTE
The current catalog begins with one photo per product. The gallery controls automatically appear only after extra photo URLs are added to a product's images array.
