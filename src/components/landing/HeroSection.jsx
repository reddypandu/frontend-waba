import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Users,
  Bot,
  MessageCircle,
  Send,
  Instagram,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: Users, value: "50,000+", label: "Active Businesses", iconColor: "text-brand-green-500", iconBg: "bg-brand-green-50" },
  { icon: MessageSquare, value: "5+", label: "Platforms Connected", iconColor: "text-brand-green-500", iconBg: "bg-brand-green-50" },
  { icon: CheckCircle2, value: "99.99%", label: "Reliability", iconColor: "text-brand-green-500", iconBg: "bg-brand-green-50" },
  { icon: Bot, value: "24/7", label: "AI Support", iconColor: "text-blue-500", iconBg: "bg-blue-50" },
];

const HeroSection = () => {
  return (
    <section className="relative bg-slate-50 overflow-hidden pt-28 pb-12 lg:pt-28 lg:pb-12 xl:pt-40 xl:pb-24">
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 items-center">
          
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-brand-green-100 text-brand-green-800 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Complete CRM & Marketing Suite
            </motion.div>

            {/* Headline */}
            <h1 className="text-[32px] sm:text-4xl md:text-5xl lg:text-5xl xl:text-7xl font-extrabold text-[#1a202c] leading-[1.1] mb-4 xl:mb-6 tracking-tight">
              The Complete <br />
              <span className="text-brand-green-500">Omnichannel</span> Inbox <br />
              & Smart Chatbot
            </h1>

            {/* Subtitle */}
            <p className="text-base lg:text-lg text-slate-500 leading-relaxed mb-6 xl:mb-8 max-w-lg">
              Broadcast messages at scale, build intelligent AI agents, collaborate in a shared team inbox, and fully automate your customer engagement — without writing a single line of code.
            </p>

            {/* Tags/Pills */}
            <div className="flex flex-wrap gap-2 mb-6 xl:mb-10">
              {['WhatsApp API', 'WhatsApp Business', 'Telegram', 'Instagram', 'FB Messenger'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-brand-green-50 text-brand-green-700 text-xs font-medium border border-brand-green-100/50">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                asChild
                className="text-base px-8 h-12 rounded-xl font-semibold bg-brand-green-500 hover:bg-brand-green-600 text-white shadow-lg shadow-brand-green-500/20 transition-all duration-200"
              >
                <Link to="/login">
                  Get started free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-8 h-12 rounded-xl font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 transition-all duration-200 bg-white"
              >
                <a href="#features">See All Features</a>
              </Button>
            </div>
          </motion.div>

          {/* Right Column: UI Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative w-full max-w-[500px] xl:max-w-[600px] mx-auto lg:ml-auto"
          >
            {/* Background decorative blob */}
            <div className="absolute -inset-4 bg-brand-green-100/50 rounded-full blur-3xl -z-10 opacity-70" />

            {/* Floating Badges */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-4 -left-4 z-20 bg-white rounded-full py-2 px-3 flex items-center gap-2 shadow-lg border border-slate-100"
            >
              <div className="w-6 h-6 rounded-full bg-brand-green-100 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-brand-green-600 fill-brand-green-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 pr-1">WhatsApp</span>
            </motion.div>

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-4 -right-4 z-20 bg-white rounded-full py-2 px-3 flex items-center gap-2 shadow-lg border border-slate-100"
            >
              <div className="w-6 h-6 rounded-full bg-brand-green-50 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-brand-green-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 pr-1">AI Chatbot</span>
            </motion.div>

            {/* Main Mockup Window */}
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative z-10 w-full aspect-[4/3] max-h-[450px]">
              
              {/* Window Controls */}
              <div className="h-8 sm:h-10 bg-slate-50 border-b border-slate-100 flex items-center px-3 sm:px-4 gap-2 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto text-[8px] sm:text-[10px] font-medium text-slate-400 flex items-center gap-1.5 pr-6 sm:pr-8">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-green-400" />
                  Omnichannel Workspace
                </div>
              </div>

              {/* Mockup Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-10 sm:w-14 border-r border-slate-100 bg-slate-50/50 flex flex-col items-center py-3 sm:py-4 gap-3 sm:gap-4 shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-brand-green-100 flex items-center justify-center cursor-pointer shadow-sm">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-brand-green-600 fill-brand-green-600" />
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors">
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 text-sky-500 fill-sky-500" />
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors">
                    <Instagram className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 fill-blue-600" />
                  </div>
                </div>

                {/* Inbox List */}
                <div className="w-[120px] sm:w-[45%] border-r border-slate-100 bg-white flex flex-col shrink-0 min-w-0">
                  <div className="p-2 sm:p-3 border-b border-slate-100 shrink-0">
                    <h3 className="text-[10px] sm:text-xs font-bold text-slate-800 truncate">Unified Inbox</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {/* Active Item */}
                    <div className="p-2 sm:p-3 bg-brand-green-50/50 border-b border-slate-100 cursor-pointer min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-800 truncate">Vikram Singh</span>
                        <span className="text-[8px] sm:text-[9px] text-brand-green-600 font-medium shrink-0 ml-1">now</span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-brand-green-700/80 truncate">Can we schedule a product demo?</p>
                    </div>

                    {/* Inactive Items */}
                    <div className="p-2 sm:p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 truncate">Sarah Lee</span>
                        <span className="text-[8px] sm:text-[9px] text-slate-400 shrink-0 ml-1">2m</span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">I'd like to upgrade my plan.</p>
                    </div>

                    <div className="p-2 sm:p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 truncate">System Alerts</span>
                        <span className="text-[8px] sm:text-[9px] text-slate-400 shrink-0 ml-1">5m</span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">Payment webhook received...</p>
                    </div>
                  </div>
                </div>

                {/* Chat View */}
                <div className="flex-1 bg-white flex flex-col relative min-w-0">
                  {/* Chat Header */}
                  <div className="p-2 sm:p-3 border-b border-slate-100 flex items-center gap-1.5 sm:gap-2 bg-slate-50/30 shrink-0 min-w-0">
                    <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-brand-green-500 flex items-center justify-center text-white shrink-0">
                      <MessageCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] sm:text-xs font-bold text-slate-800 truncate">Vikram Singh</h4>
                      <p className="text-[8px] sm:text-[9px] text-brand-green-500 font-medium truncate">WhatsApp via API</p>
                    </div>
                  </div>

                  {/* Chat Content */}
                  <div className="flex-1 p-2 sm:p-3 flex flex-col gap-2 sm:gap-3 relative overflow-hidden bg-slate-50/30">
                    {/* Info Box */}
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="bg-[#f0f4ff] border border-blue-100 rounded-lg p-1.5 sm:p-2.5 shadow-sm"
                    >
                      <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                        <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 shrink-0" />
                        <span className="text-[8px] sm:text-[10px] font-bold text-blue-700 leading-tight">Chatbot Flow Active</span>
                      </div>
                      <p className="text-[7px] sm:text-[9px] text-slate-500 leading-tight">
                        Trigger matched: "Schedule Demo". AI assistant is parsing availability and preparing a response.
                      </p>
                    </motion.div>

                    {/* Chat Bubble */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, originX: 1, originY: 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.6 }}
                      className="bg-brand-green-500 text-white rounded-2xl rounded-tr-sm p-2 sm:p-3 self-end max-w-[90%] sm:max-w-[85%] shadow-sm mt-auto"
                    >
                      <p className="text-[8px] sm:text-[10px] leading-tight sm:leading-relaxed font-medium">
                        Hi Vikram! I'd love to help. Would 10:00 AM or 2:00 PM tomorrow work for you?
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-12 lg:mt-16 xl:mt-24"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-5 flex flex-row items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
                <s.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${s.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-xl font-bold text-slate-800">
                  {s.value}
                </p>
                <p className="text-[9px] sm:text-xs text-slate-500 font-medium truncate">
                  {s.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
