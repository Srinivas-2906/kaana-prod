/** Same conversation script as botiq/src/data/mockData.ts */

export const propertyCards = [
  {
    id: 'p1',
    title: 'Prestige Skyline',
    location: 'Banjara Hills · 3BHK',
    price: '₹85L',
    sqft: '1,450 sqft',
    status: 'Ready to move',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  },
  {
    id: 'p2',
    title: 'Aparna Serene',
    location: 'Gachibowli · 3BHK',
    price: '₹92L',
    sqft: '1,380 sqft',
    status: 'Dec 2025',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  },
  {
    id: 'p3',
    title: 'My Home Jewel',
    location: 'Kondapur · 3BHK',
    price: '₹78L',
    sqft: '1,290 sqft',
    status: 'Ready to move',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  },
];

export const demoFlow = [
  {
    kind: 'bot',
    text: "Hi! 👋 Welcome to Prestige Properties. I'm PropBot, your AI assistant. How can I help you today?",
  },
  {
    kind: 'quickReplies',
    options: ['🏠 Browse properties', '📅 Book site visit', '💰 Check pricing', '📞 Talk to agent'],
  },
  { kind: 'user', text: '🏠 Browse properties' },
  { kind: 'bot', text: 'Great! What type of property are you looking for?' },
  {
    kind: 'quickReplies',
    options: ['2BHK Apartment', '3BHK Apartment', 'Villa', 'Commercial'],
  },
  { kind: 'user', text: '3BHK Apartment' },
  { kind: 'bot', text: "Perfect. What's your budget range?" },
  {
    kind: 'quickReplies',
    options: ['₹50L - ₹75L', '₹75L - ₹1Cr', '₹1Cr - ₹1.5Cr', 'Above ₹1.5Cr'],
  },
  { kind: 'user', text: '₹75L - ₹1Cr' },
  { kind: 'bot', text: 'I found 3 properties matching your criteria! 🎉' },
  { kind: 'propertyCards', cards: propertyCards },
  {
    kind: 'quickReplies',
    options: [
      'Book visit — Prestige Skyline',
      'Book visit — Aparna Serene',
      'Book visit — My Home Jewel',
    ],
    text: 'Which property would you like to visit?',
  },
  { kind: 'user', text: 'Book visit — Prestige Skyline' },
  {
    kind: 'bot',
    text: "Awesome choice! Let me book a site visit for Prestige Skyline. What's your preferred date?",
  },
  {
    kind: 'quickReplies',
    options: ['Tomorrow', 'This Saturday', 'This Sunday', 'Pick a date'],
  },
  { kind: 'user', text: 'This Saturday' },
  { kind: 'bot', text: 'What time works best for you?' },
  {
    kind: 'quickReplies',
    options: ['10:00 AM', '11:00 AM', '12:00 PM', '3:00 PM'],
  },
  { kind: 'user', text: '11:00 AM' },
  {
    kind: 'bot',
    text: 'Almost done! May I have your name and phone number to confirm the booking?',
  },
  { kind: 'user', text: 'Rahul Sharma, 98400 12345' },
  {
    kind: 'bot',
    text: '✅ Site visit confirmed!\n📍 Prestige Skyline, Banjara Hills\n📅 This Saturday, 11:00 AM\n👤 Agent Priya will meet you there\n\nYou\'ll receive a confirmation on WhatsApp shortly. Is there anything else I can help you with?',
  },
  {
    kind: 'finalButtons',
    options: ['Browse more', 'Talk to agent', 'Done'],
  },
];
