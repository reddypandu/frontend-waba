import { motion } from "framer-motion";

const industries = [
  {
    id: 1,
    image: "/industry_automotive.jpg",
    company: "AutoDrive",
    stat: "13%",
    description: "after call work reduction",
  },
  {
    id: 2,
    image: "/industry_restaurant.jpg",
    company: "DineHub",
    stat: "21M+",
    description: "messages sent monthly",
  },
  {
    id: 3,
    image: "/industry_healthcare.jpg",
    company: "CarePlus",
    stat: "99%",
    description: "appointment attendance rate",
  },
  {
    id: 4,
    image: "/industry_ecommerce.jpg",
    company: "ShopEase",
    stat: "35%",
    description: "increase in repeat purchases",
  },
  {
    id: 5,
    image: "/industry_logistics.jpg",
    company: "FastTrack",
    stat: "40%",
    description: "faster delivery updates",
  }
];

export default function IndustriesSection() {
  // Duplicate array for seamless marquee loop
  const marqueeItems = [...industries, ...industries, ...industries];

  return (
    <section className="py-16 bg-[#51ad5a] overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5bc266] via-[#51ad5a] to-[#44984d]"></div>

      <div className="container mx-auto px-4 relative mb-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-extrabold text-white mb-4"
        >
          Powering Every Industry
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white text-lg max-w-2xl mx-auto"
        >
          See how leading brands use YesTick AI to drive extraordinary results across various sectors.
        </motion.p>
      </div>

      <div className="relative w-full overflow-hidden flex py-10">
        <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]">
          {marqueeItems.map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`}
              className="relative w-[280px] md:w-[320px] h-[320px] mx-4 rounded-3xl overflow-hidden -skew-x-[8deg] group shrink-0 shadow-2xl border border-slate-800 bg-slate-900"
            >
              {/* Image Background */}
              <div className="absolute inset-0 skew-x-[8deg] scale-[1.3]">
                <img 
                  src={item.image} 
                  alt={item.company}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 skew-x-[8deg] flex flex-col justify-end p-6 z-10 pointer-events-none">
                <div className="flex items-center gap-3 mb-4 opacity-90 transform translate-x-[-10px]">
                  <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center font-bold text-slate-900 text-sm">
                    {item.company.charAt(0)}
                  </div>
                  <span className="text-white font-bold tracking-widest uppercase text-sm">{item.company}</span>
                </div>
                
                <h3 className="text-5xl font-black text-white mb-2 drop-shadow-md tracking-tighter transform translate-x-[-10px]">
                  {item.stat}
                </h3>
                
                <p className="text-slate-300 font-bold text-base leading-tight transform translate-x-[-10px]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
