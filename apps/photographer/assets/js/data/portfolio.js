/* ============================================================
   PORTFOLIO
   Order matters: the gallery lays items out on a repeating
   five-frame composition (wide · tall · tall · wide · cinema),
   so the sequence below is the sequence on the page — and it is
   preserved when a category filter is applied.

   Fields
     id       Unsplash photo id (replace with your own image path)
     tone     average colour, painted behind the frame while it loads
     category must match a slug in `categories`
     title    the frame's name, shown on the contact-sheet caption
     alt      what is actually in the photograph, for screen readers
     meta     exposure data printed along the caption edge; swap in
              real EXIF from your files, or set it to "" to hide it
   ============================================================ */

export const categories = [
  { slug: "all",        label: "All" },
  { slug: "weddings",   label: "Weddings" },
  { slug: "portraits",  label: "Portraits" },
  { slug: "fashion",    label: "Fashion" },
  { slug: "events",     label: "Events" },
  { slug: "commercial", label: "Commercial" }
];

export const portfolio = [
  { id:"1520854221256-17451cc331bf", tone:"#5A5F4A", category:"weddings",  title:"Held",
    alt:"Two hands joined, casting a heart-shaped shadow on sunlit grass.",
    meta:"50mm · ƒ/1.8 · 1/800 · ISO 100" },

  { id:"1506794778202-cad84cf45f1d", tone:"#382D26", category:"portraits", title:"Low key",
    alt:"A man in a textured jacket photographed against a dark background.",
    meta:"85mm · ƒ/1.4 · 1/160 · ISO 400" },

  { id:"1502823403499-6ccfcf4fb453", tone:"#6E5E6E", category:"fashion",   title:"Gel study",
    alt:"Profile of a woman lit with deep magenta gelled light.",
    meta:"85mm · ƒ/2.0 · 1/200 · ISO 200" },

  { id:"1537633552985-df8429e8048b", tone:"#A7ABAA", category:"weddings",  title:"Long veil",
    alt:"A couple embracing on a beach, the bride's veil trailing across the sand.",
    meta:"35mm · ƒ/2.8 · 1/1000 · ISO 100" },

  { id:"1533174072545-7a4b6ad7a6c3", tone:"#32332C", category:"events",    title:"House lights",
    alt:"A crowd silhouetted against stage lighting at a live event.",
    meta:"24mm · ƒ/2.8 · 1/60 · ISO 3200" },

  { id:"1524504388940-b1c1722653e1", tone:"#403734", category:"portraits", title:"Quiet",
    alt:"A woman in a dark blouse turning towards a single soft light source.",
    meta:"85mm · ƒ/1.8 · 1/250 · ISO 320" },

  { id:"1546032996-6dfacbacbf3f",    tone:"#A0938D", category:"weddings",  title:"Open field",
    alt:"A couple wrapped together in a veil in an open field at dusk.",
    meta:"50mm · ƒ/1.4 · 1/2000 · ISO 100" },

  { id:"1490481651871-ab68de25d43d", tone:"#C4B9B1", category:"commercial",title:"Rail",
    alt:"A rail of pale clothing photographed for a retail brand.",
    meta:"35mm · ƒ/4.0 · 1/125 · ISO 400" },

  { id:"1488426862026-3ee34a7d66df", tone:"#A58D86", category:"fashion",   title:"Denim, pink wall",
    alt:"A woman in a denim jacket in front of a soft pink wall.",
    meta:"50mm · ƒ/2.0 · 1/500 · ISO 100" },

  { id:"1519225421980-715cb0215aed", tone:"#B0A79C", category:"events",    title:"Before the guests",
    alt:"A laid dinner table with flowers and glassware before guests arrive.",
    meta:"35mm · ƒ/2.2 · 1/125 · ISO 640" },

  { id:"1499996860823-5214fcc65f8f", tone:"#494133", category:"portraits", title:"Direct",
    alt:"Close portrait of a young man looking straight into the lens.",
    meta:"85mm · ƒ/1.4 · 1/200 · ISO 250" },

  { id:"1583939003579-730e3918a45a", tone:"#6D6C6C", category:"weddings",  title:"The exit",
    alt:"Guests throwing confetti over a couple leaving a wedding ceremony.",
    meta:"35mm · ƒ/2.8 · 1/1600 · ISO 200" },

  { id:"1550928431-ee0ec6db30d3",    tone:"#B09295", category:"fashion",   title:"Dune",
    alt:"A model in a deep red gown standing on pale sand dunes.",
    meta:"70mm · ƒ/4.0 · 1/1000 · ISO 100" },

  { id:"1502920917128-1aa500764cbd", tone:"#B5B8BA", category:"commercial",title:"Product, white",
    alt:"A camera body photographed on a clean white background for a catalogue.",
    meta:"90mm · ƒ/11 · 1/160 · ISO 100" },

  { id:"1492684223066-81342ee5ff30", tone:"#364462", category:"events",    title:"Confetti",
    alt:"Confetti falling over a crowd lit in blue at a festival.",
    meta:"24mm · ƒ/2.0 · 1/125 · ISO 2000" },

  { id:"1544005313-94ddf0286df2",    tone:"#4F453A", category:"portraits", title:"Window light",
    alt:"A woman in a striped shirt photographed beside a window.",
    meta:"50mm · ƒ/2.0 · 1/160 · ISO 400" },

  { id:"1522673607200-164d1b6ce486", tone:"#B7C589", category:"weddings",  title:"Two chairs",
    alt:"Two decorated chairs set out on grass for a wedding ceremony.",
    meta:"35mm · ƒ/2.8 · 1/1000 · ISO 100" },

  { id:"1496747611176-843222e1e57c", tone:"#B6B6B6", category:"fashion",   title:"Coastline",
    alt:"A woman in a floral dress photographed against a bright coastline.",
    meta:"35mm · ƒ/5.6 · 1/2000 · ISO 100" },

  { id:"1540575467063-178a50c2df87", tone:"#191A23", category:"events",    title:"Keynote",
    alt:"An audience seated in a darkened hall during a conference talk.",
    meta:"70mm · ƒ/2.8 · 1/100 · ISO 4000" },

  { id:"1492562080023-ab3db95bfbce", tone:"#786D64", category:"portraits", title:"Golden hour",
    alt:"A man photographed in an open field during golden hour.",
    meta:"85mm · ƒ/1.8 · 1/2500 · ISO 100" },

  { id:"1521572163474-6864f9cf17ab", tone:"#ACA7A9", category:"commercial",title:"Plain white",
    alt:"A plain white t-shirt photographed on a model for a clothing brand.",
    meta:"50mm · ƒ/5.6 · 1/200 · ISO 200" },

  { id:"1511285560929-80b456fea0bc", tone:"#C1B2B1", category:"weddings",  title:"Celebration",
    alt:"A wedding party releasing balloons around the couple.",
    meta:"24mm · ƒ/4.0 · 1/800 · ISO 200" },

  { id:"1483985988355-763728e1935b", tone:"#978A83", category:"fashion",   title:"Campaign",
    alt:"A woman in a red coat carrying shopping bags, shot for a campaign.",
    meta:"50mm · ƒ/2.8 · 1/400 · ISO 200" },

  { id:"1487412720507-e7ab37603c6f", tone:"#868085", category:"portraits", title:"Winter",
    alt:"A woman in a knitted hat and scarf photographed outdoors in winter.",
    meta:"85mm · ƒ/2.0 · 1/500 · ISO 200" },

  { id:"1511578314322-379afb476865", tone:"#A8A291", category:"events",    title:"Room set",
    alt:"An empty conference room set with round tables before an event.",
    meta:"16mm · ƒ/8.0 · 1/60 · ISO 800" },

  { id:"1445205170230-053b83016050", tone:"#736344", category:"commercial",title:"Shopfront",
    alt:"The interior of a boutique, photographed for the brand's website.",
    meta:"24mm · ƒ/2.8 · 1/80 · ISO 1250" }
];
