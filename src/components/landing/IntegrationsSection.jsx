import { MessageCircle, ShoppingBag, Zap, Cloud, Target, Slack, Trello, Mail, Instagram, MessageSquare } from "lucide-react";

const partners = [
  { name: "WhatsApp", icon: MessageCircle, color: "text-emerald-500" },
  { name: "Shopify", icon: ShoppingBag, color: "text-green-600" },
  { name: "Zapier", icon: Zap, color: "text-orange-500" },
  { name: "Salesforce", icon: Cloud, color: "text-blue-500" },
  { name: "HubSpot", icon: Target, color: "text-orange-600" },
  { name: "Slack", icon: Slack, color: "text-purple-600" },
  { name: "Trello", icon: Trello, color: "text-blue-400" },
  { name: "Gmail", icon: Mail, color: "text-red-500" },
  { name: "Instagram", icon: Instagram, color: "text-pink-600" },
  { name: "Messenger", icon: MessageSquare, color: "text-blue-600" },
];

const IntegrationsSection = () => {
  return (
    <section className="py-24 bg-white overflow-hidden border-t border-slate-100 relative">
      <div className="container mx-auto px-4 mb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 mb-4 px-4 py-1.5 rounded-full bg-brand-green-50 text-brand-green-700 text-[10px] font-bold tracking-widest uppercase border border-brand-green-100">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-green-500" />
          Integrations & Partners
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Works with tools <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green-500 to-emerald-300">you already use</span>
        </h2>

        {/* Subheading */}
        <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
          Connect your favourite platforms in minutes — no engineering required.
        </p>
      </div>

      {/* Marquees Container */}
      <div className="flex flex-col gap-6 relative max-w-[100vw]">
        {/* Fade Out Gradients for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Row 1: Right to Left */}
        <div className="flex w-[200%] animate-marquee-left hover:pause-animation">
          <div className="flex gap-6 w-1/2 justify-around pl-6">
            {[...partners, ...partners].slice(0, 8).map((partner, i) => (
              <PartnerCard key={`top-1-${i}`} partner={partner} />
            ))}
          </div>
          <div className="flex gap-6 w-1/2 justify-around pl-6">
            {[...partners, ...partners].slice(0, 8).map((partner, i) => (
              <PartnerCard key={`top-2-${i}`} partner={partner} />
            ))}
          </div>
        </div>

        {/* Row 2: Left to Right */}
        <div className="flex w-[200%] animate-marquee-right hover:pause-animation">
          <div className="flex gap-6 w-1/2 justify-around pl-6">
            {[...partners, ...partners].slice(5, 13).map((partner, i) => (
              <PartnerCard key={`bot-1-${i}`} partner={partner} />
            ))}
          </div>
          <div className="flex gap-6 w-1/2 justify-around pl-6">
            {[...partners, ...partners].slice(5, 13).map((partner, i) => (
              <PartnerCard key={`bot-2-${i}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const PartnerCard = ({ partner }) => (
  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 w-48 sm:w-56 shrink-0 transition-transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer">
    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
      <partner.icon className={`w-5 h-5 ${partner.color}`} />
    </div>
    <span className="font-bold text-slate-700 text-sm sm:text-base">{partner.name}</span>
  </div>
);

export default IntegrationsSection;
