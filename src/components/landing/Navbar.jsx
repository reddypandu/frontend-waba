import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../assets/yestickai.png"

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
        : "bg-transparent border-transparent"
        }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-50 h-10  rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
            <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild size="sm">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="gradient-primary border-none text-white font-bold">
            <Link to="/register">Start Free Trial</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg border bg-background/50 text-foreground"
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
