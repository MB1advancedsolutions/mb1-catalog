MB1 BROWSER ORDER REFERENCE FALLBACK V12

WHY THIS UPDATE EXISTS
Your direct confirmation-page test works, but Stripe sandbox did not reliably return
the MB1 reference in the redirect URL.

V12 DOES NOT DEPEND ON STRIPE RETURNING THE REFERENCE.

REAL MB1 CHECKOUT FLOW
1. Customer chooses a design, size and color.
2. Before Pay Now sends them to Stripe, MB1 saves the order reference in the browser.
3. Customer pays in Stripe.
4. Stripe redirects back to order-confirmation.html.
5. The confirmation page checks utm_content first.
6. If Stripe did not return it, the page reads the saved browser reference.
7. The MB1 order reference is displayed.

FILES TO REPLACE
- index.html
- all 12 original category HTML pages
- order-confirmation.html

NEW TEST FILE
- stripe-sandbox-test.html

DO NOT REPLACE
- customizable.html
- shipping-policy.html
- catalog-data.json

GITHUB DESKTOP
1. Copy the HTML files into your local mb1-catalog folder.
2. Replace existing files when prompted.
3. Add stripe-sandbox-test.html.
4. Open GitHub Desktop.
5. Uncheck .DS_Store if it appears.
6. Summary:
   Add reliable MB1 order reference fallback
7. Commit to main.
8. Push origin.

SANDBOX TEST
Open:
https://mb1advancedsolutions.github.io/mb1-catalog/stripe-sandbox-test.html

Leave:
MB1_0004_24_BLACK

Paste your Stripe sandbox Payment Link.

Click:
Start Sandbox Checkout

Complete the Stripe test payment.

Your sandbox Payment Link must redirect to:
https://mb1advancedsolutions.github.io/mb1-catalog/order-confirmation.html

After payment, the confirmation page should show:
MB1_0004_24_BLACK

This test works even if Stripe does not put utm_content into the redirect URL.
