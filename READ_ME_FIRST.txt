MB1 OVERSIZED LINK FIX V8

THIS FIX SEPARATES THE TWO LINKS:

1. SHIPPING POLICY
   -> opens shipping-policy.html

2. REQUEST OVERSIZED SHIPPING QUOTE
   -> opens the Google oversized shipping form

For 36" and 48", the quote button automatically pre-fills:
- Design Number
- Sign Size
- Color

FILES TO REPLACE
- index.html
- all 12 original category .html files
- shipping-policy.html

DO NOT REPLACE
- customizable.html
- catalog-data.json

GITHUB
1. Copy the HTML files from this ZIP into your local mb1-catalog folder.
2. Choose Replace All.
3. Open GitHub Desktop.
4. Uncheck .DS_Store if it appears.
5. Summary: Fix oversized quote link
6. Commit to main.
7. Push origin.

TEST
Open:
https://mb1advancedsolutions.github.io/mb1-catalog/?v=8

A. Click Shipping Policy
   It should open:
   shipping-policy.html

B. Pick any design
   Choose 36" or 48"
   Click Request Oversized Shipping Quote
   It should open your Google form, NOT the shipping policy page.

The Google form should already contain:
- MB1 design number
- selected size
- selected color
