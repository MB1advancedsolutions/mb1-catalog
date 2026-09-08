MB1 CUSTOMIZATION PREFILL V9

THIS UPDATE IMPROVES THE CUSTOMIZATION FLOW.

CUSTOMER SELECTS:
- Size
- Color / Finish

THEN CLICKS:
Customize This Design
or
Customize / Request Quote

THE GOOGLE CUSTOMIZATION FORM OPENS WITH THESE ALREADY FILLED:
- Design Number
- Size
- Color / Finish

GOOGLE FORM FIELDS
Design Number: entry.1065662702
Size: entry.1789039289
Color / Finish: entry.1061966535

THIS WORKS FROM:
1. The Customizable category
2. A customizable product inside its original category

FILES TO REPLACE
- index.html
- all 12 original category .html files
- customizable.html

DO NOT REPLACE
- shipping-policy.html
- catalog-data.json

GITHUB DESKTOP
1. Copy the HTML files from this ZIP into your local mb1-catalog folder.
2. Choose Replace All.
3. Open GitHub Desktop.
4. Uncheck .DS_Store if it appears.
5. Summary: Prefill customization size and color
6. Commit to main.
7. Push origin.

TEST
Open:
https://mb1advancedsolutions.github.io/mb1-catalog/?v=9

TEST FROM AN ORIGINAL CATEGORY:
- Open a customizable design
- Choose 24"
- Choose Black
- Click Customize This Design
- Confirm Google Form has:
  correct design
  24"
  Black

TEST CUSTOMIZABLE CATEGORY:
https://mb1advancedsolutions.github.io/mb1-catalog/customizable.html?v=9

- Choose a design
- Choose 24"
- Choose Black
- Click Customize / Request Quote
- Confirm all three values are prefilled.
