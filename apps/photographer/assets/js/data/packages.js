/* ============================================================
   PACKAGES
   The rates below are a starting proposal for the Itahari market,
   not confirmed prices — set them to whatever you actually charge,
   or use "Custom quote" for work you always quote individually.

     name       shown large
     for        one line on who it suits
     priceLabel small line above the figure, e.g. "Starting at".
                Defaults to "Investment" when left out.
     price      any string: "NPR 00,000", "Custom quote"…
     features  bullet list, in the order a client cares about
     featured  one package may be true — it inverts and is flagged
     cta       button label
     note      small print under the button (optional)
   ============================================================ */
export const packages = [
  {
    name: "Essential",
    for: "For intimate sessions",
    priceLabel: "Starting at",
    price: "NPR 15,000",
    features: [
      "1 hour session",
      "1 location",
      "30 edited photographs",
      "Private online gallery",
      "High-resolution downloads"
    ],
    featured: false,
    cta: "Choose Essential",
    note: "Delivery in 2 weeks"
  },
  {
    name: "Signature",
    for: "The most requested",
    priceLabel: "Starting at",
    price: "NPR 35,000",
    features: [
      "3 hour session",
      "Up to 2 locations",
      "80 edited photographs",
      "Private online gallery",
      "High-resolution downloads",
      "Professional retouching"
    ],
    featured: true,
    cta: "Choose Signature",
    note: "Delivery in 3 weeks"
  },
  {
    name: "Premium",
    for: "Full-day coverage",
    priceLabel: "Starting at",
    price: "NPR 85,000",
    features: [
      "Full day coverage",
      "Second photographer",
      "200+ edited photographs",
      "Premium retouching",
      "Private online gallery",
      "Print-ready files",
      "Priority delivery"
    ],
    featured: false,
    cta: "Book Premium",
    note: "Delivery in 4 weeks"
  }
];

/* Shown under the package grid. */
export const packagesNote =
  "Every package can be adjusted — extra hours, a second photographer, albums, prints and travel outside the Itahari–Biratnagar–Dharan corridor are quoted separately. Tell me what the day looks like and I'll put together a figure.";
