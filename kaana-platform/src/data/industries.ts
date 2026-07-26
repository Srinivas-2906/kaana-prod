export type IndustryId =
  | 'real-estate'
  | 'clinic'
  | 'coaching'
  | 'salon'
  | 'retail'
  | 'restaurant'
  | 'ecommerce'
  | 'professional'
  | 'fitness'
  | 'education'
  | 'home-services'
  | 'automotive';

export type IndustryCategory = 'property' | 'health' | 'retail' | 'services';

type TimedMessage = { text: string; out?: boolean; delay: string };
type InboxChat = { type: 'user' | 'bot' | 'agent' | 'system'; text: string; delay: string };
type ShowcaseBlock = { title: string; desc: string; bullets: string[] };

export type IndustryConfig = {
  id: IndustryId;
  name: string;
  tagline: string;
  businessName: string;
  botName: string;
  botAvatar: string;
  heroMessages: TimedMessage[];
  heroCard?: { title: string; subtitle: string; delay: string };
  heroCta?: string;
  botMessages: TimedMessage[];
  botCard?: { title: string; subtitle: string; delay: string };
  botQuick: string[];
  inboxThreads: {
    name: string;
    initial: string;
    preview: string;
    active?: boolean;
    unread?: number;
  }[];
  inboxChat: InboxChat[];
  crmColumns: {
    title: string;
    cards: { name: string; tag: string; score?: number }[];
  }[];
  miniSite: {
    brand: string;
    subtitle: string;
    filters: string[];
    items: { name: string; meta: string; price: string }[];
  };
  showcase: {
    bot: ShowcaseBlock;
    inbox: ShowcaseBlock;
    crm: ShowcaseBlock;
    minisite: ShowcaseBlock;
  };
};

export const DEFAULT_INDUSTRY: IndustryId = 'real-estate';

export const INDUSTRY_CATEGORY: Record<IndustryId, IndustryCategory> = {
  'real-estate': 'property',
  clinic: 'health',
  coaching: 'services',
  salon: 'retail',
  retail: 'retail',
  restaurant: 'retail',
  ecommerce: 'retail',
  professional: 'services',
  fitness: 'health',
  education: 'services',
  'home-services': 'services',
  automotive: 'services',
};

export const INDUSTRY_CATEGORIES: { id: IndustryCategory; label: string }[] = [
  { id: 'property', label: 'Property & real estate' },
  { id: 'health', label: 'Health & wellness' },
  { id: 'retail', label: 'Retail & hospitality' },
  { id: 'services', label: 'Services & education' },
];

export const CATEGORY_HUBS: {
  id: IndustryCategory;
  label: string;
  pitch: string;
}[] = [
  {
    id: 'property',
    label: 'Property',
    pitch: 'Listings, site visits, and buyer follow-ups on WhatsApp.',
  },
  {
    id: 'health',
    label: 'Health',
    pitch: 'Appointments, reminders, and patient enquiries handled automatically.',
  },
  {
    id: 'retail',
    label: 'Retail',
    pitch: 'Orders, bookings, menus, and product catalogues in chat.',
  },
  {
    id: 'services',
    label: 'Services',
    pitch: 'Leads, quotes, classes, and service requests in one flow.',
  },
];

export const INDUSTRY_SHORT: Partial<Record<IndustryId, string>> = {
  'real-estate': 'Real estate',
  clinic: 'Clinic',
  coaching: 'Coaching',
  salon: 'Salon',
  retail: 'Retail',
  restaurant: 'Restaurant',
  ecommerce: 'E-commerce',
  professional: 'Professional',
  fitness: 'Fitness',
  education: 'Education',
  'home-services': 'Home services',
  automotive: 'Automotive',
};

export const MORE_INDUSTRIES = [
  { name: 'Travel & Tours' },
  { name: 'Insurance' },
  { name: 'Events & Weddings' },
  { name: 'Photography' },
  { name: 'Pet Care' },
  { name: 'Logistics' },
  { name: 'Non-profits' },
  { name: 'Custom / Other' },
];

export const PLATFORM_CAPABILITIES = [
  {
    title: 'WhatsApp Business API',
    desc: 'Official WhatsApp connection with your business number.',
    status: 'live' as const,
    iconKey: 'whatsapp',
  },
  {
    title: 'Automatic replies & flows',
    desc: 'FAQ, booking, and qualification bots configured for your business.',
    status: 'live' as const,
    iconKey: 'bot',
  },
  {
    title: 'Shared team inbox',
    desc: 'Assign chats, reply together, and take over from the bot anytime.',
    status: 'live' as const,
    iconKey: 'inbox',
  },
  {
    title: 'CRM pipeline',
    desc: 'Track leads from first message to closed deal.',
    status: 'live' as const,
    iconKey: 'crm',
  },
  {
    title: 'Mini-site / catalog page',
    desc: 'Share one branded link with services, products, or listings.',
    status: 'live' as const,
    iconKey: 'web',
  },
  {
    title: 'Appointment reminders',
    desc: 'Automated follow-ups for bookings and site visits.',
    status: 'live' as const,
    iconKey: 'reminder',
  },
  {
    title: 'Broadcast campaigns',
    desc: 'Template messages to opted-in customer lists.',
    status: 'soon' as const,
    iconKey: 'broadcast',
  },
  {
    title: 'Payments in chat',
    desc: 'Collect deposits and order payments inside WhatsApp.',
    status: 'soon' as const,
    iconKey: 'payment',
  },
  {
    title: 'Analytics dashboard',
    desc: 'Response times, conversion, and agent performance.',
    status: 'soon' as const,
    iconKey: 'analytics',
  },
  {
    title: 'AI-assisted replies',
    desc: 'Suggested answers trained on your business context.',
    status: 'soon' as const,
    iconKey: 'ai',
  },
];

export const PLATFORM_ROADMAP = [
  {
    title: 'Instagram DM inbox',
    desc: 'Route Instagram messages into the same Kaana inbox and CRM.',
    audience: 'brands, salons, and local businesses',
    iconKey: 'instagram',
    status: 'soon' as const,
  },
  {
    title: 'QR table ordering',
    desc: 'Restaurant QR menus that sync orders back to WhatsApp.',
    audience: 'restaurants and cafés',
    iconKey: 'ordering',
    status: 'soon' as const,
  },
  {
    title: 'Website chat widget',
    desc: 'Embed chat on your site and continue on WhatsApp.',
    audience: 'any business with a website',
    iconKey: 'webchat',
    status: 'soon' as const,
  },
];

function baseShowcase(name: string): IndustryConfig['showcase'] {
  return {
    bot: {
      title: `${name} enquiries answered instantly`,
      desc: 'Customers get pricing, availability, and next steps without waiting.',
      bullets: ['24/7 automatic replies', 'Booking & qualification flows', 'Rich cards in chat'],
    },
    inbox: {
      title: 'Your team picks up in one inbox',
      desc: 'Stop juggling one phone between staff members.',
      bullets: ['Assign conversations', 'Full chat history', 'Handoff from bot to agent'],
    },
    crm: {
      title: 'Every lead tracked in CRM',
      desc: 'Nothing gets lost in WhatsApp chat history.',
      bullets: ['Pipeline stages', 'Follow-up reminders', 'Synced from inbox'],
    },
    minisite: {
      title: 'Share a branded mini-site',
      desc: 'One link for your catalog, menu, or service list.',
      bullets: ['Mobile-first page', 'WhatsApp button on every item', 'Send in chat or ads'],
    },
  };
}

function baseInbox(customer: string, initial: string, preview: string): IndustryConfig['inboxThreads'] {
  return [
    { name: customer, initial, preview, active: true, unread: 2 },
    { name: 'Walk-in lead', initial: 'W', preview: 'Is this available today?' },
    { name: 'Returning client', initial: 'R', preview: 'Thanks — confirmed' },
  ];
}

function baseCrm(customer: string, tag: string): IndustryConfig['crmColumns'] {
  return [
    {
      title: 'New',
      cards: [{ name: 'Website form', tag: 'Imported · 2h ago' }],
    },
    {
      title: 'Contacted',
      cards: [{ name: customer, tag }],
    },
    {
      title: 'Qualified',
      cards: [{ name: customer, tag: 'Ready to book', score: 78 }],
    },
  ];
}

const INDUSTRY_DEFINITIONS: IndustryConfig[] = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    tagline: 'Qualify buyers, share listings, and book site visits on WhatsApp.',
    businessName: 'Coastal Realty',
    botName: 'Coastal Assistant',
    botAvatar: '🏠',
    heroMessages: [
      { text: 'Hi, I saw your 3BHK listing in Madhapur. Is it still available?', out: true, delay: '0.2s' },
      { text: 'Yes — still available. Want photos, price, or a site visit?', delay: '0.8s' },
    ],
    heroCard: { title: 'Skyline Residency · 3BHK', subtitle: '₹1.2 Cr · Ready to move', delay: '1.4s' },
    heroCta: 'Book visit',
    botMessages: [
      { text: 'Welcome to Coastal Realty 👋 How can we help?', delay: '0.2s' },
      { text: 'Looking for a 2BHK near the metro', out: true, delay: '0.9s' },
      { text: 'Great — I can share 3 matching listings. Budget range?', delay: '1.5s' },
    ],
    botCard: { title: 'Lakeview Heights · 2BHK', subtitle: '₹85L · Gachibowli', delay: '2.2s' },
    botQuick: ['See listings', 'Book visit', 'Talk to agent'],
    inboxThreads: baseInbox('Ananya Rao', 'A', 'Can we visit Saturday?'),
    inboxChat: [
      { type: 'user', text: 'Can we visit Saturday morning?', delay: '0.3s' },
      { type: 'bot', text: 'Saturday 10 AM works. Connecting you with our agent.', delay: '1s' },
      { type: 'agent', text: "Hi Ananya — I'll confirm the slot and send directions.", delay: '2.2s' },
    ],
    crmColumns: baseCrm('Ananya Rao', '3BHK · Madhapur'),
    miniSite: {
      brand: 'Coastal Realty',
      subtitle: 'Premium homes in Hyderabad',
      filters: ['2 BHK', '3 BHK', 'Gachibowli'],
      items: [
        { name: 'Skyline Residency', meta: '3 BHK · 1,650 sqft', price: '₹1.2 Cr' },
        { name: 'Lakeview Heights', meta: '2 BHK · 1,180 sqft', price: '₹85 L' },
        { name: 'Green Park Villas', meta: '4 BHK · 2,400 sqft', price: '₹2.1 Cr' },
      ],
    },
    showcase: baseShowcase('Real estate'),
  },
  {
    id: 'clinic',
    name: 'Clinic & Healthcare',
    tagline: 'Book appointments, answer FAQs, and route patients to your team.',
    businessName: 'Green Leaf Clinic',
    botName: 'Green Leaf Care',
    botAvatar: '🩺',
    heroMessages: [
      { text: 'Hi, I need a dental check-up this week.', out: true, delay: '0.2s' },
      { text: 'Sure — we have slots Wed 4 PM and Fri 11 AM. Which works?', delay: '0.8s' },
    ],
    heroCard: { title: 'Dental check-up', subtitle: 'From ₹800 · 30 min', delay: '1.4s' },
    heroCta: 'Book slot',
    botMessages: [
      { text: 'Welcome to Green Leaf Clinic. How can we help today?', delay: '0.2s' },
      { text: 'Do you have evening appointments?', out: true, delay: '0.9s' },
      { text: 'Yes — today 6:30 PM and tomorrow 7 PM are open.', delay: '1.5s' },
    ],
    botQuick: ['Book appointment', 'Clinic timings', 'Talk to staff'],
    inboxThreads: baseInbox('Priya Menon', 'P', 'Confirming Wed 4 PM'),
    inboxChat: [
      { type: 'user', text: 'Can I reschedule to Friday?', delay: '0.3s' },
      { type: 'bot', text: 'Friday 11 AM is available. Shall I book it?', delay: '1s' },
      { type: 'agent', text: 'Done — Friday 11 AM is confirmed. See you then.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Priya Menon', 'Dental · follow-up'),
    miniSite: {
      brand: 'Green Leaf Clinic',
      subtitle: 'Family dental & general care',
      filters: ['Dental', 'General', 'Pediatric'],
      items: [
        { name: 'Dental check-up', meta: '30 min · Dr. Rao', price: 'From ₹800' },
        { name: 'Cleaning & polish', meta: '45 min', price: 'From ₹1,500' },
        { name: 'Consultation', meta: '20 min', price: 'From ₹500' },
      ],
    },
    showcase: baseShowcase('Clinic'),
  },
  {
    id: 'coaching',
    name: 'Coaching & Training',
    tagline: 'Capture course enquiries, share batches, and nurture leads.',
    businessName: 'Apex Coaching',
    botName: 'Apex Guide',
    botAvatar: '🎓',
    heroMessages: [
      { text: 'Hi, do you have a weekend IELTS batch?', out: true, delay: '0.2s' },
      { text: 'Yes — next batch starts Sat 9 AM. Want syllabus and fees?', delay: '0.8s' },
    ],
    heroCard: { title: 'IELTS Weekend Batch', subtitle: '6 weeks · Hybrid', delay: '1.4s' },
    heroCta: 'View batch',
    botMessages: [
      { text: 'Hi! Looking for a course or demo class?', delay: '0.2s' },
      { text: 'IELTS preparation please', out: true, delay: '0.9s' },
      { text: 'We have weekday and weekend batches. Which do you prefer?', delay: '1.5s' },
    ],
    botQuick: ['Course fees', 'Book demo', 'Talk to counsellor'],
    inboxThreads: baseInbox('Rahul K.', 'R', 'Interested in weekend batch'),
    inboxChat: [
      { type: 'user', text: 'Can I attend a trial class?', delay: '0.3s' },
      { type: 'bot', text: 'Trial class is free this Saturday at 11 AM.', delay: '1s' },
      { type: 'agent', text: "I'll send the Zoom link and syllabus on WhatsApp.", delay: '2.2s' },
    ],
    crmColumns: baseCrm('Rahul K.', 'IELTS · trial booked'),
    miniSite: {
      brand: 'Apex Coaching',
      subtitle: 'Test prep & skill programs',
      filters: ['IELTS', 'Coding', 'MBA'],
      items: [
        { name: 'IELTS Weekend', meta: '6 weeks · Sat–Sun', price: '₹18,000' },
        { name: 'Python Bootcamp', meta: '8 weeks · Online', price: '₹24,000' },
        { name: 'MBA Mentorship', meta: '1:1 · 12 sessions', price: '₹35,000' },
      ],
    },
    showcase: baseShowcase('Coaching'),
  },
  {
    id: 'salon',
    name: 'Salon & Beauty',
    tagline: 'Book slots, share services, and reduce no-shows with reminders.',
    businessName: 'City Style Salon',
    botName: 'City Style',
    botAvatar: '💇',
    heroMessages: [
      { text: 'Hi, can I book a haircut and facial for tomorrow?', out: true, delay: '0.2s' },
      { text: 'Tomorrow 3 PM is open with Priya. Shall I confirm?', delay: '0.8s' },
    ],
    heroCard: { title: 'Haircut + Facial', subtitle: '90 min · ₹1,800', delay: '1.4s' },
    heroCta: 'Confirm booking',
    botMessages: [
      { text: 'Welcome to City Style 💫 Pick a service or stylist.', delay: '0.2s' },
      { text: 'Bridal makeup consultation', out: true, delay: '0.9s' },
      { text: 'Bridal consults are ₹500 (adjusted if you book). Free slots Thu & Sat.', delay: '1.5s' },
    ],
    botQuick: ['Book slot', 'Service menu', 'Talk to stylist'],
    inboxThreads: baseInbox('Neha S.', 'N', 'Bridal package enquiry'),
    inboxChat: [
      { type: 'user', text: 'Do you travel for bridal makeup?', delay: '0.3s' },
      { type: 'bot', text: 'Yes — on-site bridal starts at ₹25,000.', delay: '1s' },
      { type: 'agent', text: 'Sharing our bridal lookbook and available dates now.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Neha S.', 'Bridal · consult'),
    miniSite: {
      brand: 'City Style Salon',
      subtitle: 'Hair, skin & bridal services',
      filters: ['Hair', 'Skin', 'Bridal'],
      items: [
        { name: 'Haircut & style', meta: '45 min', price: 'From ₹600' },
        { name: 'Classic facial', meta: '60 min', price: 'From ₹1,200' },
        { name: 'Bridal package', meta: 'On-site', price: 'From ₹25,000' },
      ],
    },
    showcase: baseShowcase('Salon'),
  },
  {
    id: 'retail',
    name: 'Retail Store',
    tagline: 'Share product availability, take orders, and follow up on WhatsApp.',
    businessName: 'Urban Outfitters VZG',
    botName: 'Urban Store',
    botAvatar: '🛍️',
    heroMessages: [
      { text: 'Do you have the blue kurta in size M?', out: true, delay: '0.2s' },
      { text: 'Yes — 3 in stock at MVP branch. Want to reserve or deliver?', delay: '0.8s' },
    ],
    heroCard: { title: 'Floral Kurta · Blue', subtitle: 'Size M · ₹1,499', delay: '1.4s' },
    heroCta: 'Reserve item',
    botMessages: [
      { text: 'Hi! Browse new arrivals or check store timings.', delay: '0.2s' },
      { text: 'Any offers on ethnic wear?', out: true, delay: '0.9s' },
      { text: 'Flat 20% off this weekend. I can share the lookbook.', delay: '1.5s' },
    ],
    botQuick: ['Check stock', 'Store location', 'Talk to staff'],
    inboxThreads: baseInbox('Kavya D.', 'K', 'Reserve blue kurta M'),
    inboxChat: [
      { type: 'user', text: 'Please hold one till evening.', delay: '0.3s' },
      { type: 'bot', text: 'Reserved till 7 PM at MVP branch.', delay: '1s' },
      { type: 'agent', text: 'Your item is at the counter — ask for Kavya.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Kavya D.', 'Retail · reservation'),
    miniSite: {
      brand: 'Urban Outfitters',
      subtitle: 'New season collection',
      filters: ['Ethnic', 'Casual', 'Sale'],
      items: [
        { name: 'Floral Kurta', meta: 'Cotton · Blue', price: '₹1,499' },
        { name: 'Linen shirt', meta: 'Beige · M–XL', price: '₹1,899' },
        { name: 'Festive set', meta: 'Limited edit', price: '₹3,499' },
      ],
    },
    showcase: baseShowcase('Retail'),
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Café',
    tagline: 'Take table bookings, share menus, and confirm orders on WhatsApp.',
    businessName: 'Spice Route Kitchen',
    botName: 'Spice Route',
    botAvatar: '🍽️',
    heroMessages: [
      { text: 'Table for 4 tonight around 8 PM?', out: true, delay: '0.2s' },
      { text: '8:15 PM is available. Want the chef’s tasting menu?', delay: '0.8s' },
    ],
    heroCard: { title: 'Table for 4', subtitle: 'Tonight · 8:15 PM', delay: '1.4s' },
    heroCta: 'Confirm table',
    botMessages: [
      { text: 'Welcome to Spice Route 🌶️ Dine-in, takeaway, or menu?', delay: '0.2s' },
      { text: 'Vegetarian thali for 2', out: true, delay: '0.9s' },
      { text: 'Thali for 2 is ₹799. Pickup in 25 min or delivery?', delay: '1.5s' },
    ],
    botQuick: ['Book table', 'View menu', 'Track order'],
    inboxThreads: baseInbox('Arjun M.', 'A', 'Table 4 · 8:15 PM'),
    inboxChat: [
      { type: 'user', text: 'Any outdoor seating?', delay: '0.3s' },
      { type: 'bot', text: 'Yes — terrace table reserved for you.', delay: '1s' },
      { type: 'agent', text: 'See you at 8:15 — terrace section, table 12.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Arjun M.', 'Dine-in · party of 4'),
    miniSite: {
      brand: 'Spice Route Kitchen',
      subtitle: 'Coastal Indian cuisine',
      filters: ['Starters', 'Thali', 'Desserts'],
      items: [
        { name: 'Chef thali', meta: 'Veg · 2 persons', price: '₹799' },
        { name: 'Coastal platter', meta: 'Seafood · sharing', price: '₹1,450' },
        { name: 'Filter coffee', meta: 'Dessert combo', price: '₹249' },
      ],
    },
    showcase: baseShowcase('Restaurant'),
  },
  {
    id: 'ecommerce',
    name: 'E-commerce & D2C',
    tagline: 'Recover carts, answer product questions, and close sales in chat.',
    businessName: 'PureGlow Skincare',
    botName: 'PureGlow Shop',
    botAvatar: '✨',
    heroMessages: [
      { text: 'Is the vitamin C serum safe for sensitive skin?', out: true, delay: '0.2s' },
      { text: 'Yes — fragrance-free and dermatologist tested. Want ingredients?', delay: '0.8s' },
    ],
    heroCard: { title: 'Vitamin C Serum', subtitle: '30 ml · ₹899', delay: '1.4s' },
    heroCta: 'Buy on WhatsApp',
    botMessages: [
      { text: 'Hi! Need help choosing a product or tracking an order?', delay: '0.2s' },
      { text: 'Order #PG-4821 status?', out: true, delay: '0.9s' },
      { text: 'Shipped today — delivery by Thu. Tracking link sent.', delay: '1.5s' },
    ],
    botQuick: ['Track order', 'Shop bestsellers', 'Talk to support'],
    inboxThreads: baseInbox('Sneha P.', 'S', 'Serum for sensitive skin'),
    inboxChat: [
      { type: 'user', text: 'Any discount on first order?', delay: '0.3s' },
      { type: 'bot', text: 'Use WELCOME10 for 10% off your first cart.', delay: '1s' },
      { type: 'agent', text: 'Applied WELCOME10 — checkout link sent.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Sneha P.', 'D2C · first order'),
    miniSite: {
      brand: 'PureGlow Skincare',
      subtitle: 'Clean beauty, shipped nationwide',
      filters: ['Serums', 'Sunscreen', 'Bundles'],
      items: [
        { name: 'Vitamin C Serum', meta: '30 ml · sensitive safe', price: '₹899' },
        { name: 'SPF 50 gel', meta: '50 ml · matte finish', price: '₹749' },
        { name: 'Glow duo bundle', meta: 'Serum + SPF', price: '₹1,499' },
      ],
    },
    showcase: baseShowcase('E-commerce'),
  },
  {
    id: 'professional',
    name: 'Professional Services',
    tagline: 'Qualify leads, share proposals, and schedule consultations.',
    businessName: 'Northstar Consultants',
    botName: 'Northstar Desk',
    botAvatar: '💼',
    heroMessages: [
      { text: 'We need GST registration for a new LLP.', out: true, delay: '0.2s' },
      { text: 'We handle LLP GST end-to-end. Want a quote and timeline?', delay: '0.8s' },
    ],
    heroCard: { title: 'GST registration', subtitle: 'LLP · 7–10 business days', delay: '1.4s' },
    heroCta: 'Get quote',
    botMessages: [
      { text: 'Hello — tell us what you need help with.', delay: '0.2s' },
      { text: 'Company incorporation + compliance', out: true, delay: '0.9s' },
      { text: 'We offer incorporation, GST, and monthly filings. Which stage are you at?', delay: '1.5s' },
    ],
    botQuick: ['Get quote', 'Book consult', 'Talk to advisor'],
    inboxThreads: baseInbox('Vikram & Co.', 'V', 'GST quote requested'),
    inboxChat: [
      { type: 'user', text: 'Can we meet tomorrow?', delay: '0.3s' },
      { type: 'bot', text: 'Consult slots tomorrow at 11 AM and 4 PM.', delay: '1s' },
      { type: 'agent', text: '4 PM works — Google Meet link sent.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Vikram & Co.', 'Compliance · quote'),
    miniSite: {
      brand: 'Northstar Consultants',
      subtitle: 'Business setup & compliance',
      filters: ['Incorporation', 'GST', 'Accounting'],
      items: [
        { name: 'LLP incorporation', meta: 'Docs + filing', price: 'From ₹12,000' },
        { name: 'GST registration', meta: '7–10 days', price: 'From ₹4,500' },
        { name: 'Monthly compliance', meta: 'Retainer', price: 'From ₹8,000/mo' },
      ],
    },
    showcase: baseShowcase('Professional services'),
  },
  {
    id: 'fitness',
    name: 'Fitness & Gym',
    tagline: 'Sell memberships, book trials, and follow up on leads.',
    businessName: 'IronPulse Fitness',
    botName: 'IronPulse',
    botAvatar: '💪',
    heroMessages: [
      { text: 'Do you have a trial session for weight training?', out: true, delay: '0.2s' },
      { text: 'Yes — free trial + body assessment. Tomorrow 7 AM or 6 PM?', delay: '0.8s' },
    ],
    heroCard: { title: 'Free trial session', subtitle: '45 min · with trainer', delay: '1.4s' },
    heroCta: 'Book trial',
    botMessages: [
      { text: 'Ready to start? Pick membership, trial, or class schedule.', delay: '0.2s' },
      { text: 'Monthly membership price?', out: true, delay: '0.9s' },
      { text: 'Monthly plans from ₹2,499. I can share benefits and timings.', delay: '1.5s' },
    ],
    botQuick: ['Book trial', 'Membership plans', 'Talk to trainer'],
    inboxThreads: baseInbox('Dev P.', 'D', 'Trial booked · 6 PM'),
    inboxChat: [
      { type: 'user', text: 'Is personal training included?', delay: '0.3s' },
      { type: 'bot', text: 'PT is add-on from ₹6,000/month. Trial includes 1 intro PT.', delay: '1s' },
      { type: 'agent', text: 'Trainer Arjun will meet you at reception at 6 PM.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Dev P.', 'Fitness · trial'),
    miniSite: {
      brand: 'IronPulse Fitness',
      subtitle: 'Strength, cardio & PT',
      filters: ['Membership', 'PT', 'Classes'],
      items: [
        { name: 'Monthly access', meta: 'Gym + locker', price: '₹2,499/mo' },
        { name: 'PT starter', meta: '8 sessions', price: '₹6,000' },
        { name: 'HIIT class pack', meta: '12 classes', price: '₹3,200' },
      ],
    },
    showcase: baseShowcase('Fitness'),
  },
  {
    id: 'education',
    name: 'Education & Schools',
    tagline: 'Handle admissions, share programs, and answer parent queries.',
    businessName: 'BrightPath Academy',
    botName: 'BrightPath',
    botAvatar: '📚',
    heroMessages: [
      { text: 'Admission open for Grade 6?', out: true, delay: '0.2s' },
      { text: 'Yes — few seats left. Want fee structure and campus visit slots?', delay: '0.8s' },
    ],
    heroCard: { title: 'Grade 6 admission', subtitle: '2026–27 · Limited seats', delay: '1.4s' },
    heroCta: 'Book visit',
    botMessages: [
      { text: 'Welcome to BrightPath Academy. Admissions or transport info?', delay: '0.2s' },
      { text: 'School timings and bus routes?', out: true, delay: '0.9s' },
      { text: 'School 8:30–3:30. Bus routes cover MVP, Gajuwaka, and NAD.', delay: '1.5s' },
    ],
    botQuick: ['Admissions', 'Campus visit', 'Talk to office'],
    inboxThreads: baseInbox('Lakshmi R.', 'L', 'Grade 6 admission'),
    inboxChat: [
      { type: 'user', text: 'Can we visit Saturday?', delay: '0.3s' },
      { type: 'bot', text: 'Campus tours Sat 10 AM and 12 PM.', delay: '1s' },
      { type: 'agent', text: '12 PM slot confirmed — gate pass sent.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Lakshmi R.', 'Admission · Grade 6'),
    miniSite: {
      brand: 'BrightPath Academy',
      subtitle: 'CBSE · Grades 1–10',
      filters: ['Admissions', 'Transport', 'Activities'],
      items: [
        { name: 'Grade 6 seat', meta: '2026–27 batch', price: 'Fee on request' },
        { name: 'STEM club', meta: 'Grades 5–8', price: 'Included' },
        { name: 'Campus tour', meta: 'Sat slots', price: 'Free' },
      ],
    },
    showcase: baseShowcase('Education'),
  },
  {
    id: 'home-services',
    name: 'Home Services',
    tagline: 'Quote jobs, schedule visits, and dispatch technicians via WhatsApp.',
    businessName: 'FixIt Home Services',
    botName: 'FixIt Desk',
    botAvatar: '🔧',
    heroMessages: [
      { text: 'Need AC service for 2 units this weekend.', out: true, delay: '0.2s' },
      { text: 'Saturday slots available. Deep clean or general service?', delay: '0.8s' },
    ],
    heroCard: { title: 'AC service · 2 units', subtitle: 'Sat · 10 AM–1 PM', delay: '1.4s' },
    heroCta: 'Book visit',
    botMessages: [
      { text: 'Hi! AC, plumbing, or electrical — what do you need?', delay: '0.2s' },
      { text: 'Water leakage in kitchen', out: true, delay: '0.9s' },
      { text: 'Plumber can visit today 4–6 PM. Standard visit from ₹499.', delay: '1.5s' },
    ],
    botQuick: ['Book visit', 'Get estimate', 'Talk to dispatcher'],
    inboxThreads: baseInbox('Suresh K.', 'S', 'AC service · Sat AM'),
    inboxChat: [
      { type: 'user', text: 'Technician will bring spare parts?', delay: '0.3s' },
      { type: 'bot', text: 'Yes — common parts on the van. Major parts quoted first.', delay: '1s' },
      { type: 'agent', text: 'Technician Raju assigned — ETA 10:15 AM.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Suresh K.', 'Home service · AC'),
    miniSite: {
      brand: 'FixIt Home Services',
      subtitle: 'AC, plumbing & electrical',
      filters: ['AC', 'Plumbing', 'Electrical'],
      items: [
        { name: 'AC general service', meta: 'Per unit', price: 'From ₹699' },
        { name: 'Plumbing visit', meta: '60 min', price: 'From ₹499' },
        { name: 'Electrical check', meta: 'Home safety', price: 'From ₹599' },
      ],
    },
    showcase: baseShowcase('Home services'),
  },
  {
    id: 'automotive',
    name: 'Automotive & Garage',
    tagline: 'Book service slots, share estimates, and follow up on repairs.',
    businessName: 'AutoCare Garage',
    botName: 'AutoCare',
    botAvatar: '🚗',
    heroMessages: [
      { text: 'Need a full service for my Creta — 40k km.', out: true, delay: '0.2s' },
      { text: '40k service is ₹6,500 incl. oil & filter. Tomorrow 9 AM ok?', delay: '0.8s' },
    ],
    heroCard: { title: 'Creta · 40k service', subtitle: 'Est. 4 hours', delay: '1.4s' },
    heroCta: 'Book service',
    botMessages: [
      { text: 'Welcome to AutoCare — service, repair, or pickup?', delay: '0.2s' },
      { text: 'Brake noise when stopping', out: true, delay: '0.9s' },
      { text: 'Could be pads or rotors. Free inspection today 3 PM?', delay: '1.5s' },
    ],
    botQuick: ['Book service', 'Get estimate', 'Talk to advisor'],
    inboxThreads: baseInbox('Manoj T.', 'M', 'Creta service · tomorrow'),
    inboxChat: [
      { type: 'user', text: 'Do you offer pickup?', delay: '0.3s' },
      { type: 'bot', text: 'Pickup & drop within 8 km — ₹199 each way.', delay: '1s' },
      { type: 'agent', text: 'Pickup scheduled 8:30 AM. Driver will call 15 min before.', delay: '2.2s' },
    ],
    crmColumns: baseCrm('Manoj T.', 'Automotive · 40k service'),
    miniSite: {
      brand: 'AutoCare Garage',
      subtitle: 'Multi-brand service centre',
      filters: ['Periodic', 'Repair', 'Detailing'],
      items: [
        { name: 'Periodic service', meta: 'OEM parts option', price: 'From ₹3,999' },
        { name: 'Brake inspection', meta: 'Free with service', price: 'Free' },
        { name: 'Interior detailing', meta: '4–5 hours', price: 'From ₹2,499' },
      ],
    },
    showcase: baseShowcase('Automotive'),
  },
];

export const INDUSTRIES: IndustryConfig[] = INDUSTRY_DEFINITIONS;

export const INDUSTRY_MAP: Record<IndustryId, IndustryConfig> = Object.fromEntries(
  INDUSTRIES.map((industry) => [industry.id, industry]),
) as Record<IndustryId, IndustryConfig>;

export function getIndustry(id: IndustryId): IndustryConfig {
  return INDUSTRY_MAP[id] ?? INDUSTRY_MAP[DEFAULT_INDUSTRY];
}

export function getIndustriesByCategory(category: IndustryCategory): IndustryConfig[] {
  return INDUSTRIES.filter((industry) => INDUSTRY_CATEGORY[industry.id] === category);
}
