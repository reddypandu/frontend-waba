import { Send, CheckCircle, Eye, XCircle, Phone, Building2, ArrowRight, TrendingUp, Zap, Palette } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const { waAccount, wallet, profile } = dashboardData || {};

  const chartData = useMemo(() => {
    // This would ideally come from the backend, using mock for visual structure
    return DAY_ORDER.map(name => ({ name, sent: 0, delivered: 0, read: 0 }));
  }, []);

  const isConnected = !!waAccount?.phone_number && !!waAccount?.phone_number_id;
  const displayName = user?.full_name || user?.email?.split("@")[0] || "there";

  const stats = [
    {
      title: "Current Balance",
      value: `₹${wallet?.balance || 0}`,
      sub: "Available for messaging",
      icon: Zap,
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      title: "Active Number",
      value: waAccount?.phone_number || "None",
      sub: waAccount?.verification_status || "Disconnected",
      icon: Phone,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Read Rate",
      value: "0%",
      sub: "Avg. last 7 days",
      icon: Eye,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      title: "Failed",
      value: "0",
      sub: "Last 7 days",
      icon: XCircle,
      gradient: "from-red-500 to-rose-600",
    },
  ];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="space-y-6 p-1">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Good day, {displayName} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Here's your messaging overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/designs")}
            className="h-10 px-5 rounded-xl font-semibold border-primary/30 text-primary hover:bg-primary/10"
          >
            <Palette className="mr-2 h-4 w-4" /> Create Design
          </Button>
          <Button
            onClick={() => navigate("/dashboard/campaigns/create")}
            className="h-10 px-5 rounded-xl font-semibold shadow-md transition-all duration-200"
          >
            <Zap className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      </motion.div>

      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative rounded-2xl border border-yellow-500/25 bg-card p-4 overflow-hidden"
        >
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-yellow-400/15 flex items-center justify-center">
                <Phone className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">WhatsApp Not Connected</p>
                <p className="text-xs text-muted-foreground">Connect your WhatsApp Business API to start sending</p>
              </div>
            </div>
            <Button onClick={() => navigate("/dashboard/whatsapp-setup")} size="sm">
              Set Up Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.title}
            className="relative rounded-2xl border border-border/50 bg-card p-5 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-foreground truncate">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.title}</p>
            <p className="text-[10px] text-muted-foreground truncate">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground">Message Volume</h3>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground">Read Rate Trend</h3>
            <p className="text-xs text-muted-foreground">Historical data</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="read" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
