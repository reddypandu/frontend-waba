import { MessageSquare, Twitter, Linkedin, Github, Mail, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../assets/yestickai.png"

const cols = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#" },
      { label: "API Docs", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#", badge: "Hiring!" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Data Deletion", href: "/data-deletion" },
    ],
  },
];

const socials = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
];

const Footer = () => (
  <footer className="relative bg-background border-t border-border/40 overflow-hidden">
    {/* Top glow */}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] blur-3xl opacity-5 pointer-events-none"
      style={{ background: "radial-gradient(ellipse, hsl(93 69% 41%), transparent)" }}
    />

    <div className="container mx-auto px-4 pt-16 pb-10 relative">
      {/* CTA Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-16 p-10 md:p-14 text-center border border-primary/20 bg-secondary/20">
        <div className="absolute inset-0 animated-grid opacity-10 pointer-events-none" />
        <p className="text-sm text-primary font-semibold uppercase tracking-widest mb-3">Get started today</p>
        <h3 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
          Ready to 10x Your{" "}
          <span className="text-gradient">WhatsApp Outreach?</span>
        </h3>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Join 50,000+ businesses already using Yestick AI to drive sales and engagement.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white gradient-primary shadow-btn hover:shadow-glow hover:scale-105 transition-all duration-200"
        >
          Start Free — No Card Needed <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Main footer grid */}
      <div className="grid md:grid-cols-5 gap-10 mb-12">
        {/* Brand column */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4 font-extrabold text-2xl">
            <div className="w-50 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <img src={Logo} alt="Logo" className="w-full h-full object-contain" />

            </div>

          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
            The complete WhatsApp Business API platform for scaling customer engagement, automating conversations, and driving revenue.
          </p>
          {/* Socials */}
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-200"
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-bold text-foreground mb-5 tracking-wide uppercase">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2"
                  >
                    {l.label}
                    {l.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 font-bold">
                        {l.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © 2026 Yestick AI. All rights reserved.
        </p>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          All systems operational
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
