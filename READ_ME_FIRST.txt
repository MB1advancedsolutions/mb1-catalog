MB1 ORDER REFERENCE + CONFIRMATION V11

WHAT THIS UPDATE DOES

STANDARD STRIPE CHECKOUT NOW SENDS BOTH:
1. client_reference_id
   Example: MB1_0004_24_BLACK
   Stripe keeps this on the Checkout Session for reconciliation/webhooks.

2. utm_content
   Example: MB1_0004_24_BLACK
   Stripe automatically carries this onto the redirect URL after successful payment.

THE MB1 CONFIRMATION PAGE READS utm_content AND DISPLAYS:

MB1 Order Reference
MB1_0004_24_BLACK

Design MB1-0004 · Size 24" · Color Black


FILES TO REPLACE
- index.html
- all 12 original category HTML pages
- order-confirmation.html

DO NOT REPLACE
- customizable.html
- shipping-policy.html
- catalog-data.json


GITHUB DESKTOP
1. Copy the HTML files from this ZIP into your local mb1-catalog folder.
2. Replace the existing standard category pages and index.html.
3. Replace order-confirmation.html.
4. Open GitHub Desktop.
5. Uncheck .DS_Store if it appears.
6. Summary:
   Show MB1 order reference after payment
7. Commit to main.
8. Push origin.


STRIPE REDIRECT

For EACH standard Payment Link, the After payment redirect should remain:

https://mb1advancedsolutions.github.io/mb1-catalog/order-confirmation.html

Do NOT manually add utm_content to that redirect URL.

The catalog adds utm_content to the Payment Link.
Stripe then carries it onto the redirect automatically after payment.


TEST WITHOUT PAYING

After GitHub is updated, you can directly test the confirmation page with:

https://mb1advancedsolutions.github.io/mb1-catalog/order-confirmation.html?utm_content=MB1_0004_24_BLACK

You should see:

MB1 Order Reference
MB1_0004_24_BLACK

Design MB1-0004 · Size 24" · Color Black


REAL CHECKOUT FLOW

Catalog
→ customer chooses design / size / color
→ Stripe Payment Link contains:
  client_reference_id=MB1_0004_24_BLACK
  utm_content=MB1_0004_24_BLACK
→ successful payment
→ Stripe redirects to order-confirmation.html
→ confirmation page visibly shows the MB1 order reference.
