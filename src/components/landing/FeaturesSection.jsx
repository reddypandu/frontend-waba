import { motion } from "framer-motion";
import { MessageSquare, Users, BarChart3, Send, Zap, Shield, Bot, Bell, GitBranch } from "lucide-react";

const features = [
  {
    icon: Send,
    title: "Bulk Messaging",
    description: "Send thousands of personalized WhatsApp messages with template support, scheduling, and real-time queue delivery.",
    gradient: "from-green-500 to-emerald-600",
    glow: "hsl(93 69% 41% / 0.15)",
  },
  {
    icon: Users,
    title: "Contact Management",
    description: "Import, segment, and manage contacts with tags, opt-in tracking, CSV uploads, and smart deduplication.",
    gradient: "from-blue-500 to-cyan-600",
    glow: "hsl(210 100% 60% / 0.15)",
  },
  {
    icon: MessageSquare,
    title: "Template Builder",
    description: "Create and submit WhatsApp message templates with the Meta approval workflow integrated directly.",
    gradient: "from-violet-500 to-purple-600",
    glow: "hsl(270 80% 60% / 0.15)",
  },
  {
    icon: Bot,
    title: "AI Auto Replies",
    description: "Set smart keyword-based auto-replies and chatbot flows that engage customers 24/7 without manual effort.",
    gradient: "from-orange-500 to-red-600",
    glow: "hsl(25 100% 60% / 0.15)",
  },
  {
    icon: GitBranch,
    title: "Visual Workflows",
    description: "Drag-and-drop automation builder. Trigger sequences, delays, and branching logic based on user behavior.",
    gradient: "from-pink-500 to-rose-600",
    glow: "hsl(340 80% 60% / 0.15)",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track delivery, read rates, conversion, and campaign ROI with beautiful, live dashboards.",
    gradient: "from-yellow-500 to-amber-600",
    glow: "hsl(45 100% 55% / 0.15)",
  },
  {
    icon: Zap,
    title: "Instant Campaigns",
    description: "Launch campaigns immediately or schedule for perfect timing. Built with a robust queue-based delivery engine.",
    gradient: "from-teal-500 to-green-600",
    glow: "hsl(170 70% 45% / 0.15)",
  },
  {
    icon: Bell,
    title: "Live Inbox",
    description: "Two-way messaging inbox for your team to handle incoming replies, support queries, and conversations in real time.",
    gradient: "from-sky-500 to-blue-600",
    glow: "hsl(200 100% 55% / 0.15)",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, role-based access control, and GDPR-compliant data handling for peace of mind.",
    gradient: "from-gray-500 to-slate-600",
    glow: "hsl(220 20% 50% / 0.15)",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32 bg-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, hsl(93 69% 41%), transparent)" }}
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
             Powerful Features
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mt-4 mb-6">
            Everything You Need to
            <br />
            <span className="text-gradient">Rule WhatsApp Marketing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Built for businesses of all sizes — from solo entrepreneurs to enterprise teams sending millions of messages every month.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariant}
              className="group relative rounded-2xl p-6 border border-border/50 bg-card/60 backdrop-blur-sm card-hover overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Hover glow background */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 80% 60% at 20% 20%, ${feature.glow}, transparent)` }}
              />

              {/* Icon */}
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="relative text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="relative text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

              {/* Bottom gradient border on hover */}
              <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
