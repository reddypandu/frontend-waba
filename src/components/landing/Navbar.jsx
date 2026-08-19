import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";


const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it Works", href: "#how-it-works" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-brand-green-500 shadow-md ${scrolled ? 'py-0' : 'py-1'}`}
    >
      <div className="container mx-auto flex items-center justify-between h-20 md:h-32 px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-12 md:h-16 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-105">
            <img src="/logo1.png" alt="Logo" className="w-auto h-full object-contain origin-left drop-shadow-md" />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-brand-green-50 hover:text-white transition-colors duration-200 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild size="sm" className="text-white hover:text-brand-green-700 hover:bg-white font-medium">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="bg-white text-brand-green-600 hover:bg-slate-50 font-bold border-none shadow-sm">
            <Link to="/">Start Free Trial</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg border border-brand-green-400 bg-brand-green-600 text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                </Button>
                <Button className="flex-1 gradient-primary text-white border-none" asChild>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
