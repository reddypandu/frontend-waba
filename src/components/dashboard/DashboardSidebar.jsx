import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, FileText, Send, Users,
  CreditCard, BarChart3, Settings, Phone, LogOut, Building2, ShieldCheck, Inbox,
  Reply, Workflow, Wallet, ChevronRight, Receipt, Palette,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { useState } from "react";
import Logo from "../../assets/yestickai.png"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const initial = user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 overflow-y-auto border-r border-sidebar-border"
      style={{ background: "hsl(var(--sidebar-background))" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-sidebar-border/60 shrink-0">
        <div className="w-30 rounded-xl  flex items-center justify-center shadow-md">
          <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {navGroups.map((group) => {
          const items = group.items.filter(item => item.path !== "/dashboard/admin" || isAdmin);
          if (items.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-2 px-3">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
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
                      <div className="flex items-center gap-1">
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

      {/* User footer */}
      <div className="px-3 pb-4 pt-3 border-t border-sidebar-border/60 space-y-1 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to sign out of your account?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
};

export default DashboardSidebar;
