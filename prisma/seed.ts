/**
 * Development seed. Everything here is FICTIONAL (no real businesses/people).
 *   npm run db:seed
 * Demo logins (password for all: Wedora2026!)
 *   Couple : couple@wedora.test
 *   Vendor : vendor@wedora.test   (owns "The Nile House")
 *   Admin  : admin@wedora.test
 */
import { PrismaClient, type RSVPStatus, type TaskPriority, type TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { contactKey } from "../lib/calculations";
import { BLOG_CATEGORIES, BUDGET_CATEGORIES, DEFAULT_BUDGET_SPLIT, VENDOR_CATEGORIES } from "../lib/constants";

const prisma = new PrismaClient();
const PASSWORD = "Wedora2026!";
const DAY = 86_400_000;
const now = new Date();
const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const d = (offsetDays: number) => new Date(today.getTime() + offsetDays * DAY);
const img = (id: string, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** All IDs verified to return HTTP 200 from images.unsplash.com. */
const POOL = [
  "photo-1519741497674-611481863552",
  "photo-1519167758481-83f550bb49b3",
  "photo-1478146896981-b80fe463b330",
  "photo-1511795409834-ef04bbd61622",
  "photo-1469371670807-013ccf25f16a",
  "photo-1513278974582-3e1b4a4fa21e",
  "photo-1537633552985-df8429e8048b",
  "photo-1519671482749-fd09be7ccebf",
  "photo-1522673607200-164d1b6ce486",
  "photo-1529636798458-92182e662485",
  "photo-1525772764200-be829a350797",
  "photo-1519225421980-715cb0215aed",
  "photo-1465495976277-4387d4b0b4c6",
  "photo-1530023367847-a683933f4172",
  "photo-1519671845924-1fd18db430b8",
  "photo-1523438885200-e635ba2c371e",
  "photo-1523438097201-512ae7d59c44",
  "photo-1464366400600-7168b8af9bc3",
  "photo-1490750967868-88aa4486c946",
  "photo-1594552072238-b8a33785b261",
  "photo-1516280440614-37939bbacd81",
  "photo-1441148345475-03a2e82f9719",
  "photo-1520854221256-17451cc331bf",
  "photo-1550005809-91ad75fb315f",
  "photo-1560185007-cde436f6a4d0",
  "photo-1493676304819-0d7a8d026dcf",
  "photo-1470229722913-7c0e2dbbafd3",
  "photo-1502635385003-ee1e6a1a742d",
];
const pick = (offset: number) => POOL[((offset % POOL.length) + POOL.length) % POOL.length];

type V = {
  name: string;
  cat: string;
  city: string;
  area: string;
  price: number;
  capacity?: number;
  styles: string[];
  blurb: string;
  featured?: boolean;
  verified?: boolean;
  lat: number;
  lng: number;
};

const VENDORS: V[] = [
  // Venues
  { name: "The Nile House", cat: "Venues", city: "Cairo", area: "Zamalek", price: 95000, capacity: 300, styles: ["Garden", "Luxury", "Romantic"], featured: true, lat: 30.0626, lng: 31.2197, blurb: "A leafy garden venue on the Nile with candlelit terraces, a glass-roofed ballroom and a dedicated bridal suite." },
  { name: "Orchard Estate", cat: "Venues", city: "Giza", area: "6th of October", price: 72000, capacity: 450, styles: ["Garden", "Rustic"], featured: true, lat: 29.9602, lng: 30.9267, blurb: "An open-air estate tucked among olive trees, made for long evenings, lanterns and big family tables." },
  { name: "Palma Terrace", cat: "Venues", city: "Alexandria", area: "Stanley", price: 110000, capacity: 250, styles: ["Classic", "Modern", "Luxury"], lat: 31.2325, lng: 29.9496, blurb: "A sea-facing terrace and ballroom on the Mediterranean, with sunset ceremonies on the water's edge." },
  // Photography
  { name: "Frame & Story", cat: "Photography", city: "Cairo", area: "Maadi", price: 18000, styles: ["Classic", "Romantic", "Modern"], featured: true, lat: 29.9602, lng: 31.2569, blurb: "Documentary wedding photography with an editorial eye. Two photographers, full-day coverage and a private gallery." },
  { name: "Golden Hour Studio", cat: "Photography", city: "Giza", area: "Dokki", price: 15000, styles: ["Romantic", "Garden"], lat: 30.0384, lng: 31.2128, blurb: "Warm, natural-light portraits and candid moments, delivered within three weeks." },
  { name: "Sea Light Photography", cat: "Photography", city: "Alexandria", area: "Montaza", price: 22000, styles: ["Modern", "Minimal"], lat: 31.2882, lng: 30.0159, blurb: "Cinematic coastal weddings: photo and film shot together by one close-knit team." },
  // Decoration
  { name: "Olive & Rose", cat: "Decoration", city: "Giza", area: "Sheikh Zayed", price: 32000, styles: ["Romantic", "Modern", "Garden"], featured: true, lat: 30.0131, lng: 30.9855, blurb: "Personal floral styling and considered tablescapes for celebrations of every size." },
  { name: "Maison Lumière Events", cat: "Decoration", city: "Cairo", area: "New Cairo", price: 65000, styles: ["Luxury", "Classic"], lat: 30.0074, lng: 31.4913, blurb: "Grand, sculptural installations, draped ceilings and lighting design for luxury ballroom weddings." },
  { name: "Blue Shore Styling", cat: "Decoration", city: "Alexandria", area: "Smouha", price: 28000, styles: ["Minimal", "Modern"], lat: 31.2156, lng: 29.9553, blurb: "Airy, coastal-inspired décor in whites, linens and driftwood tones." },
  // Makeup
  { name: "Layla Beauty Studio", cat: "Makeup", city: "Cairo", area: "New Cairo", price: 8500, styles: ["Classic", "Minimal"], featured: true, lat: 30.0074, lng: 31.4913, blurb: "Soft, luminous bridal makeup that feels like you, only a little more polished. Trial included." },
  { name: "Noor Glow Atelier", cat: "Makeup", city: "Giza", area: "Mohandessin", price: 7000, styles: ["Romantic", "Classic"], lat: 30.0561, lng: 31.2005, blurb: "Bridal hair and makeup with a team that travels to you on the morning of your wedding." },
  { name: "Mariam Faris Makeup", cat: "Makeup", city: "Alexandria", area: "Miami", price: 6500, styles: ["Modern", "Minimal"], lat: 31.2653, lng: 29.9965, blurb: "Fresh, skin-first bridal looks designed to last through the long, warm evenings." },
  // Catering
  { name: "The Table Story", cat: "Catering", city: "Alexandria", area: "Stanley", price: 48000, capacity: 400, styles: ["Modern", "Classic"], lat: 31.2325, lng: 29.9496, blurb: "Seasonal Egyptian and Mediterranean menus, served with genuine hospitality." },
  { name: "Saffron & Salt", cat: "Catering", city: "Cairo", area: "Heliopolis", price: 62000, capacity: 500, styles: ["Luxury", "Traditional"], featured: true, lat: 30.0911, lng: 31.3226, blurb: "Plated dinners and generous mezze tables from a kitchen that has fed Cairo's celebrations for years." },
  { name: "Nile Feast Catering", cat: "Catering", city: "Giza", area: "Dokki", price: 42000, capacity: 600, styles: ["Traditional", "Classic"], lat: 30.0384, lng: 31.2128, blurb: "Hearty family-style feasts and live cooking stations for large celebrations." },
  // Flowers
  { name: "The Bloom Room", cat: "Flowers", city: "Giza", area: "Dokki", price: 12500, styles: ["Garden", "Romantic"], lat: 30.0384, lng: 31.2128, blurb: "Seasonal bouquets and installations with a natural, garden-gathered feel." },
  { name: "Petal & Thread", cat: "Flowers", city: "Cairo", area: "Maadi", price: 16000, styles: ["Modern", "Minimal"], lat: 29.9602, lng: 31.2569, blurb: "Sculptural, tonal arrangements and dried-flower details for modern ceremonies." },
  { name: "Jasmine Lane Florals", cat: "Flowers", city: "Alexandria", area: "Sidi Gaber", price: 9500, styles: ["Romantic", "Classic"], lat: 31.2205, lng: 29.9425, blurb: "Fragrant jasmine, roses and ranunculus, arranged by hand and delivered fresh." },
  // Dresses
  { name: "Atelier Noor", cat: "Dresses", city: "Cairo", area: "Garden City", price: 45000, styles: ["Luxury", "Modern"], featured: true, lat: 30.0361, lng: 31.2306, blurb: "Made-to-measure bridal pieces shaped around your story, fit and celebration." },
  { name: "Silk & Thread Couture", cat: "Dresses", city: "Giza", area: "Mohandessin", price: 38000, styles: ["Classic", "Romantic"], lat: 30.0561, lng: 31.2005, blurb: "Hand-embroidered gowns with delicate lace and tulle, finished in our own workshop." },
  { name: "Pearl Harbour Bridal", cat: "Dresses", city: "Alexandria", area: "Smouha", price: 26000, styles: ["Minimal", "Modern"], lat: 31.2156, lng: 29.9553, blurb: "A curated bridal boutique with ready-to-wear and alteration services under one roof." },
  // Music
  { name: "Soft Sound Collective", cat: "Music", city: "Cairo", area: "Heliopolis", price: 14000, styles: ["Modern", "Classic"], verified: false, lat: 30.0911, lng: 31.3226, blurb: "A close-knit live band and DJ team that knows how to read a room." },
  { name: "Midnight Oud Band", cat: "Music", city: "Giza", area: "Haram", price: 24000, styles: ["Traditional", "Luxury"], featured: true, lat: 29.9792, lng: 31.1342, blurb: "Eight-piece live band blending classic Arabic repertoire with modern favourites." },
  { name: "Delta Beats DJs", cat: "Music", city: "Alexandria", area: "Montaza", price: 11000, styles: ["Modern"], lat: 31.2882, lng: 30.0159, blurb: "DJ, sound and lighting packages for ceremonies, receptions and late-night dance floors." },
  // Transportation
  { name: "City Ride Weddings", cat: "Transportation", city: "Cairo", area: "Nasr City", price: 6500, styles: ["Classic", "Modern"], verified: false, lat: 30.0511, lng: 31.3656, blurb: "Reliable, polished wedding-day transport for the couple and their guests." },
  { name: "Heritage Wheels", cat: "Transportation", city: "Cairo", area: "Downtown", price: 12000, styles: ["Classic", "Luxury"], lat: 30.0444, lng: 31.2357, blurb: "Vintage and classic cars, chauffeured and decorated to match your colours." },
  { name: "Corniche Cruisers", cat: "Transportation", city: "Alexandria", area: "Miami", price: 8000, styles: ["Modern", "Luxury"], lat: 31.2653, lng: 29.9965, blurb: "Luxury sedans and guest shuttles along the Corniche, with a dedicated coordinator." },
];

const SERVICES: Record<string, Array<[string, string, number]>> = {
  Venues: [["Venue hire (evening)", "Exclusive use for up to 8 hours, setup included", 1], ["Ceremony add-on", "Dedicated ceremony space with seating and sound", 0.2], ["Bridal suite", "Private suite for the couple on the day", 0.1]],
  Photography: [["Full-day coverage", "Up to 10 hours with two photographers", 1], ["Engagement session", "Two-hour portrait session", 0.3], ["Wedding album", "Hand-finished 30-page album", 0.4]],
  Decoration: [["Ceremony styling", "Arch, aisle and seating décor", 0.6], ["Reception styling", "Tables, centrepieces and lighting", 1], ["Entrance installation", "Statement welcome piece", 0.35]],
  Makeup: [["Bridal makeup", "Full bridal look on the day", 1], ["Bridal trial", "Pre-wedding trial and consultation", 0.4], ["Bridesmaid makeup", "Per person", 0.5]],
  Catering: [["Plated dinner", "Three-course seasonal menu, per package", 1], ["Live stations", "Chef-attended stations", 0.4], ["Dessert table", "Selection of traditional and modern sweets", 0.25]],
  Flowers: [["Bridal bouquet", "Hand-tied bridal bouquet", 0.4], ["Ceremony flowers", "Arch and aisle florals", 1], ["Table arrangements", "Per-table centrepieces", 0.7]],
  Dresses: [["Made-to-measure gown", "Design, fittings and final gown", 1], ["Veil & accessories", "Matching veil and accessories", 0.2], ["Alterations", "Up to three fitting sessions", 0.15]],
  Music: [["Live band (4 hours)", "Full band with sound system", 1], ["Ceremony music", "Acoustic set for the ceremony", 0.3], ["DJ after-party", "Extra two hours of DJ", 0.25]],
  Transportation: [["Bridal car", "Decorated bridal car with driver", 1], ["Guest shuttle", "Two shuttle buses, 8 hours", 1.4], ["Airport transfer", "Per vehicle", 0.2]],
};

const REVIEW_COMMENTS = [
  "Calm, organised and genuinely kind. Everything ran exactly on time and nothing felt like a hassle.",
  "They understood our vision from the first call and delivered something even better than we pictured.",
  "Our families are still talking about it. Highly recommended for anyone planning in Egypt.",
  "Professional from the quote to the last dance. Communication was quick and clear throughout.",
  "Great value for the quality. We'd happily book again and have already recommended them to friends.",
  "Lovely people and beautiful work. A couple of small timing changes on the day, but handled gracefully.",
  "Detail-oriented and warm. They made a stressful part of planning feel easy.",
  "Exactly what we hoped for. The team went above and beyond on the day.",
];

const BLOG = [
  { cat: "Wedding Planning", title: "How to plan a wedding in Egypt: a 12-month timeline", cover: POOL[0], excerpt: "A calm, month-by-month roadmap for booking the right people at the right time.", body: "Planning a wedding in Egypt rewards early decisions, especially for venues and photographers that book out for peak season.\n\n## 12–9 months out\n\nFix your date window, set a total budget and shortlist three venues. Ask each for a date-specific quote and what is included: service, sound, furniture, taxes and overtime.\n\n## 8–5 months out\n\nBook your photographer, caterer and music, then start on attire and décor. Hold regular check-ins so nothing is left to the last minute.\n\n## 4–1 months out\n\nConfirm your final guest count, build the day-of schedule and share it with every vendor. Keep a small buffer in the budget for changes." },
  { cat: "Venues", title: "Garden, ballroom or Nile-side? Choosing your venue", cover: POOL[1], excerpt: "What to ask, what to compare and how season changes the answer.", body: "The right venue shapes everything else: guest count, décor, timing and budget.\n\n## Think about the season\n\nGarden venues shine from October to April. In summer, an air-conditioned ballroom or an evening ceremony makes guests far more comfortable.\n\n## Questions to ask on a visit\n\n- What is the minimum and maximum capacity?\n- What is included in the price, and what is extra?\n- What is the overtime policy?\n- Is there a rain or heat backup plan?\n\n## Visit at the right time\n\nIf you can, see the venue at the hour of your wedding so you know how the light and the space really feel." },
  { cat: "Budget", title: "Where to spend and where to save on your wedding budget", cover: POOL[2], excerpt: "Practical ways to protect what matters most to you.", body: "Every couple has a different list of priorities, and a good budget reflects them honestly.\n\n## Start with your top three\n\nChoose the three things that matter most, such as venue, food or photography, and give them the largest share. Be intentional about the rest.\n\n## Easy places to save\n\nFlowers in season, a shorter guest list for the dinner and a smaller number of décor statement pieces can free up meaningful money.\n\n## Always keep a buffer\n\nSet aside 8–10% for changes and surprises so a late decision never becomes a financial stress." },
  { cat: "Photography", title: "Questions to ask before you book a wedding photographer", cover: POOL[6], excerpt: "Style, delivery and what happens if something goes wrong.", body: "Your photos are what you keep, so choose a photographer whose style you genuinely love.\n\n## Review full galleries\n\nAsk to see a complete wedding, not just a highlights reel, so you can judge consistency across the whole day.\n\n## Clarify the practical details\n\nHow many photographers will attend? How long is coverage? When will you receive the gallery, and in what format?\n\n## Plan the timeline together\n\nShare your schedule early and build in time for portraits at the best light of the day." },
  { cat: "Decoration", title: "Décor that feels personal, not copied", cover: POOL[11], excerpt: "How to bring your own story into the details.", body: "The most memorable weddings feel unmistakably like the couple who planned them.\n\n## Start with a palette\n\nChoose two or three colours and a texture or material you love, then let every decision flow from them.\n\n## Use what already exists\n\nA beautiful venue needs less. Work with natural light, greenery and architecture instead of covering them up.\n\n## Add meaningful details\n\nFamily photographs, handwritten notes and a signature scent are small touches that guests remember." },
  { cat: "Beauty", title: "Bridal makeup: how to plan your trial", cover: POOL[15], excerpt: "Bring the right references and test it in the right light.", body: "A trial takes the guesswork out of your look, so you can enjoy the morning of your wedding.\n\n## Bring references\n\nCollect a few photos you love, including what you do not want. It helps your artist understand your taste quickly.\n\n## Test it in daylight\n\nTake photos in natural light and in flash, then check how it looks after a few hours of wear.\n\n## Plan the morning\n\nAgree arrival time, number of people and a buffer so hair and makeup finish before photographs begin." },
  { cat: "Fashion", title: "How long does a made-to-measure wedding dress take?", cover: POOL[19], excerpt: "Timelines, fittings and when to start.", body: "Made-to-measure gowns are beautiful and personal, but they need time.\n\n## Start early\n\nMost ateliers need four to six months. Begin at least eight months before your wedding to leave room for fittings.\n\n## Fittings matter\n\nExpect two to three fittings. Bring the shoes and undergarments you plan to wear on the day.\n\n## Allow a buffer\n\nLeave a few weeks between the final fitting and the wedding for any last adjustments." },
  { cat: "Tips", title: "Ten small things that make wedding days run smoothly", cover: POOL[4], excerpt: "The little details that make the biggest difference.", body: "A smooth wedding day is built on small, thoughtful decisions made in advance.\n\n## Share one schedule\n\nGive every vendor the same timeline and a single point of contact on the day.\n\n## Feed your team\n\nPlan meals for your photographer, band and coordinator so they can stay at their best.\n\n## Have a backup\n\nKeep an emergency kit, a spare phone charger and a plan for weather or traffic. Then relax and enjoy it." },
];

const FIRST = ["Ahmed", "Mona", "Karim", "Nour", "Youssef", "Salma", "Tarek", "Hana", "Mostafa", "Dina", "Khaled", "Laila", "Hossam", "Rana", "Adel", "Farida", "Sherif", "Yasmin", "Amr", "Heba", "Ziad", "Mariam", "Walid", "Nadine", "Ramy", "Aya", "Mahmoud", "Reem", "Fady", "Jana"];
const LAST = ["Hassan", "Mansour", "Fouad", "Soliman", "Ibrahim", "Nasser", "Abdelrahman", "Shawky", "Gad", "Anwar"];

const slugify = (s: string) => s.toLowerCase().replace(/&/g, " and ").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function reset() {
  await prisma.$transaction([
    prisma.invoice.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.vendorReview.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.rSVP.deleteMany(),
    prisma.weddingWebsiteSection.deleteMany(),
    prisma.weddingWebsite.deleteMany(),
    prisma.guest.deleteMany(),
    prisma.guestGroup.deleteMany(),
    prisma.budgetTransaction.deleteMany(),
    prisma.budgetCategory.deleteMany(),
    prisma.weddingBudget.deleteMany(),
    prisma.weddingTask.deleteMany(),
    prisma.vendorBooking.deleteMany(),
    prisma.favoriteVendor.deleteMany(),
    prisma.aIRecommendation.deleteMany(),
    prisma.vendorAvailability.deleteMany(),
    prisma.vendorPortfolio.deleteMany(),
    prisma.vendorPackage.deleteMany(),
    prisma.vendorService.deleteMany(),
    prisma.vendor.deleteMany(),
    prisma.vendorCategory.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.blogCategory.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.siteSetting.deleteMany(),
    prisma.authToken.deleteMany(),
    prisma.wedding.deleteMany(),
    prisma.couple.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function main() {
  if (process.env.NODE_ENV === "production" && !process.env.SEED_FORCE) {
    throw new Error("Refusing to seed (and wipe) a production database. Set SEED_FORCE=1 to override.");
  }
  console.log("Resetting database…");
  await reset();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const verified = new Date();

  const categories = new Map<string, string>();
  for (const c of VENDOR_CATEGORIES) {
    const row = await prisma.vendorCategory.create({
      data: { name: c.name, slug: c.slug, route: c.route, tagline: c.tagline, image: img(pick(VENDOR_CATEGORIES.indexOf(c) * 3), 900) },
    });
    categories.set(c.name, row.id);
  }
  const blogCats = new Map<string, string>();
  for (const name of BLOG_CATEGORIES) {
    blogCats.set(name, (await prisma.blogCategory.create({ data: { name, slug: slugify(name) } })).id);
  }

  await prisma.user.create({
    data: { email: "admin@wedora.test", passwordHash, role: "ADMIN", emailVerifiedAt: verified, profile: { create: { name: "WEDORA Admin" } } },
  });

  // Vendors: one owner account each, so messaging/notifications always have a recipient.
  const vendorIds: string[] = [];
  const vendorOwners: string[] = [];
  for (let i = 0; i < VENDORS.length; i++) {
    const v = VENDORS[i];
    const slug = slugify(v.name);
    const email = i === 0 ? "vendor@wedora.test" : `${slug}@vendors.wedora.test`;
    const user = await prisma.user.create({
      data: { email, passwordHash, role: "VENDOR", emailVerifiedAt: verified, profile: { create: { name: v.name, phone: "+20 10 5550 " + String(1000 + i) } } },
    });
    const vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        categoryId: categories.get(v.cat)!,
        name: v.name,
        slug,
        city: v.city,
        area: v.area,
        address: `${v.area}, ${v.city}, Egypt`,
        latitude: v.lat,
        longitude: v.lng,
        description: v.blurb + " We take on a limited number of weddings each season so every couple gets our full attention.",
        startingPrice: v.price,
        capacity: v.capacity,
        styles: v.styles,
        phone: "+20 10 5550 " + String(1000 + i),
        email,
        instagram: slug.replace(/-/g, "_"),
        imageUrl: img(pick(i * 2 + 1), 600),
        coverUrl: img(pick(i * 2), 1800),
        approved: true,
        verification: v.verified === false ? "PENDING" : "VERIFIED",
        featured: !!v.featured,
        viewCount: 120 + ((i * 53) % 400),
        services: {
          create: SERVICES[v.cat].map(([name, description, factor]) => ({ name, description, price: Math.round((v.price * factor) / 500) * 500 })),
        },
        packages: {
          create: [
            { name: "Essential", description: "Everything you need for a smaller celebration.", price: v.price, features: ["Core service", "Planning call", "Email support"] },
            { name: "Signature", description: "Our most popular choice.", price: Math.round((v.price * 1.5) / 500) * 500, features: ["Everything in Essential", "Extended hours", "Dedicated coordinator", "Priority scheduling"] },
            { name: "Luxury", description: "The full, unhurried experience.", price: Math.round((v.price * 2.2) / 500) * 500, features: ["Everything in Signature", "Premium upgrades", "On-site team", "Post-event follow-up"] },
          ],
        },
        portfolio: {
          create: [0, 1, 2, 3, 4, 5].map((n) => ({ imageUrl: img(pick(i * 3 + n * 2 + 4), 1200), caption: n === 0 ? "Recent celebration" : null, position: n })),
        },
      },
    });
    vendorIds.push(vendor.id);
    vendorOwners.push(user.id);
    const blocked = new Set<number>();
    for (let k = 0; k < 6; k++) blocked.add(20 + ((i * 17 + k * 31) % 300));
    await prisma.vendorAvailability.createMany({ data: [...blocked].map((n) => ({ vendorId: vendor.id, date: d(n), available: false })) });
  }

  // A vendor awaiting approval (admin queue).
  const pendingUser = await prisma.user.create({
    data: { email: "new-vendor@wedora.test", passwordHash, role: "VENDOR", emailVerifiedAt: verified, profile: { create: { name: "Amal Studio" } } },
  });
  await prisma.vendor.create({
    data: {
      userId: pendingUser.id,
      categoryId: categories.get("Photography")!,
      name: "Amal Studio",
      slug: "amal-studio",
      city: "Cairo",
      area: "Maadi",
      description: "A newly joined photography studio awaiting review by the WEDORA team.",
      startingPrice: 12000,
      styles: ["Modern"],
      email: "new-vendor@wedora.test",
      imageUrl: img(pick(5), 600),
      coverUrl: img(pick(7), 1800),
      approved: false,
      verification: "PENDING",
    },
  });

  // Six past couples (reviewers) + two future couples that send pending requests.
  const reviewerCouples: Array<{ weddingId: string; userId: string }> = [];
  for (let c = 0; c < 8; c++) {
    const past = c < 6;
    const first = FIRST[c * 2];
    const user = await prisma.user.create({
      data: {
        email: `reviewer${c + 1}@wedora.test`,
        passwordHash,
        emailVerifiedAt: verified,
        profile: { create: { name: `${first} ${LAST[c]}` } },
        couple: {
          create: {
            partnerName: FIRST[c * 2 + 1],
            wedding: { create: { title: `${first} & ${FIRST[c * 2 + 1]}`, date: past ? d(-40 - c * 55) : d(240 + c * 20), city: ["Cairo", "Giza", "Alexandria"][c % 3], guestCount: 120 + c * 20, style: ["Classic", "Garden", "Modern"][c % 3] } },
          },
        },
      },
      include: { couple: { include: { wedding: true } } },
    });
    reviewerCouples.push({ weddingId: user.couple!.wedding!.id, userId: user.id });
  }

  // Completed bookings + payments + reviews (reviews exist ONLY for completed bookings).
  let reviewCount = 0;
  for (let vi = 0; vi < vendorIds.length; vi++) {
    for (let ci = 0; ci < 6; ci++) {
      if ((vi + ci) % 6 >= 3) continue;
      const base = VENDORS[vi].price;
      const total = Math.round((base * 1.5) / 500) * 500;
      const eventDate = d(-40 - ci * 55);
      const booking = await prisma.vendorBooking.create({
        data: {
          weddingId: reviewerCouples[ci].weddingId,
          vendorId: vendorIds[vi],
          packageName: "Signature",
          eventDate,
          totalPrice: total,
          status: "COMPLETED",
          createdAt: new Date(eventDate.getTime() - 120 * DAY),
          payment: { create: { amount: total, provider: "mock", status: "PAID", providerRef: `seed-${vi}-${ci}` } },
        },
        include: { payment: true },
      });
      await prisma.invoice.create({ data: { paymentId: booking.payment!.id, number: `INV-${String(1000 + reviewCount)}` } });
      const rating = (vi * 7 + ci * 3) % 11 === 0 ? 3 : (vi + ci) % 4 === 0 ? 4 : 5;
      await prisma.vendorReview.create({
        data: {
          vendorId: vendorIds[vi],
          bookingId: booking.id,
          rating,
          comment: REVIEW_COMMENTS[(vi + ci * 3) % REVIEW_COMMENTS.length],
          createdAt: new Date(eventDate.getTime() + 6 * DAY),
        },
      });
      reviewCount++;
    }
  }
  const grouped = await prisma.vendorReview.groupBy({ by: ["vendorId"], _avg: { rating: true }, _count: { _all: true } });
  for (const g of grouped) {
    await prisma.vendor.update({ where: { id: g.vendorId }, data: { rating: Math.round((g._avg.rating ?? 0) * 10) / 10, reviewCount: g._count._all } });
  }

  // ───── Demo couple ─────
  const weddingDate = d(182);
  const couple = await prisma.user.create({
    data: {
      email: "couple@wedora.test",
      passwordHash,
      emailVerifiedAt: verified,
      profile: { create: { name: "Omar Hassan", phone: "+20 100 555 0199" } },
      couple: {
        create: {
          partnerName: "Sara Khalil",
          wedding: { create: { title: "Omar & Sara", date: weddingDate, city: "Cairo", guestCount: 150, style: "Luxury", venuePreference: "Garden venue with a Nile view", priorities: ["Venue", "Photography", "Catering"] } },
        },
      },
    },
    include: { couple: { include: { wedding: true } } },
  });
  const coupleId = couple.couple!.id;
  const weddingId = couple.couple!.wedding!.id;

  const tasks: Array<[string, string, TaskPriority, TaskStatus, number]> = [
    ["Book the venue", "Venue", "HIGH", "DONE", -40],
    ["Pay the venue deposit", "Venue", "HIGH", "DONE", -35],
    ["Choose a photographer", "Photography", "HIGH", "IN_PROGRESS", 5],
    ["Taste menus with caterers", "Catering", "MEDIUM", "TODO", 12],
    ["Send save-the-dates", "Invitations", "MEDIUM", "TODO", -3],
    ["Order printed invitations", "Invitations", "MEDIUM", "TODO", -1],
    ["Shortlist makeup artists", "Makeup", "MEDIUM", "TODO", 20],
    ["First dress fitting", "Dress", "HIGH", "TODO", 30],
    ["Book a live band or DJ", "Music", "MEDIUM", "TODO", 45],
    ["Decide the flower palette", "Flowers", "LOW", "TODO", 60],
    ["Plan guest transportation", "Transportation", "LOW", "TODO", 90],
    ["Finalise the guest list", "Guests", "HIGH", "DONE", -10],
    ["Choose a honeymoon destination", "Honeymoon", "LOW", "TODO", 75],
    ["Create a décor moodboard", "Decoration", "MEDIUM", "DONE", -20],
  ];
  await prisma.weddingTask.createMany({
    data: tasks.map(([title, category, priority, status, due]) => ({ weddingId, title, category, priority, status, dueDate: d(due), completedAt: status === "DONE" ? d(due) : null })),
  });

  const budget = await prisma.weddingBudget.create({ data: { weddingId, total: 250000 } });
  const catIds = new Map<string, string>();
  for (const name of BUDGET_CATEGORIES) {
    const row = await prisma.budgetCategory.create({ data: { budgetId: budget.id, name, planned: Math.round((250000 * DEFAULT_BUDGET_SPLIT[name]) / 500) * 500 } });
    catIds.set(name, row.id);
  }
  const spend: Array<[string, string, number, number]> = [
    ["Venue", "The Nile House — deposit", 60000, -35],
    ["Catering", "Menu deposit", 45000, -25],
    ["Photography", "Photographer retainer", 15000, -18],
    ["Decoration", "Décor retainer", 20000, -15],
    ["Dress", "Dress — first payment", 25000, -12],
    ["Invitations", "Invitation printing deposit", 5500, -6],
    ["Makeup", "Bridal trial & deposit", 4000, -4],
  ];
  await prisma.budgetTransaction.createMany({
    data: spend.map(([cat, title, amount, off]) => ({ budgetId: budget.id, categoryId: catIds.get(cat)!, title, amount, spentAt: d(off) })),
  });

  const groups = new Map<string, string>();
  for (const name of ["Family", "Friends", "Colleagues"]) {
    groups.set(name, (await prisma.guestGroup.create({ data: { weddingId, name } })).id);
  }
  const guestRows = [];
  for (let g = 0; g < 28; g++) {
    const name = `${FIRST[g]} ${LAST[(g * 3) % LAST.length]}`;
    const phone = `010${String(10000000 + g * 7919).slice(0, 8)}`;
    const status: RSVPStatus = g % 5 === 0 ? "DECLINED" : g % 3 === 0 ? "PENDING" : "CONFIRMED";
    guestRows.push({
      weddingId,
      groupId: groups.get(["Family", "Friends", "Colleagues"][g % 3]),
      name,
      phone,
      contactKey: contactKey(phone),
      partySize: g % 4 === 0 ? 2 : g % 7 === 0 ? 3 : 1,
      status,
      mealPreference: ["No preference", "Vegetarian", "Halal", "Gluten-free"][g % 4],
    });
  }
  await prisma.guest.createMany({ data: guestRows });

  const website = await prisma.weddingWebsite.create({
    data: {
      weddingId,
      slug: "omar-and-sara",
      template: "CLASSIC_LUXURY",
      headline: "We're getting married",
      story: "We met on a rainy afternoon in Zamalek and never really left the conversation. Two years later, we can't wait to celebrate with the people who have loved us along the way.\n\nJoin us for an evening of dinner, music and dancing by the Nile.",
      heroImage: img(POOL[0], 2000),
      gallery: [POOL[1], POOL[6], POOL[11], POOL[3]].map((p) => img(p, 1000)),
      venueName: "The Nile House",
      venueAddress: "Zamalek, Cairo, Egypt",
      dressCode: "Formal / black tie optional",
      contactEmail: "couple@wedora.test",
      published: true,
      sections: {
        create: [
          { kind: "schedule", position: 0, content: { time: "6:00 PM", title: "Guests arrive", description: "Welcome drinks on the terrace" } },
          { kind: "schedule", position: 1, content: { time: "7:00 PM", title: "Ceremony", description: "Garden ceremony by the Nile" } },
          { kind: "schedule", position: 2, content: { time: "8:30 PM", title: "Dinner & dancing", description: "Seated dinner followed by live music" } },
        ],
      },
    },
  });
  const rsvpGuests = guestRows.slice(1, 4);
  for (const g of rsvpGuests) {
    const guest = await prisma.guest.findFirst({ where: { weddingId, contactKey: g.contactKey } });
    await prisma.rSVP.create({
      data: { websiteId: website.id, guestId: guest?.id, name: g.name, contact: g.phone, contactKey: g.contactKey, attendance: "CONFIRMED", partySize: g.partySize, message: "So excited for you both!" },
    });
  }

  const nile = vendorIds[0];
  const frame = vendorIds[3];
  const table = vendorIds[VENDORS.findIndex((v) => v.name === "Saffron & Salt")];
  const confirmed = await prisma.vendorBooking.create({
    data: { weddingId, vendorId: nile, packageName: "Signature", eventDate: weddingDate, totalPrice: 142500, status: "CONFIRMED", notes: "Garden ceremony and reception for ~150 guests.", payment: { create: { amount: 60000, provider: "mock", status: "PAID", providerRef: "seed-demo-1" } } },
    include: { payment: true },
  });
  await prisma.invoice.create({ data: { paymentId: confirmed.payment!.id, number: "INV-0001" } });
  await prisma.vendorBooking.create({ data: { weddingId, vendorId: frame, packageName: "Essential", eventDate: weddingDate, totalPrice: 18000, status: "PENDING", notes: "Full-day coverage including the ceremony." } });
  await prisma.vendorBooking.create({ data: { weddingId, vendorId: table, packageName: "Signature", eventDate: weddingDate, totalPrice: 93000, status: "PENDING", changesRequested: true, vendorNote: "Could we confirm the final guest count range and whether you need live stations?", notes: "Plated dinner for 150." } });

  for (const c of [6, 7]) {
    await prisma.vendorBooking.create({
      data: { weddingId: reviewerCouples[c].weddingId, vendorId: nile, packageName: "Essential", eventDate: d(240 + c * 20), totalPrice: 95000, status: "PENDING", notes: "We'd love to see the garden in person before deciding." },
    });
  }

  for (const i of [0, 3, 6, 9, 13]) await prisma.favoriteVendor.create({ data: { coupleId, vendorId: vendorIds[i] } });

  const conv = await prisma.conversation.create({ data: { coupleId, vendorId: nile, lastMessageAt: d(-2) } });
  const msgs: Array<[string, string, number]> = [
    [couple.id, "Hi! We'd love to confirm the garden terrace for our date.", -34],
    [vendorOwners[0], "Wonderful to hear from you both. The terrace is yours. I've sent the booking for confirmation.", -34],
    [couple.id, "Could we arrange a tasting for the catering partner?", -3],
    [vendorOwners[0], "Of course. Does the first week of next month work for you?", -2],
  ];
  for (const [senderId, body, off] of msgs) {
    await prisma.message.create({ data: { conversationId: conv.id, senderId, body, createdAt: d(off), readAt: senderId === couple.id ? d(off + 1) : off < -2 ? d(off + 1) : null } });
  }
  const conv2 = await prisma.conversation.create({ data: { coupleId, vendorId: frame, lastMessageAt: d(-1) } });
  await prisma.message.create({ data: { conversationId: conv2.id, senderId: couple.id, body: "Do you have availability on our date?", createdAt: d(-1) } });

  await prisma.notification.createMany({
    data: [
      { userId: couple.id, type: "BOOKING_CONFIRMED", title: "Booking confirmed", message: "The Nile House confirmed your booking.", href: "/dashboard/bookings", createdAt: d(-34), read: true },
      { userId: couple.id, type: "BOOKING_CHANGES_REQUESTED", title: "Saffron & Salt requested changes", message: "Could we confirm the final guest count range and whether you need live stations?", href: "/dashboard/bookings", createdAt: d(-2) },
      { userId: couple.id, type: "NEW_MESSAGE", title: "New message from The Nile House", message: "Of course. Does the first week of next month work for you?", href: "/dashboard/messages", createdAt: d(-2) },
      { userId: couple.id, type: "RSVP_RECEIVED", title: "New RSVP", message: `${rsvpGuests[0].name} is coming.`, href: "/dashboard/guests", createdAt: d(-1) },
      { userId: vendorOwners[0], type: "BOOKING_REQUESTED", title: "New booking request", message: "A couple sent a booking request.", href: "/vendor/dashboard/bookings", createdAt: d(-1) },
      { userId: vendorOwners[0], type: "VENDOR_VERIFIED", title: "You're verified", message: "The WEDORA team verified your business.", href: "/vendor/dashboard", createdAt: d(-60), read: true },
    ],
  });

  for (let i = 0; i < BLOG.length; i++) {
    const p = BLOG[i];
    await prisma.blogPost.create({
      data: {
        slug: slugify(p.title).slice(0, 70),
        title: p.title,
        excerpt: p.excerpt,
        content: p.body,
        coverImage: img(p.cover, 1400),
        categoryId: blogCats.get(p.cat)!,
        published: true,
        publishedAt: d(-5 - i * 6),
      },
    });
  }

  await prisma.siteSetting.create({ data: { key: "general", value: { siteName: "WEDORA", supportEmail: "hello@wedora.example", maintenanceBanner: "" } } });

  console.log(`Seeded: ${VENDORS.length + 1} vendors, ${reviewCount} reviews, ${BLOG.length} blog posts.`);
  console.log(`Demo password for all accounts: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
