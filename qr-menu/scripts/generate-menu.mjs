import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function dish(name, price, isVeg, extra = {}) {
  return {
    id: slug(name),
    name,
    price,
    isVeg,
    ...extra,
  }
}

const bestseller = { isBestseller: true }

const sections = [
  {
    id: 'veg-main-course',
    title: 'Veg Main Course',
    topCategory: 'indian',
    items: [
      dish('Mixed Veg Curry', 220, true, { rating: 4.9, reviewCount: '276', description: 'Serves 1 | A flavorful Indian delight with a medley of vibrant vegetables in a rich, aromatic curry sauce.' }),
      dish('Green Peas Masala', 220, true, { rating: 4.9, reviewCount: '205' }),
      dish('Kadai Veg', 249, true, { rating: 4.7, reviewCount: '109' }),
      dish('Mushroom Curry', 290, true, { rating: 4.2, reviewCount: '231' }),
      dish('Veg Manchurian Gravy', 200, true, { rating: 4.6, reviewCount: '265' }),
      dish('Shahi Paneer', 310, true, { rating: 3.0, reviewCount: '72', description: 'A creamy indulgence made by cooking paneer cubes in a tomato gravy seasoned with Indian spices.' }),
      dish('Baby Corn Masala', 300, true, { rating: 4.6, reviewCount: '43' }),
      dish('Paneer Curry', 290, true, { rating: 4.2, reviewCount: '327', description: 'Satisfy your cravings with the creamy, aromatic flavors of this classic Indian vegetarian dish. Serves 1' }),
      dish('Kaju Tomato Curry', 330, true, { rating: 4.3, reviewCount: '155', description: 'Serves 1' }),
      dish('Kaju Masala', 330, true, { rating: 3.9, reviewCount: '56' }),
      dish('Paneer Mattar Masala', 320, true, { rating: 4.8, reviewCount: '120', description: 'A mouth-watering blend of creamy paneer and tender peas, immersed in a fragrant Indian tomato-based sauce. Serves 1' }),
      dish('Paneer Butter Masala', 300, true, { ...bestseller, rating: 4.5, reviewCount: '1.8K+', description: 'Serves 1 | Creamy and mild sweet gravy made with butter, tomato, cashew, paneer and spices' }),
      dish('Chana Masala', 220, true, { rating: 4.7, reviewCount: '257', description: 'A tasty and savory gravy made from cooking chickepeas in a flavorful gravy, seasoned with Indian spices.' }),
      dish('Kaju Paneer Curry', 330, true, { rating: 4.9, reviewCount: '273', description: 'A rich and creamy Indian curry featuring tender paneer cheese and crunchy cashews. Serves 1' }),
      dish('Methi Chaman', 320, true, { rating: 4.7, reviewCount: '121' }),
      dish('Kadai Paneer', 300, true, { rating: 4.5, reviewCount: '257', description: 'A rich and flavorful Indian vegetarian dish with soft paneer and aromatic spices. Serves 1' }),
      dish('Mushroom Masala', 319, true, { rating: 4.5, reviewCount: '89' }),
      dish('Veg Kolhapuri', 240, true, { rating: 4.3, reviewCount: '37', description: 'A tantalizing Indian specialty bursting with bold flavors and rich, aromatic spices.' }),
      dish('Paneer Tikka Masala', 300, true, { rating: 4.4, reviewCount: '103', description: 'A flavorful and aromatic Indian delight with tender paneer cooked in a creamy, mouthwatering tikka masala sauce.' }),
    ],
  },
  {
    id: 'chicken-main-course',
    title: 'Chicken Main Course',
    topCategory: 'indian',
    items: [
      dish('Butter Chicken', 330, false, { rating: 4.3, reviewCount: '499', description: 'Serves 1 | A rich and creamy Indian dish with tender chicken, bursting with flavor. Serves 1' }),
      dish('Andhra Chicken Curry B/L', 319, false, { rating: 3.9, reviewCount: '4', description: 'A flavorful and aromatic Indian curry made with tender chicken, perfect for those who crave the vibrant tastes of the Andhra region.' }),
      dish('Kadai Chicken', 330, false, { rating: 3.6, reviewCount: '176' }),
      dish('Chicken Mughlai', 330, false, { rating: 4.6, reviewCount: '215', description: 'An all-time loved combo with finger-licking chicken Mughlai served along with chilli chicken, 1 lollipop and raitha.' }),
      dish('Chicken Patiala', 340, false, { rating: 2.1, reviewCount: '34' }),
      dish('Boneless Chicken Curry', 319, false, { rating: 4.6, reviewCount: '433', description: 'A tender, flavorful curry made with boneless chicken and traditional Indian spices. Serves 1-2' }),
      dish('Chicken Do Pyaza', 319, false, { rating: 4.9, reviewCount: '14' }),
      dish('Punjabi Chicken', 319, false, { rating: 5.0, reviewCount: '62' }),
      dish('Methi Chicken', 319, false, { rating: 3.5, reviewCount: '49' }),
      dish('Chicken Tikka Masala', 330, false, { rating: 4.9, reviewCount: '101' }),
      dish('Chicken Masala', 290, false, { rating: 5.0, reviewCount: '56' }),
      dish('Chicken Curry', 220, false, { rating: 4.3, reviewCount: '386', description: 'A savory and aromatic Indian chicken dish with a rich and creamy curry sauce that will leave you wanting more. Serves 1-2' }),
      dish('Chicken Rogan Josh', 330, false, { rating: 5.0, reviewCount: '30' }),
    ],
  },
  {
    id: 'chicken-biryanis',
    title: 'Chicken Biryanis',
    topCategory: 'indian',
    items: [
      dish('Chicken Dum Biryani', 310, false, { rating: 4.5, reviewCount: '2.1K+', description: 'Serves 1 | A delightful preparation of richly flavoured aromatic rice layered with marinated chicken pieces in a delicate blend of whole spices' }),
      dish('Kalmi Chicken Biryani', 360, false, { rating: 4.7, reviewCount: '632', description: 'Serves 1 | Aromatic basmati rice and tender chicken, cooked to perfection with fragrant Indian spices. Serves 1-2' }),
      dish('Tandoori Chicken Biryani', 450, false, { rating: 4.7, reviewCount: '257', description: 'Serves 1 | Aromatic Indian rice dish layered with flavorful tandoori chicken. Serves 1-2' }),
      dish('Chicken Mughlai Biryani', 369, false, { rating: 4.4, reviewCount: '1.2K+', description: 'Serves 1 | A royal blend of aromatic rice and succulent chicken, cooked to perfection with traditional Indian spices. Serves 1-2' }),
      dish('Chicken Special Biryani', 340, false, { rating: 4.4, reviewCount: '1.5K+', description: 'Comes with Egg , Chicken Gravy , Raita | Serves 1 | Flavourful seasoned rice and chicken,made with just the right spiciness' }),
      dish('Chicken Pot Biryani', 360, false, { rating: 4.2, reviewCount: '2.8K+', description: 'Comes with Raita | Serves 1 | This flavoursome biryani made in authentic hyerabadi style using marinated tender chicken aromatic spices and fluffy rice cooked in a claypot which gives different touch to the taste.' }),
      dish('Chicken Fry Biryani', 330, false, { rating: 4.2, reviewCount: '3.0K+', description: 'Serves 1 | Yummy chicken fry biryani served with raita and gravy perfect dish to satinate your hunger' }),
    ],
  },
  {
    id: 'chicken-tandoor',
    title: 'Chicken Tandoor',
    topCategory: 'indian',
    items: [
      dish('Chicken Tikka', 310, false, { rating: 4.5, reviewCount: '290', description: 'Super soft chunks of chicken are coated with a spicy and peppery masala and grilled to perfection.' }),
      dish('Kalmi Chicken Kebab', 330, false, { rating: 4.3, reviewCount: '539', description: 'Serves 1 | Tender chicken kebabs bursting with Indian flavors. Serves 1' }),
      dish('Reshmi Chicken Kebab', 320, false, { rating: 4.4, reviewCount: '96', description: 'Serves 1' }),
      dish('Chicken Malai Tikka', 310, false, { rating: 4.7, reviewCount: '159' }),
      dish('Grilled Chicken', 600, false),
      dish('Azwani Kebab', 300, false, { rating: 4.3, reviewCount: '8' }),
      dish('Hariyali Tikka', 300, false, { rating: 4.8, reviewCount: '14' }),
    ],
  },
  {
    id: 'indian-breads',
    title: 'Indian Breads',
    topCategory: 'indian',
    items: [
      dish('Tandoori Roti', 44, true, { rating: 4.4, reviewCount: '384', description: 'Super soft roti that is cooked to perfection in a tandoor.' }),
      dish('Butter Roti', 50, true, { rating: 4.4, reviewCount: '278', description: 'Soft and fluffy rotis topped with a generous serving of butter.' }),
      dish('Plain Naan', 55, true, { rating: 4.1, reviewCount: '178', description: 'Soft and fluffy naan tastes amazing when paired with a gravy.' }),
      dish('Paneer Kulcha', 120, true, { rating: 4.7, reviewCount: '159', description: 'A delightfully wholesome combo of paneer kulcha, served along with chana masala, curds, gravy and butter.' }),
      dish('Butter Naan ( 1 Pc )', 60, true, { ...bestseller, rating: 4.4, reviewCount: '2.4K+', description: '1 piece | A soft and buttery Indian bread, perfect for pairing with any flavorful dish. Serves 1' }),
      dish('Cheese Naan', 70, true, { rating: 4.4, reviewCount: '106', description: 'North Indian bread with a generous serving of cheese that tastes brilliant when paired with a gravy.' }),
      dish('Onion Kulcha', 99, true, { rating: 2.9, reviewCount: '29', description: 'A delectable, savory flatbread bursting with layers of exquisite flavors, perfect to pair with your favorite Indian dishes.' }),
      dish('Plain Kulcha', 75, true, { rating: 4.1, reviewCount: '17' }),
      dish('Butter Kulcha', 85, true, { rating: 4.7, reviewCount: '32' }),
      dish('Laccha Paratha', 85, true, { rating: 3.1, reviewCount: '90', description: 'Multi-layered flatbread made with wheat and plain flour.' }),
      dish('Garlic Naan', 105, true, { rating: 4.4, reviewCount: '165', description: 'North Indian bread with a rich undertone of garlic that tastes brilliant when paired with a gravy.' }),
      dish('Masala Kulcha', 115, true, { rating: 4.7, reviewCount: '142', description: 'Stuffed paratha that tastes great with gravy or pickle.' }),
    ],
  },
  {
    id: 'indian-starters',
    title: 'Starters',
    topCategory: 'indian',
    items: [
      dish('Chicken Liver Fry', 180, false, { rating: 4.4, reviewCount: '154', description: 'A succulent Indian dish with tender chicken liver, fried to golden perfection. Serves 1' }),
      dish('Egg Bhurji', 160, false, { rating: 4.7, reviewCount: '151', description: 'A wholesome dish prepared with delectable eggs scarambled and flavored with masalas and assorted veggies.' }),
      dish('Mutton Fry Bone', 380, false, { rating: 2.0, reviewCount: '3' }),
      dish('Chicken Fry', 290, false, { rating: 4.1, reviewCount: '358', description: 'Crispy, flavorful and tender fried chicken with Indian spices. Serves 1' }),
      dish('Prawns Fry', 350, false, { rating: 4.3, reviewCount: '96', description: 'Golden brown and flavorful, this dish is brimming with succulent prawns that are sure to tantalize your taste buds. Serves 1-2' }),
      dish('Fish Fry', 290, false, { rating: 4.4, reviewCount: '70', description: 'A delightfully delectable dish prepared with tender fish coated in special spices and fried to a perfect golden brown.' }),
    ],
  },
  {
    id: 'seafood-biryanis',
    title: 'Seafood Biryanis',
    topCategory: 'indian',
    items: [
      dish('Fish Biryani', 399, false, { rating: 4.6, reviewCount: '98', description: 'A flavorful Indian rice dish with tender fish and aromatic spices. Serves 1-2' }),
      dish('Prawns Biryani', 399, false, { rating: 4.3, reviewCount: '193', description: 'A fragrant and flavorful Indian rice dish with succulent prawns cooked to perfection. Serves 1-2' }),
      dish('Mixed Biryani', 399, false, { rating: 3.5, reviewCount: '101', description: 'Contains chicken, mutton & prawns.' }),
    ],
  },
  {
    id: 'mutton-main-course',
    title: 'Mutton Main Course',
    topCategory: 'indian',
    items: [
      dish('Mutton Curry Bone (250 Gms)', 380, false, { rating: 3.9, reviewCount: '3' }),
      dish('Mutton Do Pyaza Bone', 380, false, { rating: 3.8, reviewCount: '3' }),
    ],
  },
  {
    id: 'mutton-biryanis',
    title: 'Mutton Biryanis',
    topCategory: 'indian',
    items: [
      dish('Mutton Biryani Bone', 390, false, { rating: 4.0, reviewCount: '38', description: 'Serves 1 | A fragrant and flavorful Indian rice dish with tender mutton. Serves 1-2' }),
    ],
  },
  {
    id: 'prawns-main-course',
    title: 'Prawns Main Course',
    topCategory: 'indian',
    items: [
      dish('Prawns Curry (200 Gms)', 350, false, { rating: 4.9, reviewCount: '67', description: 'A savory and fragrant curry featuring succulent prawns in a rich Indian sauce. Serves 1-2' }),
    ],
  },
  {
    id: 'veg-tandoor',
    title: 'Veg Tandoor',
    topCategory: 'indian',
    items: [
      dish('Paneer Tikka', 310, true, { rating: 4.4, reviewCount: '137', description: 'Soft paneer cubes marinated in a seasoned masala and cooked in a tandoor.' }),
    ],
  },
  {
    id: 'veg-biryani',
    title: 'Veg Biryani',
    topCategory: 'indian',
    items: [
      dish('Vegetable Pot Biryani', 269, true, { rating: 4.3, reviewCount: '881', description: 'Comes with raita and serva | Serves 1 | Freshly picked assorted vegetables are seasoned with exotic herbs and masalas cooked in a new avtar' }),
    ],
  },
  {
    id: 'egg-main-course',
    title: 'Egg Main Course',
    topCategory: 'indian',
    items: [
      dish('Egg Curry (2 Pcs)', 130, false, { rating: 4.5, reviewCount: '165' }),
    ],
  },
  // Chinese
  {
    id: 'noodles',
    title: 'Noodles',
    topCategory: 'chinese',
    items: [
      dish('Veg Noodles', 110, true, { ...bestseller, rating: 4.4, reviewCount: '1.3K+', description: 'Serves 1 | A flavorful Chinese dish brimming with noodles & garden-fresh vegetables. Serves 1' }),
      dish('Veg Schezwan Noodles', 130, true, { rating: 3.7, reviewCount: '324' }),
      dish('Egg Noodles', 140, false, { rating: 4.4, reviewCount: '387', description: 'A delightfully hearty combo of egg noodles and spicy chicken Manchurian and refreshing soda.' }),
      dish('Double Egg Noodles', 160, false, { rating: 4.5, reviewCount: '740', description: 'Twice the egg, twice the fun - savor the abundant taste of Double Egg Noodles! Serves 1' }),
      dish('Chicken Schezwan Noodles', 200, false, { rating: 4.5, reviewCount: '283', description: 'Delectable noodles tossed along with assorted fresh veggies, chicken, Schezwan sauce and spices - perfect to satisfy your hunger.' }),
      dish('Chicken Noodles', 180, false, { ...bestseller, rating: 4.6, reviewCount: '1.8K+', description: 'Comes with tomato and chilli sauce | Serves 1 | Noodles sauted egg and chicken with ginger,garlic and assorted vegetables in soy sauce.' }),
      dish('Veg Manchurian Noodles', 230, true, { rating: 4.3, reviewCount: '172', description: 'Serves 1 | A tantalizing blend of Chinese flavors in a veggie-packed noodle dish. Serves 1' }),
      dish('Double Chicken Noodles', 210, false, { ...bestseller, rating: 4.3, reviewCount: '1.7K+', description: 'Serves 1 | Flavorful Chinese dish with double the chicken and savory noodles. Serves 1' }),
      dish('Veg Mushroom Noodles', 240, true, { rating: 4.8, reviewCount: '80' }),
      dish('Veg Paneer Noodles', 240, true, { rating: 4.6, reviewCount: '249' }),
    ],
  },
  {
    id: 'veg-starters',
    title: 'Veg Starters',
    topCategory: 'chinese',
    items: [
      dish('Veg Manchurian', 230, true, { rating: 4.4, reviewCount: '1.9K+', description: 'Serves 1 | An Indo-chinese dish made of deep fried mixed vegetable dumpling tossed in spicy chinese sauces' }),
      dish('Manchurian Paneer', 325, true, { rating: 4.8, reviewCount: '68' }),
      dish('Crispy Baby Corn', 325, true, { rating: 4.9, reviewCount: '78', description: 'Crispy and satisfying, this mouth-watering Chinese dish features tender baby corn coated in a delicious crunch. Serves 1' }),
      dish('Chilli Baby Corn', 308, true, { rating: 4.5, reviewCount: '221' }),
      dish('Baby Corn 65', 325, true, { rating: 5.0, reviewCount: '18' }),
      dish('Schezwan Baby Corn', 318, true, { rating: 4.6, reviewCount: '5' }),
      dish('Chilli Paneer', 310, true, { rating: 4.7, reviewCount: '355', description: 'Serves 1' }),
      dish('Schezwan Paneer', 336, true, { rating: 4.6, reviewCount: '21', description: 'A tantalizing Chinese delight with flavors that pack a punch, combining succulent paneer in a delectable blend of zesty seasonings.' }),
      dish('Manchurian Baby Corn', 308, true, { rating: 3.8, reviewCount: '37' }),
      dish('Chilli Mushroom', 325, true, { rating: 3.7, reviewCount: '250' }),
      dish('Manchurian Mushroom', 325, true, { rating: 3.9, reviewCount: '41', description: 'Serves 1' }),
      dish('Paneer 65', 325, true, { rating: 4.6, reviewCount: '108', description: 'Serves 1 | Deliciously crispy thin and long dosa smothered with butter; served with sambhar and chutney - a typical South Indian breakfast.' }),
      dish('Schezwan Mushroom', 336, true, { rating: 4.5, reviewCount: '10' }),
    ],
  },
  {
    id: 'chicken-starters',
    title: 'Chicken Starters',
    topCategory: 'chinese',
    items: [
      dish('Chicken Lollipop (4 Pcs)', 340, false, { rating: 4.4, reviewCount: '477', description: 'Tasty morsels of succulent chicken, delicately flavoured and crisply fried, making it an irresistible Chinese delicacy. Serves 1' }),
      dish('Chilli Chicken', 330, false, { rating: 4.3, reviewCount: '403', description: 'Serves 1 | Tender chicken cooked in a flavorful sauce with a perfect balance of savory and sweet. Serves 1' }),
      dish('Chicken 555', 330, false, { rating: 4.6, reviewCount: '527', description: 'Serves 1 | A succulent, flavorful Chinese chicken dish. Serves 1' }),
      dish('Garlic Chicken', 330, false, { rating: 4.3, reviewCount: '91' }),
      dish('Chicken 65', 330, false, { rating: 4.4, reviewCount: '318', description: 'This crispy and flavorful Chinese chicken dish will take your taste buds on a savory adventure. Serves 1' }),
      dish('Chicken Manchurian', 330, false, { rating: 4.4, reviewCount: '322' }),
      dish('Ginger Chicken', 330, false, { rating: 5.0, reviewCount: '50' }),
      dish('Schezwan Chicken', 330, false, { rating: 4.3, reviewCount: '48' }),
    ],
  },
  {
    id: 'veg-fried-rice',
    title: 'Veg Fried Rice',
    topCategory: 'chinese',
    items: [
      dish('Veg Fried Rice', 239, true, { rating: 4.5, reviewCount: '2.4K+', description: 'Serves 1 | Stir fried dish turns plain white rice into flavourful grains lightly seasoned with soy sauce and tossed with colouful vegetables' }),
      dish('Veg Schezwan Fried Rice', 259, true, { rating: 4.3, reviewCount: '414', description: 'A slightly spicy dish made by tossing vegetables and rice in a garlic and chilli flavored schezwan sauce.' }),
      dish('Veg Manchurian Fried Rice', 330, true, { rating: 4.4, reviewCount: '627', description: 'A flavorsome, Chinese-inspired dish with a crispy Veg Manchurian topping that perfectly complements the classic fried rice. Serves 1' }),
      dish('Jeera Fried Rice', 239, true, { rating: 4.3, reviewCount: '39', description: 'Aromatic rice cooked in a tempering of cumin and whole spices - perfect dish to accompany any side dish.' }),
      dish('Veg Paneer Fried Rice', 359, true, { rating: 4.4, reviewCount: '281', description: 'Serves 1 | A delectable Chinese dish with a perfect balance of veggies and paneer, served over flavorful fried rice. Serves 1' }),
      dish('Veg Mushroom Fried Rice', 359, true, { rating: 3.7, reviewCount: '66' }),
      dish('Mixed Veg Fried Rice', 379, true, { rating: 4.8, reviewCount: '107', description: 'A tantalizing Chinese delicacy with mixed vegetables and fried rice. Serves 1-2' }),
    ],
  },
  {
    id: 'non-veg-fried-rice',
    title: 'Non-Veg Fried Rice',
    topCategory: 'chinese',
    items: [
      dish('Chicken Fried Rice', 339, false, { rating: 4.2, reviewCount: '1.4K+', description: 'Comes with raita and gravy | Serves 1 | The richness of chicken and godness of rice packed together in a dish' }),
      dish('Chicken Schezwan Fried Rice', 380, false, { rating: 5.0, reviewCount: '133', description: 'Serves 1' }),
      dish('Chicken Special Fried Rice', 363, false, { rating: 4.2, reviewCount: '738', description: 'Serves 1 | A delectable blend of seasoned rice and savory chicken, perfect for any Chinese cuisine lover. Serves 1-2' }),
      dish('Chicken Mushroom Fried Rice', 380, false, { rating: 5.0, reviewCount: '10', description: 'Golden fried rice sauteed with tender chicken and savory mushrooms. Serves 1-2' }),
      dish('Mixed Fried Rice', 440, false, { rating: 4.3, reviewCount: '122', description: 'Contains egg, chicken, mutton & prawns.' }),
    ],
  },
  {
    id: 'seafood-starters',
    title: 'Seafood Starters',
    topCategory: 'chinese',
    items: [
      dish('Chilli Fish', 340, false, { rating: 2.6, reviewCount: '28', description: 'A flavorful delight of tender fish cooked to perfection, bursting with savory goodness.' }),
      dish('Chilli Prawns', 340, false, { rating: 2.5, reviewCount: '28', description: 'Serves 1' }),
      dish('Apollo Fish', 340, false, { rating: 4.4, reviewCount: '306', description: 'Serves 1' }),
      dish('Schezwan Prawns', 340, false, { rating: 3.8, reviewCount: '12' }),
      dish('Fish Manchurian', 340, false, { rating: 3.3, reviewCount: '16', description: 'A mouthwatering dish prepared with delectable fish stir fried with assorted vegetables and spicy sauces - perfect to satisfy your hunger.' }),
      dish('Loose Prawns', 340, false, { rating: 4.5, reviewCount: '187' }),
      dish('Manchurian Prawns', 340, false, { rating: 3.3, reviewCount: '6' }),
    ],
  },
  {
    id: 'egg-fried-rice',
    title: 'Egg Fried Rice',
    topCategory: 'chinese',
    items: [
      dish('Egg Fried Rice', 249, false, { rating: 4.5, reviewCount: '710', description: 'Simple, aromatic, and healthy meal of scrambled eggs stir fried with rice.' }),
      dish('Egg Schezwan Fried Rice', 269, false, { rating: 4.3, reviewCount: '64', description: 'Fresh veggies and egg tossed in a pan with steamed rice and flavorful Hakka sauces and spices.' }),
      dish('Egg Mushroom Fried Rice', 340, false, { rating: 2.0, reviewCount: '18' }),
    ],
  },
  {
    id: 'chicken-soups',
    title: 'Chicken Soups',
    topCategory: 'chinese',
    items: [
      dish('Chicken Sweet Corn Soup', 131, false, { rating: 4.7, reviewCount: '134', description: 'A healthy soup that is packed with the goodness of tender chicken and nutritious corn.' }),
      dish('Chicken Lemon Coriander Soup', 130, false, { rating: 3.3, reviewCount: '34', description: 'A delightfully refreshing and soothing soup prepared with succulent chicken, lemon and coriander.' }),
      dish('Chicken Hot & Sour Soup', 130, false, { rating: 4.5, reviewCount: '217', description: 'A hot and sour chicken soup to tickle your taste buds.' }),
      dish('Chicken Manchow Soup', 130, false, { rating: 4.4, reviewCount: '184', description: 'A comforting chinese-style thick soup filled with tender, juicy chicken.' }),
    ],
  },
  {
    id: 'veg-soups',
    title: 'Veg Soups',
    topCategory: 'chinese',
    items: [
      dish('Veg Sweet Corn Soup', 120, true, { rating: 4.0, reviewCount: '147', description: 'Serves 1 | A healthy soup that is packed with the goodness of tender and nutritious corn.' }),
      dish('Veg Hot & Sour Soup', 120, true, { rating: 4.7, reviewCount: '144', description: 'A soup made from vegetables with the rich sweet and sour undertones.' }),
      dish('Veg Manchow Soup', 120, true, { rating: 4.2, reviewCount: '115', description: 'A delicious hot and spicy, thick soup made from mixed vegetables and topped with fried noodles.' }),
      dish('Mushroom Soup', 120, true, { rating: 3.7, reviewCount: '30' }),
    ],
  },
  {
    id: 'shawarma',
    title: 'Shawarma',
    topCategory: 'chinese',
    items: [
      dish('Chicken Butter Shawarma', 180, false, { rating: 4.3, reviewCount: '192', description: 'Serves 1 | Tender chicken shawarma drenched in rich butter, bursting with savory flavors. Serves 1' }),
      dish('Chicken Mint Shawarma', 150, false, { rating: 3.7, reviewCount: '38', description: 'Serves 1' }),
    ],
  },
  {
    id: 'chinese-veg-main-course',
    title: 'Veg Main Course',
    topCategory: 'chinese',
    items: [
      dish('Chilli Paneer Gravy', 310, true, { rating: 3.0, reviewCount: '78' }),
    ],
  },
  // South Indian
  {
    id: 'idlis-vada-special-dosa',
    title: 'Idlis & Vada & Special Dosa',
    topCategory: 'south-indian',
    items: [
      dish('Idli ( 2 Pcs )', 60, true, { ...bestseller, offerPrice: 49, rating: 4.5, reviewCount: '8.1K+', description: 'Serves 1 | Served with sambar and chutney.' }),
      dish('Mysore Bhajji', 60, true, { rating: 4.4, reviewCount: '1.6K+', description: 'Serves 1 | A popular South Indian dish perfect for a quick snack or meal. Serves 1' }),
      dish('Vada Sambar ( 2 Pieces )', 70, true, { rating: 4.3, reviewCount: '247', description: 'Serves 1 | Vada served submerged in Sambhar' }),
      dish('Idli Sambar ( 2 Pieces )', 70, true, { rating: 4.7, reviewCount: '2.3K+', description: 'Serves 1 | Idli submerged in hot bowl of sambar.' }),
      dish('Vada ( 2 Pieces )', 60, true, { rating: 4.6, reviewCount: '2.9K+', description: 'Serves 1 | Served with sambar and chutney.' }),
      dish('Paneer Cheese Onion Dosa ( 1 Pc )', 180, true, { rating: 4.7, reviewCount: '27', description: 'Medium Spicy' }),
      dish('Baby Corn Dosa', 180, true, { rating: 5.0, reviewCount: '6' }),
      dish('Green Peas Cheese Dosa', 160, true, { rating: 5.0, reviewCount: '7' }),
      dish('Cheese Onion Mushroom Dosa', 190, true, { rating: 2.1, reviewCount: '11' }),
      dish('Paneer Baby Corn Dosa', 180, true, { rating: 4.7, reviewCount: '20' }),
      dish('Panner Green Peas Dosa', 180, true),
      dish('Paneer Kaju Dosa', 200, true, { rating: 4.0, reviewCount: '54' }),
      dish('Paneer Mushroom Dosa', 200, true, { rating: 4.5, reviewCount: '14' }),
      dish('Paneer Schezwan Dosa', 200, true, { rating: 4.3, reviewCount: '12' }),
      dish('Sambar', 19, true, { rating: 4.7, reviewCount: '71', description: 'A hot lentil soup with mixed vegetables is a must have accompaniment for popular south indian breakfast and lunch recipes. Tastes good with idli, dosa and rice' }),
      dish('Dahi Vada ( 2 Pcs )', 80, true, { rating: 4.6, reviewCount: '1.5K+', description: 'Serves 1 | Vada is made of urad dal (called garelu in telugu) served with sambar and fresh coconut chutney.' }),
      dish('Butter Chana Dosa', 150, true, { rating: 3.8, reviewCount: '12' }),
      dish('Cheese Kaju Dosa', 190, true, { rating: 4.9, reviewCount: '90' }),
      dish('Cheese Chana Masala Dosa', 150, true, { rating: 4.1, reviewCount: '21' }),
    ],
  },
  {
    id: 'dosas',
    title: 'Dosas',
    topCategory: 'south-indian',
    items: [
      dish('Onion Minapa Masala Dosa', 100, true, { rating: 4.5, reviewCount: '552' }),
      dish('Masala Dosa ( 1 Pc )', 90, true, { ...bestseller, rating: 4.4, reviewCount: '3.5K+', description: 'Serves 1 | A crispy classic South Indian delight with aromatic filling! Serves 1' }),
      dish('Onion Upma Minapa Dosa', 100, true, { rating: 4.8, reviewCount: '238', description: 'A savory South Indian delight featuring crispy dosa and flavor-packed upma topped with caramelized onions. Serves 1' }),
      dish('Paneer Dosa', 200, true, { rating: 4.5, reviewCount: '344', description: 'Crispy crepe made from coarsely ground mix of rice, split black gram, beaten rice and fenugreek, center-filled with spicy paneer masala. Served with' }),
      dish('Mushroom Dosa', 200, true, { rating: 3.2, reviewCount: '77', description: 'Crispy crepe made from coarsely ground mix of rice, split black gram, beaten rice and fenugreek, center-filled with spicy mushroom masala. Served with' }),
      dish('Kaju Dosa', 200, true, { rating: 3.0, reviewCount: '218' }),
      dish('Plain Dosa ( 1 Pc )', 80, true, { rating: 4.3, reviewCount: '1.7K+', description: 'Comes with sambhar and chutney | Serves 1 | Crispy golden goodness that\'s perfect for any meal. Serves 1' }),
      dish('Onion Minapa Dosa', 90, true, { rating: 4.4, reviewCount: '1.9K+', description: 'Serves 1 | A savory South Indian crepe filled with a flavorful onion twist. Serves 1' }),
      dish('Onion Rava Masala Dosa ( 1 Pc )', 100, true, { rating: 4.6, reviewCount: '719', description: 'Comes with sambar and chutney | Serves 1 | A savory South Indian delight with a crispy texture and flavorful filling. Serves 1' }),
      dish('Onion Rava Dosa ( 1 Pc )', 90, true, { ...bestseller, rating: 4.6, reviewCount: '3.8K+', description: 'Serves 1 | | Delectably thin crispy & tasty dosa prepared with semolina |' }),
      dish('Chana Masala Dosa', 150, true, { rating: 4.8, reviewCount: '81', description: 'Serves 1 | Served with sambar and chutney.' }),
      dish('Paper Masala Dosa ( 1 Pc )', 130, true, { rating: 5.0, reviewCount: '225', description: 'Comes with fresh coconut chutney and sambar. | Serves 1 | Dosa stuffed with potato masala' }),
      dish('Paper Plain Dosa', 120, true, { rating: 4.1, reviewCount: '871', description: 'Serves 1 | Traditional South Indian dish made by fermented lentil rice and black lentil.' }),
      dish('Plain Rava Dosa ( 1 Pc )', 80, true, { rating: 4.3, reviewCount: '1.6K+', description: 'Serves 1 | Delectably thin crispy & tasty dosa prepared with semolina.' }),
      dish('Green Peas Masala Dosa', 150, true, { rating: 4.5, reviewCount: '77', description: 'A flavorsome and satisfying Indian crepe prepared with a flavorful stuffing of green peas, delivering a delightful culinary experience.' }),
    ],
  },
  {
    id: 'poori',
    title: 'Poori',
    topCategory: 'south-indian',
    items: [
      dish('Parotta', 100, true, { ...bestseller, rating: 4.0, reviewCount: '1.7K+', description: '2 pieces | South Indian delight of layered bread. Serves 1' }),
      dish('Parota Chana Masala', 180, true, { rating: 4.3, reviewCount: '41', description: 'A delectable combination of flaky parota and flavorful chana masala, perfect for a delightful tiffin experience.' }),
      dish('Chapati Chana Masala', 180, true, { rating: 4.6, reviewCount: '87' }),
      dish('Poori', 90, true, { ...bestseller, offerPrice: 75, rating: 4.5, reviewCount: '4.1K+', description: '2 pieces | A crispy, flavorful South Indian delight. Serves 1' }),
      dish('Chapati', 90, true, { ...bestseller, rating: 4.4, reviewCount: '995', description: '2 pieces | A soft and wholesome South Indian delight. Serves 1' }),
    ],
  },
  {
    id: 'pesarattus',
    title: 'Pesarattus',
    topCategory: 'south-indian',
    items: [
      dish('Plain Pesarattu', 80, true, { rating: 4.9, reviewCount: '110', description: 'Serves 1 | Served with sambar and chutney.' }),
      dish('Upma Pesarattu', 90, true, { rating: 4.6, reviewCount: '589', description: 'Comes with sambhar and chutney | Serves 1 | Perfectly crispy, golden fries tossed in deliciously spicy peri-peri spice powder.' }),
      dish('Onion Pesarattu', 90, true, { rating: 4.9, reviewCount: '181', description: 'Serves 1 | Served with sambar and chutney.' }),
      dish('Onion Upma Pesarattu', 100, true, { rating: 4.3, reviewCount: '492', description: 'Comes with sambhar and chutney | Serves 1' }),
    ],
  },
  {
    id: 'uttapams',
    title: 'Uttapams',
    topCategory: 'south-indian',
    items: [
      dish('Plain Uttapam', 90, true, { rating: 4.6, reviewCount: '168', description: 'Serves 1 | It is very soft, light and spongy dosa, served with coconut chutney and sambar' }),
      dish('Onion Uttapam', 100, true, { rating: 4.4, reviewCount: '878', description: 'Comes with sambhar and chutney | Serves 1 | Soft and spongy dosa stuffed with onions.' }),
    ],
  },
  {
    id: 'upma',
    title: 'Upma',
    topCategory: 'south-indian',
    items: [
      dish('Upma', 60, true, { rating: 4.3, reviewCount: '582', description: 'Serves 1 | | Traditional south Indian dish made from rava (cream of wheat) |' }),
    ],
  },
  {
    id: 'quick-bites-desserts',
    title: 'Quick Bites & Dessers',
    topCategory: 'south-indian',
    items: [
      dish('Water Bottle 1 Liter', 25, true, { rating: 4.3, reviewCount: '62', description: 'Serves 1' }),
      dish('Butter Scotch Milkshake', 140, true, { rating: 4.0, reviewCount: '108', description: 'A crunchy and creamy milkshake made with crunchy butterscotch ice cream and milk.' }),
      dish('Banana Milkshake', 120, true, { rating: 5.0, reviewCount: '26' }),
      dish('Musk Milon Milk Shake', 120, true, { rating: 3.5, reviewCount: '9', description: 'A creamy and refreshing milkshake with a subtle musky flavor. Serves 1' }),
      dish('Caroot Milkshake', 130, true, { rating: 4.4, reviewCount: '9' }),
      dish('Chocolet Milkshake', 140, true, { rating: 4.7, reviewCount: '55', description: 'Indulge in a creamy chocolate milkshake that\'s perfect for dessert or a quick treat. Serves 1' }),
      dish('Black Current Milkshake', 140, true, { rating: 2.9, reviewCount: '22', description: 'A fruity and creamy dessert that satisfies your sweet cravings. Serves 1' }),
      dish('Pista Milk Shake', 140, true, { rating: 3.5, reviewCount: '17' }),
      dish('Strawberry Milkshake', 120, true, { rating: 3.0, reviewCount: '23', description: 'A thick shake made from plush strawberries.' }),
      dish('Vannella Milkshake', 120, true, { rating: 4.7, reviewCount: '48' }),
      dish('Water Milon Juice', 80, true, { rating: 4.1, reviewCount: '130' }),
      dish('Muskmilon Juice', 85, true, { rating: 3.8, reviewCount: '95' }),
      dish('Banana Juice', 85, true, { rating: 4.9, reviewCount: '14' }),
      dish('Papaya Juice', 85, true, { rating: 2.1, reviewCount: '33' }),
      dish('Caroot Juice', 90, true, { rating: 5.0, reviewCount: '27' }),
      dish('Pineapple Juice', 85, true, { rating: 4.7, reviewCount: '153' }),
      dish('Grape Juice', 80, true, { rating: 4.1, reviewCount: '114', description: 'A vibrant and refreshing blend of pulpy sweet grape juice rich in antioxidants and vitamins' }),
    ],
  },
  {
    id: 'meals',
    title: 'Meals',
    topCategory: 'south-indian',
    items: [
      dish('Veg Mini Meals', 140, true, { rating: 4.1, reviewCount: '1.5K+', description: 'Medium Spicy | Serves 1 | Fried rice + sambar rice+ curd rice + veg kurma' }),
      dish('Veg Meal', 149, true, { rating: 4.5, reviewCount: '103' }),
    ],
  },
]

// Ensure unique IDs across duplicate dish names in different sections
const seenIds = new Map()
for (const section of sections) {
  for (const item of section.items) {
    const baseId = item.id
    const count = seenIds.get(baseId) ?? 0
    if (count > 0) {
      item.id = `${baseId}-${section.id}`
    }
    seenIds.set(baseId, count + 1)
    delete item.rating
    delete item.reviewCount
    delete item.offerPrice
  }
}

const outputPath = join(__dirname, '../src/data/menuSections.json')
writeFileSync(outputPath, JSON.stringify(sections, null, 2))
console.log(`Generated ${sections.length} sections with ${sections.reduce((n, s) => n + s.items.length, 0)} items`)
