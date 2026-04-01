import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Users, BarChart3, Zap, Star, Shield } from "lucide-react";
import { motion } from "framer-motion";

const floatingMessages = [
  { name: "Priya S.", msg: "Order confirmed 🎉", time: "2m ago", avatar: "P", color: "from-green-500 to-emerald-600" },
  { name: "Raj M.", msg: "Thanks for the update!", time: "5m ago", avatar: "R", color: "from-blue-500 to-cyan-600" },
  { name: "Neha K.", msg: "When will it arrive?", time: "8m ago", avatar: "N", color: "from-purple-500 to-pink-600" },
];

const stats = [
  { icon: Users, value: "....", label: "Businesses", color: "text-green-400" },
  { icon: MessageSquare, value: "....", label: "Messages Sent", color: "text-blue-400" },
  { icon: BarChart3, value: "....", label: "Delivery Rate", color: "text-yellow-400" },
  { icon: Zap, value: "....", label: "Faster Growth", color: "text-purple-400" },
];

const AnimatedDots = () => (
  <span className="inline-flex tracking-widest">
    {[0, 1, 2, 3].map((i) => (
      <motion.span
        key={i}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
      >
        .
      </motion.span>
    ))}
  </span>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 animated-grid opacity-40" />
      <div className="absolute inset-0 hero-glow pointer-events-none" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(93 69% 41%), transparent)" }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(210 100% 60%), transparent)" }} />

      <div className="container relative mx-auto px-4 py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <span className="badge-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                #1 WhatsApp Business API Platform
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-6">
              Scale Your Brand
              <br />
              <span className="text-gradient">on WhatsApp</span>
              <br />
              <span className="text-foreground/70 text-4xl md:text-5xl lg:text-6xl">like Never Before</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
              Send bulk messages, automate conversations, and track campaigns in real-time — all powered by the official Meta WhatsApp Business API.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                asChild
                className="text-base px-8 h-14 rounded-xl font-bold shadow-btn hover:shadow-glow hover:scale-105 transition-all duration-200"
              >
                <Link to="/register">
                  Start Free — No Card Needed <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="text-base px-8 h-14 rounded-xl font-semibold glass-light hover:bg-white/8 transition-all duration-200 border border-white/10"
              >
                <a href="#features">
                  See All Features
                </a>
              </Button>
            </div>

            {/* Micro trust signals */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-1">4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-green-400" />
                Meta Official Partner
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                14-day free trial
              </div>
            </div>
          </motion.div>

          {/* Right: Animated UI Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Main Dashboard Card */}
            <div className="relative glass rounded-3xl p-6 shadow-elevated animate-float-slow">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-muted-foreground">Campaign Performance</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">Diwali Sale 2025</p>
                </div>
                <div className="badge-primary">Live ●</div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Sent", value: "12,450", color: "text-blue-400" },
                  { label: "Delivered", value: "12,201", color: "text-green-400" },
                  { label: "Read", value: "9,843", color: "text-yellow-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Delivery Rate</span><span className="text-green-400 font-semibold">98.0%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "98%" }}
                  transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full gradient-primary"
                />
              </div>
            </div>

            {/* Floating Message Cards */}
            {floatingMessages.map((msg, i) => (
              <motion.div
                key={msg.name}
                initial={{ opacity: 0, x: 30, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.6 + i * 0.2, duration: 0.5 }}
                className={`absolute glass rounded-2xl p-3 flex items-center gap-3 shadow-card min-w-[200px]`}
                style={{
                  bottom: i === 0 ? "-20px" : "auto",
                  top: i === 1 ? "40px" : i === 2 ? "140px" : "auto",
                  right: i === 0 ? "10px" : "-40px",
                  left: i === 2 ? "-50px" : "auto",
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${msg.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                  {msg.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{msg.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{msg.msg}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{msg.time}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 pt-12 border-t border-border/50"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="text-center"
            >
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
              <p className={`text-2xl font-extrabold flex items-center justify-center ${s.color}`}>
                {s.value === "...." ? <AnimatedDots /> : s.value}
              </p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
