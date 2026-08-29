/* ============================================================
   PHOTOGRAPHER — identity, contact details, navigation, social.
   Anything still in [square brackets] has not been supplied yet
   and is a placeholder. Nothing here is invented business data.
   ============================================================ */

export const photographer = {
  // The brand: used in the nav mark, the footer and the copyright line.
  name: "Dharshan Studio",
  // The person: used where the photographer speaks in their own voice.
  photographerName: "Dharshan Shrestha",
  // Short mono tag printed beside the brand mark.
  studio: "Itahari",
  tagline: "Stories told through authentic photography.",
  location: "Itahari, Nepal",
  disciplines: ["Weddings", "Portraits", "Editorial"],

  email: "darshanshrestha@gmail.com",
  phone: "+977 9800118899",
  // Optional: a booking or scheduling link. Leave null to hide.
  bookingUrl: null,

  // Where the enquiry form posts. Leave null and the form falls back to
  // opening a prefilled email — see components/bookingForm.js.
  formEndpoint: null,

  /* Social profiles. Empty until real accounts exist — a guessed handle would
     link visitors to somebody else. Paste your own in and both the footer and
     the "Follow the journey" strip switch themselves back on:

       { label: "Instagram", handle: "@dharshanstudio",
         href: "https://instagram.com/dharshanstudio" },
  */
  social: [],

  nav: [
    { label: "Portfolio", href: "#portfolio" },
    { label: "About",     href: "#about" },
    { label: "Services",  href: "#services" },
    { label: "Packages",  href: "#packages" },
    { label: "Contact",   href: "#contact" }
  ],

  /* Hero — one image carries the whole first impression. */
  hero: {
    // Each string is one line of the headline.
    title: ["Dharshan", "Studio"],
    image: {
      id: "1519741497674-611481863552",
      tone: "#5E5149",
      alt: "A couple photographed close together in warm backlit evening light."
    },
    // Printed down the right edge like the data on a strip of film.
    rebate: "Frame 01 · Itahari · Nepal"
  },

  /* Brand statement, straight after the hero. */
  intro: {
    eyebrow: "About the work",
    title: ["Photography is more than", "capturing a moment."],
    emphasis: "It is about preserving how that moment felt.",
    body: [
      "I work quietly. Most of a session is conversation — walking, talking, waiting for the light to do something worth keeping. I direct only as much as a person needs to stop thinking about the camera, and then I get out of the way.",
      "Weddings, portraits, brands and the days in between. Whatever the occasion, I am looking for the same thing: the unguarded second between the poses."
    ],
    image: {
      id: "1524250502761-1ac6f2e30d43",
      tone: "#9D9687",
      alt: "A woman walking through low sunlight, photographed from behind.",
      caption: "Natural light · Itahari"
    }
  },

  /* About the photographer. */
  about: {
    eyebrow: "The photographer",
    greeting: "Hi, I'm Dharshan.",
    body: [
      "I am a wedding, portrait and editorial photographer based in Itahari, and I photograph across Nepal — Biratnagar, Dharan, Kathmandu, Pokhara and wherever else the day happens to be.",
      "I started photographing the people around me and never really stopped. What holds my attention is not the pose but the moment either side of it: the pause before a vow, the laugh someone tries to hide, the light going gold over the hills at the end of an afternoon.",
      "If you are the kind of person who says they are bad at being photographed, we will get along. That is most of my work."
    ],
    signature: "The best photographs happen when people forget the camera is there.",
    image: {
      id: "1493863641943-9b68992a8d07",
      tone: "#7D7A70",
      alt: "A photographer working on the street with a camera raised to their eye.",
      caption: "Portrait of the photographer"
    },
    /* Facts, not achievement counts. Swap in real figures — years working,
       sessions delivered — whenever you want to; set to [] to hide the block. */
    stats: [
      { value: "Itahari", label: "Based in" },
      { value: "Nepal-wide", label: "Coverage" },
      { value: "2–4 weeks", label: "Delivery" }
    ]
  },

  /* Instagram / social strip. Replace with your own frames. */
  social_gallery: {
    eyebrow: "Follow the journey",
    title: "Recent frames",
    images: [
      { id: "1465495976277-4387d4b0b4c6", tone: "#B3978C", alt: "Close-up of two hands, one wearing a wedding ring." },
      { id: "1469334031218-e382a71b716b", tone: "#BC9C5B", alt: "A woman in sunglasses against a yellow wall." },
      { id: "1524863479829-916d8e77f114", tone: "#74674F", alt: "A lone figure standing on a ridge at sunrise." },
      { id: "1519671482749-fd09be7ccebf", tone: "#604D3D", alt: "Two glasses raised in a toast at a celebration." },
      { id: "1529626455594-4ff0802cfb7e", tone: "#6D787D", alt: "Portrait of a woman in front of a painted blue wall." },
      { id: "1509319117193-57bab727e09d", tone: "#AA9E95", alt: "Knitted garments hanging on a rail, photographed for a brand." }
    ]
  },

  contact: {
    eyebrow: "Enquiries",
    title: ["Let's create", "something", "meaningful."],
    lede: "Have a story worth capturing? Tell me about it — dates, place, the people involved — and I'll come back with availability and a quote.",
    responseTime: "Replies within 2 business days"
  },

  footer: {
    blurb: "Wedding, portrait and editorial photography. Based in Itahari, Nepal, and available to travel for the day that needs it.",
    // Optional site credit. Leave empty to hide it.
    credit: ""
  }
};

/* Placeholder imagery
   ------------------
   All photographs on this site are stock placeholders served from Unsplash
   so the layout can be judged with real pictures in it. Replace every
   `id` with your own hosted images and rewrite the `alt` text to describe
   the actual frame. See README.md → "Replacing the photography". */
