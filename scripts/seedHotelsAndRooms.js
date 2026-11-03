require('dotenv').config();
const mongoose = require('mongoose');
const HotelProperty = require('../model/HotelProperty');
const Room = require('../model/Room');

const initialHotels = [
  {
    name: 'Hestia Stay Kasana – Kasna Site 4, Greater Noida',
    slug: 'hestia-stay-kasana',
    subtitle: 'A strategically positioned hospitality asset offering comfort, functionality, and service reliability.',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/hotel%20(2).webp',
    accommodationInfo: 'Total 16 Thoughtfully Designed Rooms',
    description: 'Hestia Stay is a strategically positioned hospitality asset offering a balanced blend of comfort, functionality, and service reliability. Located in Kasna Site 4 near the Oppo Factory, the property is well-aligned to cater to corporate travellers, industrial visitors, and short-stay guests seeking dependable accommodation in the Greater Noida industrial corridor.\n\nWith a compact yet well-curated inventory of 16 thoughtfully designed rooms, the hotel is equipped to deliver a streamlined guest experience with a strong emphasis on operational discipline and service consistency.',
    price: 2999,
    rating: 4.8,
    reviewsCount: 245,
    location: {
      area: 'Kasna Site 4',
      city: 'Greater Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      distance: 'Near Oppo Factory',
      accessibility: 'Adjacent to major corporate hubs and industrial zones, ensuring smooth accessibility for industrial clients, vendors, and corporate partners',
      address: 'Kasna Site 4, Near Oppo Factory, Greater Noida, Uttar Pradesh',
    },
    gallery: [
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/double%20bed%20room.webp',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/bed%20room.webp',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/double%20bed%20room%20(3).webp',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/almirah%20with%20tv.webp',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/double%20bed%20room%20(2).webp',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/bed%20room%20with%20almirah.webp',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Room%20image/DOUBLE%20BEDROOM.webp?updatedAt=1770613660677',
    ],
    amenities: [
      { name: 'Free High-Speed WiFi', icon: 'WiFi' },
      { name: 'Air Conditioning', icon: 'AC' },
      { name: 'LED Smart TV', icon: 'TV' },
      { name: 'Clean & Hygienic Rooms', icon: 'Housekeeping' },
      { name: 'Power Backup (24/7)', icon: 'PowerBackup' },
      { name: 'RO Water Supply', icon: 'ROWater' },
      { name: '24/7 Hot Water (Geyser)', icon: 'Geyser' },
      { name: 'Double Bed with Premium Linen', icon: 'DoubleBed' },
      { name: 'Balcony Rooms Available', icon: 'Balcony' },
      { name: 'Daily Housekeeping', icon: 'Housekeeping' },
      { name: 'Room Service', icon: 'RoomService' },
      { name: '24/7 Security', icon: 'Security' },
      { name: 'CCTV Surveillance', icon: 'CCTV' },
      { name: 'Free Secure Parking', icon: 'Parking' },
      { name: 'Laundry Service', icon: 'Laundry' },
      { name: 'Front Desk Assistance', icon: 'Reception' },
      { name: 'Restaurant Facility', icon: 'Restaurant' },
    ],
    features: [
      '16 Fully Appointed Rooms: Designed to maximize comfort and utility for both business and leisure travellers',
      'LED Television in all rooms',
      'Geyser for round-the-clock hot water',
      'Double Bed with premium linen',
      'Balcony Rooms available for enhanced guest experience',
      'Neat and clean washrooms with standard toiletries',
      'Daily housekeeping aligned to quality benchmarks',
      'Prime location adjacent to major corporate hubs and Oppo Factory',
    ],
    restaurant: {
      name: 'Hestia Dining',
      description: 'Serving delicious multi-cuisine meals and in-room dining.',
      cuisine: ['North Indian', 'Continental', 'Chinese'],
      timings: '7:00 AM - 11:00 PM',
      image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Restaurant/Hestia132.webp',
    },
    reviews: [
      { name: 'Rajesh Kumar', rating: 5, comment: 'Perfect for business stay near Oppo Factory. Clean and comfortable rooms!', date: 'March 2024' },
      { name: 'Amit Singh', rating: 5, comment: 'Great location for industrial visits. Professional service and well-maintained property.', date: 'February 2024' },
      { name: 'Priya Sharma', rating: 4, comment: 'Good value for money. The garden area is a nice touch.', date: 'January 2024' },
    ],
    policies: {
      checkIn: '1:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Free cancellation up to 24 hours before check-in',
      rules: [
        'Valid ID proof required at check-in',
        'Smoking is prohibited in rooms',
        'Outside food and beverages not permitted',
        'Guests are responsible for any damage to hotel property',
      ],
    },
    contact: {
      phone: '+91 8130622279',
      email: 'info@hestiahotels.com',
      address: 'Kasna Site 4, Near Oppo Factory, Greater Noida, Uttar Pradesh',
    },
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3508.5!2d77.4950!3d28.4580',
    nearbyPlaces: [
      'Oppo Factory - 0.5 km',
      'Corporate Hubs - 1 km',
      'Industrial Zones - 2 km',
      'Greater Noida - 5 km',
      'Kasna Metro Station - 3 km',
    ],
    seo: {
      metaTitle: 'Hestia Stay Kasana – Budget Hotel Near Oppo Factory Greater Noida',
      metaDescription: 'Book your stay at Hestia Stay Kasna Site 4 Greater Noida. Premium rooms, high-speed WiFi, 24/7 security, close to industrial hubs.',
    },
    isActive: true,
    order: 1,
  },
  {
    name: 'Hestia Hotel & Restaurant – Knowledge Park III, Greater Noida',
    slug: 'hestia-hotel-&-Restaurant-Knowledge-Park-3',
    subtitle: 'A flagship asset delivering elevated guest experiences through strategic location and service excellence.',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/view%20of%20best%20hotel%20in%20knowledge%20part%203.webp',
    accommodationInfo: 'Total 36 Rooms - 27 Deluxe Rooms & 9 Super Deluxe Rooms',
    description: 'Hestia Hotel & Restaurant is a flagship asset under the DSY Hospitality portfolio, positioned to deliver an elevated guest experience through its strategic location, contemporary facilities, and service-driven operational framework. Situated in Knowledge Park III near the Expo Centre, the property serves as a preferred choice for corporate travellers, exhibition delegates, families, and leisure guests.',
    price: 3499,
    rating: 4.9,
    reviewsCount: 312,
    location: {
      area: 'Knowledge Park III',
      city: 'Greater Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      distance: 'Just 1.5 km from India Expo Centre',
      accessibility: 'Excellent accessibility to corporate parks, educational hubs, metro stations, and commercial zones',
      address: 'Knowledge Park III, Near Expo Centre, Greater Noida, Uttar Pradesh',
    },
    gallery: [
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/hestia-hotel-&-Restaurant-Knowledge-Park-3/best%20tv%20with%20kettle%20and%20chair.webp?updatedAt=1770613660742',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/hestia-hotel-&-Restaurant-Knowledge-Park-3/best%20full%20view%20of%20dining%20table.webp?updatedAt=1770613661065',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/hestia-hotel-&-Restaurant-Knowledge-Park-3/bedroom%20with%20pillow%20and%20lamp.webp?updatedAt=1770613660689',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/hestia-hotel-&-Restaurant-Knowledge-Park-3/kettle%20with%20coffee%20packet.webp?updatedAt=1770613661409',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/hotel%20(2).webp?updatedAt=1770613165742',
    ],
    amenities: [
      { name: 'Free High-Speed WiFi', icon: 'WiFi' },
      { name: 'Air Conditioning', icon: 'AC' },
      { name: 'Smart LED TV', icon: 'TV' },
      { name: 'Multi-Cuisine Restaurant', icon: 'Restaurant' },
      { name: 'Conference & Meeting Hall', icon: 'Reception' },
      { name: 'Daily Housekeeping', icon: 'Housekeeping' },
      { name: '24/7 Power Backup', icon: 'PowerBackup' },
      { name: 'Electric Kettle in Rooms', icon: 'Water' },
      { name: 'Secure Parking', icon: 'Parking' },
      { name: '24/7 Room Service', icon: 'RoomService' },
    ],
    features: [
      '36 contemporary guest rooms with high-speed internet and premium furnishings',
      'Multi-cuisine in-house restaurant with live kitchen options',
      'Dedicated conference space for corporate meetings and seminars',
      'Proximity to India Expo Mart (1.5 km)',
    ],
    restaurant: {
      name: 'The Hestia Spice & Dine',
      description: 'Exquisite fine dining experience curated by professional chefs with rich North Indian, Asian, and Continental flavours.',
      cuisine: ['North Indian', 'Chinese', 'Mughlai', 'Continental'],
      timings: '6:30 AM - 11:30 PM',
      image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/hestia-hotel-&-Restaurant-Knowledge-Park-3/best%20full%20view%20of%20dining%20table.webp?updatedAt=1770613661065',
    },
    reviews: [
      { name: 'Sunil Mehta', rating: 5, comment: 'Stayed during the Auto Expo. Exceptional service and food!', date: 'February 2024' },
      { name: 'Ananya Roy', rating: 5, comment: 'Spacious rooms and very polite staff. Great stay!', date: 'January 2024' },
    ],
    policies: {
      checkIn: '12:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Free cancellation up to 48 hours prior to arrival',
      rules: ['Government approved photo ID required', 'Parties not allowed in guest rooms'],
    },
    contact: {
      phone: '+91 8130622279',
      email: 'info@hestiahotels.com',
      address: 'Knowledge Park III, Near Expo Centre, Greater Noida, Uttar Pradesh',
    },
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3508.5!2d77.4950!3d28.4580',
    nearbyPlaces: [
      'India Expo Mart - 1.5 km',
      'Pari Chowk - 3 km',
      'Knowledge Park 2 Metro - 2 km',
      'Noida-Greater Noida Expressway - 4 km',
    ],
    seo: {
      metaTitle: 'Hestia Hotel & Restaurant – Knowledge Park III Greater Noida Near Expo Mart',
      metaDescription: 'Stay at Hestia Hotel in Knowledge Park 3 Greater Noida near Expo Mart. 36 luxury rooms, fine restaurant, corporate conferences.',
    },
    isActive: true,
    order: 2,
  },
  {
    name: 'The Hestia Hotel, Sector 132',
    slug: 'the-hestia-hotel-sector-132',
    subtitle: 'Contemporary elegance and seamless comfort right on the Noida Expressway corridor.',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Restaurant/Hestia132.webp',
    accommodationInfo: 'Executive and Premium Suites with Expressway Connectivity',
    description: 'The Hestia Hotel at Sector 132 Noida offers business and leisure travelers an oasis of luxury, featuring world-class amenities, premium room finishes, and high-speed transit connections along the Noida-Greater Noida Expressway.',
    price: 3999,
    rating: 4.8,
    reviewsCount: 267,
    location: {
      area: 'Sector 132',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      distance: 'Adjacent to Step By Step School & Corporate Parks',
      accessibility: 'Direct connection to Noida-Greater Noida Expressway and DND Flyway',
      address: 'Sector 132, Expressway, Noida, Uttar Pradesh',
    },
    gallery: [
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Restaurant/Hestia132.webp',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Room%20image/MODERN%20ROOM.webp?updatedAt=1770613660986',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Room%20image/DOUBLE%20BEDROOM.webp?updatedAt=1770613660677',
    ],
    amenities: [
      { name: 'High-Speed WiFi', icon: 'WiFi' },
      { name: 'Fitness Centre', icon: 'Gym' },
      { name: 'Secure Valet Parking', icon: 'Parking' },
      { name: 'All-Day Dining', icon: 'Restaurant' },
      { name: 'Smart Climate Control', icon: 'AC' },
    ],
    features: ['Direct expressway access', 'Premium soundproof glass windows', 'Executive workstation desks'],
    restaurant: {
      name: 'Expressway Cafe & Grill',
      description: 'Gourmet dining and quick bites for busy corporate travelers.',
      cuisine: ['Continental', 'Pan-Asian', 'North Indian'],
      timings: '24 Hours',
      image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Restaurant/Hestia132.webp',
    },
    reviews: [
      { name: 'Rohan Verma', rating: 5, comment: 'Best hotel on Noida Expressway for business trips.', date: 'February 2024' },
    ],
    policies: {
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      cancellation: 'Free cancellation up to 24 hours prior',
      rules: ['Valid Gov ID proof required'],
    },
    contact: {
      phone: '+91 8130622279',
      email: 'info@hestiahotels.com',
      address: 'Sector 132, Expressway, Noida, Uttar Pradesh',
    },
    mapUrl: '',
    nearbyPlaces: ['Advant Navis Business Park - 2 km', 'Amity University - 6 km', 'Sector 137 Metro - 3 km'],
    seo: {
      metaTitle: 'The Hestia Hotel Sector 132 Noida Expressway',
      metaDescription: 'Book your stay at The Hestia Hotel Sector 132 Noida Expressway. Executive rooms, gym, fine dining.',
    },
    isActive: true,
    order: 3,
  },
  {
    name: 'The Hestia Hotel, Dwarka',
    slug: 'the-hestia-hotel-dwarka',
    subtitle: 'Prime luxury and tranquility close to IGI Airport and Yashobhoomi Convention Centre.',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Home%20page%20images/Bright%20interior.webp?updatedAt=1770613661022',
    accommodationInfo: 'Luxury Rooms & Suites near IGI Airport Delhi',
    description: 'Located in the heart of Dwarka, New Delhi, The Hestia Hotel offers an unmatched blend of international standards and warm Indian hospitality. Perfectly positioned near IGI Airport and Yashobhoomi (IICC), it is the prime choice for airport transit and conference visitors.',
    price: 4299,
    rating: 4.7,
    reviewsCount: 189,
    location: {
      area: 'Dwarka',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      distance: '15 mins from IGI Airport T3',
      accessibility: 'Connected to Dwarka Sector 21 Metro and Airport Express Line',
      address: 'Sector 19B, Dwarka, New Delhi',
    },
    gallery: [
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Home%20page%20images/Bright%20interior.webp?updatedAt=1770613661022',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Terrace%20balcony%20garden%20area/HestiaDwarks.avif',
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Room%20image/LUXURY%20ROOM%201.webp?updatedAt=1770613660726',
    ],
    amenities: [
      { name: 'Complimentary High-Speed WiFi', icon: 'WiFi' },
      { name: 'Airport Transfer Facility', icon: 'Parking' },
      { name: 'Rooftop Lounge & Bar', icon: 'Restaurant' },
      { name: 'Spa & Wellness', icon: 'Spa' },
      { name: '24/7 Room Service', icon: 'RoomService' },
    ],
    features: ['15 minutes to Indira Gandhi International Airport', 'Yashobhoomi Convention Center access', 'Luxury bath fittings & king beds'],
    restaurant: {
      name: 'Skyline Bistro & Bar',
      description: 'Rooftop cocktail lounge and culinary delicacies.',
      cuisine: ['Global', 'Pan-Asian', 'Tandoori'],
      timings: '11:00 AM - 12:00 Midnight',
      image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Terrace%20balcony%20garden%20area/HestiaDwarks.avif',
    },
    reviews: [
      { name: 'Kavita Chawla', rating: 5, comment: 'Superb stay before an early morning flight. Fast checkout and friendly staff.', date: 'January 2024' },
    ],
    policies: {
      checkIn: '2:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Free cancellation up to 24 hours prior',
      rules: ['Valid Passport or National ID required for check-in'],
    },
    contact: {
      phone: '+91 8130622279',
      email: 'info@hestiahotels.com',
      address: 'Sector 19B, Dwarka, New Delhi',
    },
    mapUrl: '',
    nearbyPlaces: ['IGI Airport T3 - 8 km', 'Yashobhoomi IICC - 4 km', 'Dwarka Sector 21 Metro - 2.5 km'],
    seo: {
      metaTitle: 'The Hestia Hotel Dwarka New Delhi Near IGI Airport',
      metaDescription: 'Luxury hotel in Dwarka New Delhi near IGI Airport & Yashobhoomi. Book direct for best rates.',
    },
    isActive: true,
    order: 4,
  },
];

const initialRooms = [
  {
    name: 'Deluxe Room',
    hotelSlug: 'all',
    hotelName: 'All Properties',
    roomType: 'Deluxe Room',
    description: 'Cozy room ideal for couples, featuring elegant furnishing, premium linen, and modern amenities.',
    beds: 1,
    bedType: 'Double Bed',
    guests: 2,
    price: 2999,
    discountPrice: 2499,
    roomSize: '240 sq.ft',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/hestia-hotel-&-Restaurant-Knowledge-Park-3/full%20view%20of%20bedroom.webp?updatedAt=1770613661048',
    gallery: [
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/hestia-hotel-&-Restaurant-Knowledge-Park-3/bedroom%20with%20pillow%20and%20lamp.webp?updatedAt=1770613660689',
    ],
    amenities: ['Free WiFi', 'Air Conditioning', 'LED Smart TV', 'Hot Water Geyser', 'Housekeeping', 'Electric Kettle'],
    features: ['City or garden view', 'Double bed with orthopaedic mattress', 'Complimentary mineral water'],
    status: 'available',
    isFeatured: true,
    order: 1,
  },
  {
    name: 'Super Deluxe Room',
    hotelSlug: 'all',
    hotelName: 'All Properties',
    roomType: 'Super Deluxe Room',
    description: 'Comfortable and spacious room with modern amenities, city-view window, and dedicated workstation.',
    beds: 2,
    bedType: 'Twin / King Bed',
    guests: 3,
    price: 3500,
    discountPrice: 3199,
    roomSize: '300 sq.ft',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Room%20image/DOUBLE%20BEDROOM.webp?updatedAt=1770613660677',
    gallery: [
      'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Room%20image/MODERN%20ROOM.webp?updatedAt=1770613660986',
    ],
    amenities: ['High-Speed WiFi', 'Air Conditioning', '43-inch Smart TV', 'Mini Fridge', 'Workstation', 'Tea/Coffee Maker'],
    features: ['Extra spacious layout', 'Balcony seating available', 'Premium toiletries'],
    status: 'available',
    isFeatured: true,
    order: 2,
  },
  {
    name: 'Junior Suite',
    hotelSlug: 'all',
    hotelName: 'All Properties',
    roomType: 'Junior Suite',
    description: 'A spacious junior suite offering a separate living area, stylish décor, and luxury fixtures.',
    beds: 1,
    bedType: 'King Bed',
    guests: 2,
    price: 4000,
    discountPrice: 3699,
    roomSize: '380 sq.ft',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Room%20image/JUNIOR%20SUITS.webp?updatedAt=1770613660619',
    gallery: [],
    amenities: ['High-Speed WiFi', 'Separate Living Area', 'Two LED TVs', 'Mini Bar', 'Bathrobe & Slippers', 'In-room safe'],
    features: ['Plush sofa lounge', 'King size bed', 'Express check-in privileges'],
    status: 'available',
    isFeatured: true,
    order: 3,
  },
  {
    name: 'Luxury Room',
    hotelSlug: 'all',
    hotelName: 'All Properties',
    roomType: 'Luxury Room',
    description: 'Premium luxury room equipped with high-end facilities, plush furnishings, and a beautiful view.',
    beds: 2,
    bedType: 'King Bed + Sofa Bed',
    guests: 4,
    price: 5000,
    discountPrice: 4499,
    roomSize: '450 sq.ft',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Room%20image/LUXURY%20ROOM%201.webp?updatedAt=1770613660726',
    gallery: [],
    amenities: ['Ultra-fast WiFi', 'Bathtub & Geyser', 'Smart Room Controls', 'Private Balcony', 'Welcome Fruit Basket'],
    features: ['Panoramic skyline view', 'Luxury linen 400 thread count', '24/7 dedicated butler call'],
    status: 'available',
    isFeatured: true,
    order: 4,
  },
  {
    name: 'Standard Room – Kasana',
    hotelSlug: 'hestia-stay-kasana',
    hotelName: 'Hestia Stay Kasana – Kasna Site 4, Greater Noida',
    roomType: 'Standard Room',
    description: 'Well-appointed room with LED TV, geyser, and double bed with premium linen near Oppo Factory.',
    beds: 1,
    bedType: 'Double Bed',
    guests: 2,
    price: 2999,
    discountPrice: null,
    roomSize: '220 sq.ft',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/hestia-hotel-&-Restaurant-Knowledge-Park-3/bedroom%20with%20pillow%20and%20lamp.webp?updatedAt=1770613660689',
    amenities: ['Free WiFi', 'AC', 'LED TV', 'Hot Water', 'Double Bed'],
    status: 'available',
    isFeatured: false,
    order: 5,
  },
  {
    name: 'Balcony Room – Kasana',
    hotelSlug: 'hestia-stay-kasana',
    hotelName: 'Hestia Stay Kasana – Kasna Site 4, Greater Noida',
    roomType: 'Balcony Room',
    description: 'Enhanced room with private balcony, LED TV, hot water, and premium amenities.',
    beds: 1,
    bedType: 'Double Bed',
    guests: 2,
    price: 3499,
    discountPrice: null,
    roomSize: '260 sq.ft',
    image: 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/Categoery%20vise/Room%20image/MODERN%20ROOM.webp?updatedAt=1770613660986',
    amenities: ['Private Balcony', 'Free WiFi', 'AC', 'LED TV', 'Hot Water', 'Tea Kettle'],
    status: 'available',
    isFeatured: false,
    order: 6,
  },
];

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hestia';
  console.log('Connecting to MongoDB at:', uri);
  await mongoose.connect(uri);

  console.log('Seeding Hotel Properties...');
  for (const hotel of initialHotels) {
    const updated = await HotelProperty.findOneAndUpdate(
      { slug: hotel.slug },
      { $set: hotel },
      { upsert: true, new: true }
    );
    console.log(`✓ Hotel property ready: ${updated.name} (${updated.slug})`);
  }

  // Link rooms to their hotelId if hotel exists
  console.log('Seeding Rooms...');
  for (const room of initialRooms) {
    let hotelId = null;
    if (room.hotelSlug && room.hotelSlug !== 'all') {
      const hotel = await HotelProperty.findOne({ slug: room.hotelSlug });
      if (hotel) {
        hotelId = hotel._id;
        room.hotelName = hotel.name;
      }
    }
    const query = { name: room.name, hotelSlug: room.hotelSlug };
    const update = { ...room, hotelId };
    const savedRoom = await Room.findOneAndUpdate(query, { $set: update }, { upsert: true, new: true });
    console.log(`✓ Room ready: ${savedRoom.name} (${savedRoom.hotelSlug})`);
  }

  console.log('Seed completed successfully with ZERO data loss!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
