const TEMPLATES = {
  clinic: [
    { title: 'General Consultation', subtitle: 'Examination & advice', price: '₹100', priceNum: 100, meta: '30 min', image: '', category: 'Consultation' },
    { title: 'Conservative Dentistry', subtitle: 'Fillings & root canal', price: 'From ₹800', priceNum: 800, meta: 'Per tooth', image: '', category: 'Treatment' },
    { title: 'Complete/Partial Dentures', subtitle: 'Custom-fit dentures', price: 'From ₹8,000', priceNum: 8000, meta: 'Consultation required', image: '', category: 'Prosthetics' },
    { title: 'Cosmetic Dentistry', subtitle: 'Whitening & veneers', price: 'From ₹3,000', priceNum: 3000, meta: 'Smile makeover', image: '', category: 'Cosmetic' },
    { title: 'Artificial Teeth', subtitle: 'Implants & crowns', price: 'From ₹15,000', priceNum: 15000, meta: 'Per unit', image: '', category: 'Implants' },
  ],
};

export function getCatalogTemplate(industry) {
  return TEMPLATES[industry] ?? TEMPLATES.clinic;
}
