import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown } from "lucide-react"; // Import Crown icon
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free Trial",
    price: "Free",
    period: "", // No period for free
    description: "Explore basic features",
    features: [
      "10 Contacts",
      "Connect WhatsApp Business",
      "Basic Messaging",
    ],
    cta: "Start Free Trial",
    popular: false,
    gradient: "from-gray-400 to-gray-500", // Neutral gradient for free
  },
  {
    name: "Paid Plan",
    price: "₹30,000",
    period: "/year",
    description: "Unlock full potential",
    features: [
      "Send bulk WhatsApp campaigns",
      "Manage chats in a Shared Team Inbox & set up simple greeting / OOO automations",
      "Unlimited Messages (Based on your WhatsApp Number)",
      "Unlimited Contacts",
      "Auto Replies",
      "Auto Work flows",
    ],
    cta: "Upgrade Now",
    popular: true,
    gradient: "from-blue-500 to-cyan-600",
  },
];

const PricingSection = () => {
  return (
    <section
      id="pricing"
      className="relative py-32 bg-muted/30 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] blur-3xl opacity-5 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, hsl(93 69% 41%), transparent)",
        }}
      />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="badge-primary mb-4 inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            Transparent Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mt-4 mb-6">
            Simple Plans,
            <br />
            <span className="text-gradient">Extraordinary Results</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No hidden fees. No contracts. Cancel anytime.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`relative rounded-3xl p-8 border transition-all duration-300 ${
                plan.popular
                  ? "border-primary bg-card shadow-xl scale-105"
                  : "border-border bg-card/60 hover:border-primary/50"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <span className="bg-primary text-primary-foreground text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan name & description */}
              <div
                className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} items-center justify-center mb-4 shadow-lg`}
              >
                {plan.name === "Free Trial" ? <Zap className="w-5 h-5 text-white" /> : <Crown className="w-5 h-5 text-white" />}
              </div>
              <h3 className="text-2xl font-extrabold text-foreground">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-7 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-sm">
                  {plan.period}
                </span>
              </div>

              {/* CTA */}
              <Button
                asChild
                className={`w-full h-11 rounded-xl font-bold mb-8 ${plan.popular ? "gradient-primary text-white shadow-lg" : ""}`}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link to="/login">{plan.cta}</Link>
              </Button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-foreground/80"
                  >
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
