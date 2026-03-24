import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, FileText, Send, Users,
  CreditCard, BarChart3, Settings, Phone, X, Building2, ShieldCheck, Inbox,
  Reply, Workflow, Wallet, ChevronRight, Receipt, Palette
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Messaging",
    items: [
      { title: "Campaigns", path: "/dashboard/campaigns", icon: Send },
      { title: "Templates", path: "/dashboard/templates", icon: FileText },
      { title: "Inbox", path: "/dashboard/inbox", icon: Inbox, badge: "Live" },
      { title: "Auto Replies", path: "/dashboard/auto-replies", icon: Reply },
      { title: "Workflows", path: "/dashboard/workflows", icon: Workflow },
      { title: "Designs", path: "/dashboard/designs", icon: Palette, badge: "New" },
    ],
  },
  {
    label: "Audience",
    items: [
      { title: "Contacts", path: "/dashboard/contacts", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "WhatsApp Setup", path: "/dashboard/whatsapp-setup", icon: Phone },
      { title: "Business Profile", path: "/dashboard/business-profile", icon: Building2 },
      { title: "Wallet", path: "/dashboard/wallet", icon: Wallet },
      { title: "Billing", path: "/dashboard/billing", icon: CreditCard },
      { title: "Invoices", path: "/dashboard/invoices", icon: Receipt },
      { title: "Reports", path: "/dashboard/reports", icon: BarChart3 },
      { title: "Settings", path: "/dashboard/settings", icon: Settings },
      { title: "Admin", path: "/dashboard/admin", icon: ShieldCheck },
    ],
  },
];

const MobileSidebar = ({ open, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();

  const initial = user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Sidebar Content */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 bottom-0 w-72 h-full flex flex-col border-r border-sidebar-border shadow-2xl overflow-hidden bg-background"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-sidebar-border/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-lg font-extrabold text-foreground tracking-tight">
                  WazzUp
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-6 px-3 space-y-7 overflow-y-auto">
              {navGroups.map((group) => {
                const items = group.items.filter(item => item.path !== "/dashboard/admin" || isAdmin);
                if (items.length === 0) return null;
                return (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-3 px-3">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {items.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            end={item.path === "/dashboard"}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? "bg-primary/20 text-primary border border-primary/20 shadow-sm"
                                : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                              {item.title}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 font-bold">
                                  {item.badge}
                                </span>
                              )}
                              {isActive && <ChevronRight className="w-3 h-3" />}
                            </div>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-sidebar-border/60 bg-accent/20 shrink-0">
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
