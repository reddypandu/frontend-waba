// Image imports
import diwali1 from "@/assets/templates/diwali-1.jpg";
import diwali2 from "@/assets/templates/diwali-2.jpg";
import holi1 from "@/assets/templates/holi-1.jpg";
import navratri1 from "@/assets/templates/navratri-1.jpg";
import ganesh1 from "@/assets/templates/ganesh-1.jpg";
import rakhi1 from "@/assets/templates/rakhi-1.jpg";
import eid1 from "@/assets/templates/eid-1.jpg";
import christmas1 from "@/assets/templates/christmas-1.jpg";
import newyear1 from "@/assets/templates/newyear-1.jpg";
import republic1 from "@/assets/templates/republic-1.jpg";
import independence1 from "@/assets/templates/independence-1.jpg";
import hospital1 from "@/assets/templates/hospital-1.jpg";
import interior1 from "@/assets/templates/interior-1.jpg";
import realestate1 from "@/assets/templates/realestate-1.jpg";
import restaurant1 from "@/assets/templates/restaurant-1.jpg";
import salon1 from "@/assets/templates/salon-1.jpg";
import gym1 from "@/assets/templates/gym-1.jpg";
import education1 from "@/assets/templates/education-1.jpg";

export interface FestivalTemplate {
  id;
  name;
  festival;
  category;
  month;
  day?;
  gradient;
  emoji;
  image;
  defaultText: {
    heading;
    subheading;
    footer;
  };
  colors: {
    bg1;
    bg2;
    text;
    accent;
  };
}

export const FESTIVAL_CATEGORIES = [
  "All",
  "Diwali",
  "Holi",
  "Navratri",
  "Ganesh Chaturthi",
  "Raksha Bandhan",
  "Eid",
  "Christmas",
  "New Year",
  "Republic Day",
  "Independence Day",
  "Hospital",
  "Interior Design",
  "Real Estate",
  "Restaurant",
  "Salon & Beauty",
  "Gym & Fitness",
  "Education",
] as const;

export const festivalTemplates: FestivalTemplate[] = [
  // ── Diwali ──
  {
    id: "diwali-1",
    name: "Diwali Golden Diyas",
    festival: "Diwali",
    category: "Diwali",
    month: 10,
    gradient: "from-amber-600 via-orange-500 to-yellow-400",
    emoji: "🪔",
    image: diwali1,
    defaultText: {
      heading: "Happy Diwali!",
      subheading: "Wishing you a festival of lights filled with joy & prosperity",
      footer: "From {{business_name}}",
    },
    colors,
  },
  {
    id: "diwali-2",
    name: "Diwali Festive Fireworks",
    festival: "Diwali",
    category: "Diwali",
    month: 10,
    gradient: "from-purple-700 via-pink-600 to-orange-400",
    emoji: "✨",
    image: diwali2,
    defaultText: {
      heading: "Shubh Deepawali",
      subheading: "May the divine light of Diwali spread peace, prosperity and happiness",
      footer: "Warm wishes from {{business_name}}",
    },
    colors,
  },
  // ── Holi ──
  {
    id: "holi-1",
    name: "Holi Colors Splash",
    festival: "Holi",
    category: "Holi",
    month: 3,
    gradient: "from-pink-500 via-purple-500 to-blue-500",
    emoji: "🎨",
    image: holi1,
    defaultText: {
      heading: "Happy Holi!",
      subheading: "Let the colors of Holi spread joy and love in your life",
      footer: "From {{business_name}}",
    },
    colors,
  },
  // ── Navratri ──
  {
    id: "navratri-1",
    name: "Navratri Festive Lights",
    festival: "Navratri",
    category: "Navratri",
    month: 10,
    gradient: "from-red-600 via-orange-500 to-yellow-400",
    emoji: "🙏",
    image: navratri1,
    defaultText: {
      heading: "Shubh Navratri",
      subheading: "May Goddess Durga bless you with strength and prosperity",
      footer: "From {{business_name}}",
    },
    colors,
  },
  // ── Ganesh Chaturthi ──
  {
    id: "ganesh-1",
    name: "Ganesh Chaturthi Blessings",
    festival: "Ganesh Chaturthi",
    category: "Ganesh Chaturthi",
    month: 9,
    gradient: "from-orange-500 via-red-500 to-pink-500",
    emoji: "🙏",
    image: ganesh1,
    defaultText: {
      heading: "Ganpati Bappa Morya!",
      subheading: "May Lord Ganesha remove all obstacles from your path",
      footer: "From {{business_name}}",
    },
    colors,
  },
  // ── Raksha Bandhan ──
  {
    id: "rakhi-1",
    name: "Raksha Bandhan Love",
    festival: "Raksha Bandhan",
    category: "Raksha Bandhan",
    month: 8,
    gradient: "from-pink-400 via-rose-400 to-red-400",
    emoji: "🧵",
    image: rakhi1,
    defaultText: {
      heading: "Happy Raksha Bandhan",
      subheading: "Celebrating the beautiful bond of love between siblings",
      footer: "From {{business_name}}",
    },
    colors,
  },
  // ── Eid ──
  {
    id: "eid-1",
    name: "Eid Mubarak",
    festival: "Eid",
    category: "Eid",
    month: 4,
    gradient: "from-emerald-600 via-teal-500 to-cyan-400",
    emoji: "🌙",
    image: eid1,
    defaultText: {
      heading: "Eid Mubarak!",
      subheading: "May this blessed day bring peace, happiness and prosperity",
      footer: "From {{business_name}}",
    },
    colors,
  },
  // ── Christmas ──
  {
    id: "christmas-1",
    name: "Merry Christmas",
    festival: "Christmas",
    category: "Christmas",
    month: 12,
    day: 25,
    gradient: "from-red-600 via-red-500 to-green-600",
    emoji: "🎄",
    image: christmas1,
    defaultText: {
      heading: "Merry Christmas!",
      subheading: "Wishing you a joyful holiday season filled with love and cheer",
      footer: "From {{business_name}}",
    },
    colors,
  },
  // ── New Year ──
  {
    id: "newyear-1",
    name: "Happy New Year 2026",
    festival: "New Year",
    category: "New Year",
    month: 1,
    day: 1,
    gradient: "from-indigo-600 via-purple-600 to-pink-500",
    emoji: "🎉",
    image: newyear1,
    defaultText: {
      heading: "Happy New Year 2026!",
      subheading: "Cheers to new beginnings, new adventures, and new memories",
      footer: "From {{business_name}}",
    },
    colors,
  },
  // ── Republic Day ──
  {
    id: "republic-1",
    name: "Republic Day",
    festival: "Republic Day",
    category: "Republic Day",
    month: 1,
    day: 26,
    gradient: "from-orange-500 via-white to-green-600",
    emoji: "🇮🇳",
    image: republic1,
    defaultText: {
      heading: "Happy Republic Day!",
      subheading: "Celebrating the spirit of our great nation",
      footer: "Jai Hind - {{business_name}}",
    },
    colors,
  },
  // ── Independence Day ──
  {
    id: "independence-1",
    name: "Independence Day",
    festival: "Independence Day",
    category: "Independence Day",
    month: 8,
    day: 15,
    gradient: "from-orange-400 via-white to-green-500",
    emoji: "🇮🇳",
    image: independence1,
    defaultText: {
      heading: "Happy Independence Day!",
      subheading: "Let us celebrate the freedom and glory of our nation",
      footer: "Jai Hind - {{business_name}}",
    },
    colors,
  },

  // ══════════════════════════════════
  //  BUSINESS TEMPLATES
  // ══════════════════════════════════

  // ── Hospital ──
  {
    id: "hospital-1",
    name: "Hospital - Health Checkup",
    festival: "Hospital",
    category: "Hospital",
    month: 1,
    gradient: "from-blue-600 via-cyan-500 to-teal-400",
    emoji: "🏥",
    image: hospital1,
    defaultText: {
      heading: "Your Health, Our Priority",
      subheading: "Book your annual health checkup today. Comprehensive packages starting ₹999",
      footer: "{{business_name}} | Call}",
    },
    colors,
  },
  // ── Interior Design ──
  {
    id: "interior-1",
    name: "Interior - Luxury Living",
    festival: "Interior Design",
    category: "Interior Design",
    month: 1,
    gradient: "from-amber-700 via-yellow-600 to-orange-400",
    emoji: "🏠",
    image: interior1,
    defaultText: {
      heading: "Transform Your Space",
      subheading: "Luxury interior design solutions for your dream home. Free consultation available",
      footer: "{{business_name}} | WhatsApp}",
    },
    colors,
  },
  // ── Real Estate ──
  {
    id: "realestate-1",
    name: "Real Estate - Dream Home",
    festival: "Real Estate",
    category: "Real Estate",
    month: 1,
    gradient: "from-sky-600 via-blue-500 to-indigo-500",
    emoji: "🏡",
    image: realestate1,
    defaultText: {
      heading: "Find Your Dream Home",
      subheading: "Premium properties in prime locations. Book your site visit today!",
      footer: "{{business_name}} | {{phone}}",
    },
    colors,
  },
  // ── Restaurant ──
  {
    id: "restaurant-1",
    name: "Restaurant - Special Menu",
    festival: "Restaurant",
    category: "Restaurant",
    month: 1,
    gradient: "from-red-700 via-orange-600 to-amber-500",
    emoji: "🍽️",
    image: restaurant1,
    defaultText: {
      heading: "Taste the Excellence",
      subheading: "Introducing our new gourmet menu. Dine-in or order online today!",
      footer: "{{business_name}} | Order Now}",
    },
    colors,
  },
  // ── Salon & Beauty ──
  {
    id: "salon-1",
    name: "Salon - Beauty Package",
    festival: "Salon & Beauty",
    category: "Salon & Beauty",
    month: 1,
    gradient: "from-pink-500 via-rose-400 to-fuchsia-400",
    emoji: "💅",
    image: salon1,
    defaultText: {
      heading: "Glow This Season",
      subheading: "Exclusive beauty packages with 30% OFF. Book your appointment now!",
      footer: "{{business_name}} | {{phone}}",
    },
    colors,
  },
  // ── Gym & Fitness ──
  {
    id: "gym-1",
    name: "Gym - Fitness Offer",
    festival: "Gym & Fitness",
    category: "Gym & Fitness",
    month: 1,
    gradient: "from-slate-800 via-blue-800 to-indigo-700",
    emoji: "💪",
    image: gym1,
    defaultText: {
      heading: "Transform Your Body",
      subheading: "Join now & get 50% OFF on annual membership. Limited time offer!",
      footer: "{{business_name}} | Enroll}",
    },
    colors,
  },
  // ── Education ──
  {
    id: "education-1",
    name: "Education - Admissions Open",
    festival: "Education",
    category: "Education",
    month: 1,
    gradient: "from-blue-600 via-indigo-500 to-purple-500",
    emoji: "🎓",
    image: education1,
    defaultText: {
      heading: "Admissions Open 2026",
      subheading: "Shape your future with us. Enroll now for new academic session!",
      footer: "{{business_name}} | {{phone}}",
    },
    colors,
  },
];
