import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Users, Shield, BarChart3, Wallet, Phone, MessageSquare,
  Building2, CheckCircle2, ChevronRight, Eye, Palette,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

const AdminPanel = () => {
  const { user } = useAuth();
  const [search, setSearch] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [activeAdminTab, setActiveAdminTab] = React.useState("users");

  const isAdmin = user?.role === 'admin';

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    enabled: isAdmin && activeAdminTab === 'users'
  });

  const { data: designsData, isLoading: loadingDesigns } = useQuery({
    queryKey: ['admin-designs'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/designs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch designs');
      return res.json();
    },
    enabled: isAdmin && activeAdminTab === 'designs'
  });

  const users = usersData?.users || [];
  const stats = usersData?.stats || { total_users: 0, total_free: 0, total_starter: 0, total_pro: 0 };
  const designs = designsData || [];
  const isLoading = activeAdminTab === 'users' ? loadingUsers : loadingDesigns;

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <Shield className="mx-auto h-12 w-12 text-destructive opacity-20" />
            <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Platform overview & user management</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeAdminTab === "users" ? "default" : "outline"}
            onClick={() => setActiveAdminTab("users")}
          >
            <Users className="mr-2 h-4 w-4" /> Users
          </Button>
          <Button
            size="sm"
            variant={activeAdminTab === "designs" ? "default" : "outline"}
            onClick={() => setActiveAdminTab("designs")}
          >
            <Palette className="mr-2 h-4 w-4" /> Designs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.total_users} />
        <StatCard icon={MessageSquare} label="Messages Sent" value={0} />
        <StatCard icon={Wallet} label="Revenue" value="₹0" accent />
        <StatCard icon={BarChart3} label="Activity" value="0%" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-9 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {activeAdminTab === "users" ? (
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">WhatsApp</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usage</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.user_id || u._id} className="border-b border-border last:border-0 hover:bg-secondary/20 cursor-pointer" onClick={() => navigate(`/dashboard/admin/users/${u._id || u.user_id}`)}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {u.full_name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground truncate">{u.full_name || "—"}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {u.wa_connected ? (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-xs">{u.wa_phone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not connected</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">{u.subscription?.plan || "free"}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-24 space-y-1">
                          <Progress value={20} className="h-1" />
                          <p className="text-[10px] text-muted-foreground">20% used</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">No users found match criteria.</td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">Loading users...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>System Designs ({designs.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Creator</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {designs.map((d) => (
                    <tr key={d._id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">{d.type}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs capitalize">{d.category || "Uncategorized"}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {d.user_id?.full_name || "System"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => window.open(`/dashboard/designs/editor/${d._id}`, "_blank")}><Eye className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                  {designs.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">No designs found.</td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">Loading designs...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-[11px] text-muted-foreground uppercase font-semibold">{label}</p>
      </div>
    </CardContent>
  </Card>
);

export default AdminPanel;
