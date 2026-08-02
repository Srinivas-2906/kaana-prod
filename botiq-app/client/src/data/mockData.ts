import type { BotItem, Conversation, FlowStep, PropertyCard } from '../types';

export const propertyCards: PropertyCard[] = [
  {
    id: 'p1',
    title: 'Prestige Skyline',
    location: 'Banjara Hills · 3BHK',
    price: '₹85L',
    sqft: '1,450 sqft',
    status: 'Ready to move',
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'p2',
    title: 'Aparna Serene',
    location: 'Gachibowli · 3BHK',
    price: '₹92L',
    sqft: '1,380 sqft',
    status: 'Dec 2025',
    image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 'p3',
    title: 'My Home Jewel',
    location: 'Kondapur · 3BHK',
    price: '₹78L',
    sqft: '1,290 sqft',
    status: 'Ready to move',
    image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
];

export const demoFlow: FlowStep[] = [
  {
    kind: 'bot',
    text: "Hi! 👋 Thanks for reaching out. How can I help you today?",
  },
  {
    kind: 'quickReplies',
    options: ['📅 Book appointment', '💬 Ask a question', '📞 Talk to team'],
    autoSelect: 0,
  },
  { kind: 'user', text: '📅 Book appointment' },
  { kind: 'bot', text: 'Happy to help! What date works for you?' },
  {
    kind: 'quickReplies',
    options: ['Today', 'Tomorrow', 'This week', 'Pick a date'],
    autoSelect: 1,
  },
  { kind: 'user', text: 'Tomorrow' },
  { kind: 'bot', text: 'What time suits you best?' },
  {
    kind: 'quickReplies',
    options: ['10:00 AM', '12:00 PM', '3:00 PM', '5:00 PM'],
    autoSelect: 0,
  },
  { kind: 'user', text: '10:00 AM' },
  {
    kind: 'bot',
    text: 'Great! May I have your name and phone number to confirm?',
  },
  { kind: 'user', text: 'Rahul, 98400 12345' },
  {
    kind: 'bot',
    text: '✅ Booking request received!\nWe will confirm shortly on WhatsApp.\n\nIs there anything else I can help with?',
  },
  {
    kind: 'finalButtons',
    options: ['Done', 'Ask another question'],
  },
];

const rahulMessages = [
  { id: 'm1', role: 'bot' as const, text: "Hi! 👋 Welcome to Prestige Properties. I'm PropBot, your AI assistant. How can I help you today?", timestamp: '10:02 AM' },
  { id: 'm2', role: 'user' as const, text: '🏠 Browse properties', timestamp: '10:02 AM' },
  { id: 'm3', role: 'bot' as const, text: 'Great! What type of property are you looking for?', timestamp: '10:02 AM' },
  { id: 'm4', role: 'user' as const, text: '3BHK Apartment', timestamp: '10:03 AM' },
  { id: 'm5', role: 'bot' as const, text: "Perfect. What's your budget range?", timestamp: '10:03 AM' },
  { id: 'm6', role: 'user' as const, text: '₹75L - ₹1Cr', timestamp: '10:03 AM' },
  { id: 'm7', role: 'bot' as const, text: 'I found 3 properties matching your criteria! 🎉', timestamp: '10:04 AM', propertyCards },
  { id: 'm8', role: 'user' as const, text: 'Book visit — Prestige Skyline', timestamp: '10:05 AM' },
  { id: 'm9', role: 'bot' as const, text: "Awesome choice! Let me book a site visit for Prestige Skyline. What's your preferred date?", timestamp: '10:05 AM' },
  { id: 'm10', role: 'user' as const, text: 'This Saturday', timestamp: '10:05 AM' },
  { id: 'm11', role: 'bot' as const, text: 'What time works best for you?', timestamp: '10:06 AM' },
  { id: 'm12', role: 'user' as const, text: '11:00 AM', timestamp: '10:06 AM' },
  { id: 'm13', role: 'bot' as const, text: 'Almost done! May I have your name and phone number to confirm the booking?', timestamp: '10:06 AM' },
  { id: 'm14', role: 'user' as const, text: 'Rahul Sharma, 98400 12345', timestamp: '10:07 AM' },
  {
    id: 'm15',
    role: 'bot' as const,
    text: '✅ Site visit confirmed!\n📍 Prestige Skyline, Banjara Hills\n📅 This Saturday, 11:00 AM\n👤 Agent Priya will meet you there\n\nYou\'ll receive a confirmation on WhatsApp shortly. Is there anything else I can help you with?',
    timestamp: '10:07 AM',
    actionButtons: ['Browse more', 'Talk to agent', 'Done'],
  },
];

export const conversations: Conversation[] = [
  {
    id: 'c1', name: 'Rahul Sharma', phone: '+91 98400 12345', channel: 'whatsapp',
    preview: 'Site visit confirmed for Saturday', time: '2m', status: 'resolved',
    messages: rahulMessages,
    lead: { intent: '3BHK · ₹75-1Cr', stage: 'Site visit booked', confidence: 94 },
    stats: { messages: 14, resolution: 'Automated ✓', timeToBook: '4 minutes' },
  },
  {
    id: 'c2', name: 'Priya Menon', phone: '+91 97001 44556', channel: 'web',
    preview: 'Looking for 2BHK under 60L', time: '5m', unread: 2, status: 'bot',
    messages: [
      { id: 'p1', role: 'bot', text: "Hi Priya! I'm PropBot. What property type interests you?", timestamp: '9:58 AM' },
      { id: 'p2', role: 'user', text: 'Looking for 2BHK under 60L in Gachibowli', timestamp: '9:59 AM' },
      { id: 'p3', role: 'bot', text: 'I found 2 options in your budget. Would you like to see floor plans?', timestamp: '9:59 AM' },
    ],
    lead: { intent: '2BHK · Under ₹60L', stage: 'Browsing listings', confidence: 88 },
    stats: { messages: 6, resolution: 'In progress', timeToBook: '—' },
  },
  {
    id: 'c3', name: 'Anil Kumar', phone: '+91 90000 77821', channel: 'whatsapp',
    preview: 'What are the payment options?', time: '12m', unread: 1, status: 'agent',
    messages: [
      { id: 'a1', role: 'bot', text: 'Hello Anil! How can I help with Prestige Properties today?', timestamp: '9:50 AM' },
      { id: 'a2', role: 'user', text: 'What are the payment options for Skyline project?', timestamp: '9:51 AM' },
      { id: 'a3', role: 'bot', text: 'We offer construction-linked plans, 20-80, and full payment discounts. Connecting you to our finance team…', timestamp: '9:52 AM' },
    ],
    lead: { intent: 'Payment inquiry', stage: 'Needs agent', confidence: 72 },
    stats: { messages: 8, resolution: 'Escalated', timeToBook: '—' },
  },
  {
    id: 'c4', name: 'Sunita Reddy', phone: '+91 91234 56789', channel: 'sms',
    preview: 'Is villa still available?', time: '1hr', status: 'bot',
    messages: [
      { id: 's1', role: 'bot', text: 'Hi Sunita! Yes, 2 villas are available in Jubilee Hills. Budget starting ₹2.1Cr.', timestamp: '8:30 AM' },
      { id: 's2', role: 'user', text: 'Is villa still available?', timestamp: '8:45 AM' },
    ],
    lead: { intent: 'Villa · Jubilee Hills', stage: 'Qualifying', confidence: 81 },
    stats: { messages: 4, resolution: 'In progress', timeToBook: '—' },
  },
  {
    id: 'c5', name: 'Vikram Singh', phone: '+91 88001 34521', channel: 'web',
    preview: 'Commercial space inquiry', time: '2hr', status: 'resolved',
    messages: [
      { id: 'v1', role: 'bot', text: 'Welcome! Are you looking for retail or office space?', timestamp: '7:30 AM' },
      { id: 'v2', role: 'user', text: 'Commercial space inquiry — 2000 sqft Madhapur', timestamp: '7:32 AM' },
      { id: 'v3', role: 'bot', text: 'Shared brochure and connected to commercial team. Lead saved.', timestamp: '7:33 AM' },
    ],
    lead: { intent: 'Commercial · 2000 sqft', stage: 'Lead captured', confidence: 91 },
    stats: { messages: 5, resolution: 'Automated ✓', timeToBook: '—' },
  },
  {
    id: 'c6', name: 'Deepa Nair', phone: '+91 99500 11230', channel: 'whatsapp',
    preview: 'Can I reschedule my visit?', time: '3hr', unread: 3, status: 'agent',
    messages: [
      { id: 'd1', role: 'user', text: 'Can I reschedule my visit from Friday to Sunday?', timestamp: '6:15 AM' },
      { id: 'd2', role: 'bot', text: 'I can help with that. Let me check agent availability…', timestamp: '6:16 AM' },
    ],
    lead: { intent: 'Reschedule visit', stage: 'Needs agent', confidence: 65 },
    stats: { messages: 7, resolution: 'Escalated', timeToBook: '—' },
  },
  {
    id: 'c7', name: 'Meena Iyer', phone: '+91 98400 11223', channel: 'whatsapp',
    preview: 'Thank you for the details', time: 'Yesterday', status: 'resolved',
    messages: [
      { id: 'me1', role: 'user', text: 'Thank you for the details', timestamp: 'Yesterday' },
      { id: 'me2', role: 'bot', text: 'You\'re welcome Meena! Reach out anytime.', timestamp: 'Yesterday' },
    ],
    lead: { intent: 'General enquiry', stage: 'Closed', confidence: 96 },
    stats: { messages: 3, resolution: 'Automated ✓', timeToBook: '—' },
  },
  {
    id: 'c8', name: 'Kiran Verma', phone: '+91 87654 98765', channel: 'web',
    preview: 'Budget is flexible, need 3BHK', time: 'Yesterday', status: 'bot',
    messages: [
      { id: 'k1', role: 'user', text: 'Budget is flexible, need 3BHK near HITEC City', timestamp: 'Yesterday' },
      { id: 'k2', role: 'bot', text: 'Great! I have 4 premium options. Shall I share details?', timestamp: 'Yesterday' },
    ],
    lead: { intent: '3BHK · HITEC City', stage: 'Qualifying', confidence: 86 },
    stats: { messages: 5, resolution: 'In progress', timeToBook: '—' },
  },
];

export const bots: BotItem[] = [
  { id: 'b1', emoji: '🏠', name: 'PropBot', category: 'Real estate', live: true, channels: ['whatsapp', 'web', 'sms'] },
  { id: 'b2', emoji: '🍽️', name: 'DineBot', category: 'Restaurant', live: false, channels: ['whatsapp', 'web'] },
  { id: 'b3', emoji: '🛍️', name: 'ShopBot', category: 'Retail', live: false, channels: ['web'] },
];

export const channelStats = [
  { name: 'WhatsApp', value: 58, color: '#25D366' },
  { name: 'Web Chat', value: 31, color: '#2563EB' },
  { name: 'SMS', value: 11, color: '#0EA5E9' },
];

export const dailyConversations = [
  { day: 'May 27', total: 72, bot: 56, agent: 16 },
  { day: 'May 28', total: 81, bot: 63, agent: 18 },
  { day: 'May 29', total: 68, bot: 52, agent: 16 },
  { day: 'May 30', total: 94, bot: 74, agent: 20 },
  { day: 'May 31', total: 88, bot: 68, agent: 20 },
  { day: 'Jun 1', total: 76, bot: 58, agent: 18 },
  { day: 'Jun 2', total: 102, bot: 80, agent: 22 },
  { day: 'Jun 3', total: 95, bot: 74, agent: 21 },
  { day: 'Jun 4', total: 89, bot: 70, agent: 19 },
  { day: 'Jun 5', total: 110, bot: 86, agent: 24 },
  { day: 'Jun 6', total: 98, bot: 76, agent: 22 },
  { day: 'Jun 7', total: 85, bot: 66, agent: 19 },
  { day: 'Jun 8', total: 105, bot: 82, agent: 23 },
  { day: 'Jun 9', total: 92, bot: 72, agent: 20 },
];

export const topIntents = [
  { intent: 'Browse properties', pct: 34 },
  { intent: 'Book site visit', pct: 28 },
  { intent: 'Check pricing', pct: 22 },
  { intent: 'Talk to agent', pct: 16 },
];

export const funnelSteps = [
  { label: 'Conversations started', value: 1247 },
  { label: 'Engaged', value: 891 },
  { label: 'Lead captured', value: 312 },
  { label: 'Site visit booked', value: 89 },
];
