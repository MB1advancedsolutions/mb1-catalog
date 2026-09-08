MB1 Advanced Solutions — Conservative IP-Risk Catalog Cleanup V13
Generated: 2026-09-08

WHAT THIS PACKAGE DOES
- Removes 148 products with obvious or conservative third-party IP risk from the public catalog.
- Leaves 1397 verified products in catalog-data.json.
- Removes the same retired designs from every static category page and Customizable Designs page.
- Updates category counts and the customizable-design count.
- Keeps the Stripe checkout, custom form, oversized quote, and order-reference logic from V12.

MAIN RISK GROUPS REMOVED
- Professional sports team names/logos and team clocks
- Branded automotive/motorcycle designs and logos
- Entertainment characters/franchises (for example Baby Yoda, Punisher, Nightmare Before Christmas)
- Military/government/organizational seals, badges, logos and insignia
- Named political/campaign merchandise as a conservative trademark/publicity precaution
- A small number of recognizable modern quote/brand designs

IMPORTANT
This is a conservative catalog audit, not a legal guarantee. A generic-looking design can still be copyrighted by its original artist if MB1 did not create it or obtain a commercial-use license. Keep proof of license/source for every design you continue selling.

INSTALL IN GITHUB
1. Back up your current mb1-catalog folder.
2. Copy catalog-data.json plus all .html files from this package into your local mb1-catalog folder, replacing matching files.
3. Also copy customizable.html.
4. Do NOT delete shipping-policy.html or other files that are already in your repository but are not included here.
5. Open GitHub Desktop.
6. Review Changes. Do not commit .DS_Store.
7. Commit with: Remove high-risk third-party IP designs
8. Push origin.
9. Test:
   https://mb1advancedsolutions.github.io/mb1-catalog/index.html

REMOVED ITEMS
See IP_AUDIT_REMOVED_ITEMS.csv for the complete list of 148 removed designs.

CLOUDINARY
This package removes the items from the public catalog. It does not delete the source images from Cloudinary.
