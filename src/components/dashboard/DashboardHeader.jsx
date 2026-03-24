import { Bell, Menu, Wallet, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial = user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  // Simplified balance for now, we'll reconnect query logic later if needed
  const balance = 0;

  return (
    <>
      <header className="h-16 border-b border-border/60 flex items-center justify-between px-6 shrink-0"
        style={{ background: "hsl(var(--card) / 0.8)", backdropFilter: "blur(12px)" }}>

        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-muted-foreground w-56 cursor-pointer hover:bg-secondary transition-colors">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search...</span>
            <span className="ml-auto text-xs bg-secondary rounded px-1.5 py-0.5 border border-border/40">⌘K</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Wallet badge */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-sm font-semibold h-9 rounded-lg border-border/60 hover:bg-primary/5 transition-all duration-200"
            onClick={() => navigate("/dashboard/wallet")}
          >
            <Wallet className="h-4 w-4" />
            <span className="text-foreground">₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <div className="w-px h-4 bg-border/60" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </Button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-sm cursor-pointer hover:opacity-90 transition-all duration-200">
            {initial}
          </div>
        </div>
      </header>
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
};

export default DashboardHeader;
