MB1 V24 new-filename recovery

Upload mb1-grouping-v24.js to the ROOT of the mb1-catalog repository as a NEW file.
Do not replace monogram-grouping-v20.js yet.

Then test on the direct GitHub Pages catalog with:
const s=document.createElement('script');s.src='mb1-grouping-v24.js?v=1';document.head.appendChild(s);
Then run:
MB1_GROUPING_STATUS

Expected groupCount: 26, v20GroupCount: 20, v21GroupCount: 6, antlerBaseVariants: 26, truckVariants: 17.

SHA-256: 64292f61cf143798cd4954c50caf69b4033290d17b56188010d275b1c9de4627
