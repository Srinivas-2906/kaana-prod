const TEMPLATES = {
  clinic: [
    { title: 'General Consultation', subtitle: 'Examination & advice', price: '₹100', priceNum: 100, meta: '30 min', image: '', category: 'Consultation' },
    { title: 'Conservative Dentistry', subtitle: 'Fillings & root canal', price: 'From ₹800', priceNum: 800, meta: 'Per tooth', image: '', category: 'Treatment' },
    { title: 'Complete/Partial Dentures', subtitle: 'Custom-fit dentures', price: 'From ₹8,000', priceNum: 8000, meta: 'Consultation required', image: '', category: 'Prosthetics' },
    { title: 'Cosmetic Dentistry', subtitle: 'Whitening & veneers', price: 'From ₹3,000', priceNum: 3000, meta: 'Smile makeover', image: '', category: 'Cosmetic' },
    { title: 'Artificial Teeth', subtitle: 'Implants & crowns', price: 'From ₹15,000', priceNum: 15000, meta: 'Per unit', image: '', category: 'Implants' },
  ],
  'real-estate': [
    { title: '2 BHK Apartment', subtitle: 'Ready to move', price: '₹45 L', priceNum: 4500000, meta: 'East-facing', image: '', category: 'Apartment', bhk: '2', location: 'City Centre' },
    { title: '3 BHK Villa', subtitle: 'Gated community', price: '₹1.2 Cr', priceNum: 12000000, meta: 'Premium', image: '', category: 'Villa', bhk: '3', location: 'Suburbs' },
    { title: '1 BHK Studio', subtitle: 'Investment ready', price: '₹28 L', priceNum: 2800000, meta: 'High rental yield', image: '', category: 'Apartment', bhk: '1', location: 'Downtown' },
  ],
};

export function getCatalogTemplate(industry) {
  return TEMPLATES[industry] ?? TEMPLATES.clinic;
}
