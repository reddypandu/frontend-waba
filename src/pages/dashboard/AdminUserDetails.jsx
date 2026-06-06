import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  Phone,
  CheckCircle2,
  ShieldAlert,
  CreditCard,
  Building2,
  MessageSquare,
  BarChart,
  Mail,
  Calendar,
  Wallet,
  Users,
  Send,
  MessageCircle,
} from "lucide-react";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user-details", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to fetch user details");
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading user details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <p className="text-xl font-bold">{error.message}</p>
        <Button onClick={() => navigate("/dashboard/admin")}>
          Back to Admin Panel
        </Button>
      </div>
    );
  }

  const { user, waAccount, business, stats, transactions } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/admin")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-2xl">
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {user.full_name || "User"}
                </h1>
                {user.role === "admin" && (
                  <Badge variant="destructive">Admin</Badge>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-1 text-sm mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Subscription
              </p>
              <p className="text-lg font-bold text-foreground mt-1 capitalize">
                {user.role === "admin" ? "admin" : user.subscription?.plan || "starter"}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-primary/30" />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Wallet
              </p>
              <p className="text-lg font-bold text-foreground mt-1">
                ₹{(user.wallet?.balance || 0).toFixed(2)}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-emerald-500/30" />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Joined
              </p>
              <p className="text-lg font-bold text-foreground mt-1">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500/30" />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Status
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">
                  Active
                </span>
              </div>
            </div>
            <User className="w-8 h-8 text-green-500/30" />
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user.full_name || "—"}
                  </p>
                </div>
                <div className="space-y-1 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user.email}
                  </p>
                </div>
                <div className="space-y-1 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user.phone || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Account Role
                  </p>
                  <div className="mt-1">
                    <Badge className="capitalize">{user.role || "user"}</Badge>
                  </div>
                </div>
                <div className="space-y-1 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {user.updatedAt && (
                  <div className="space-y-1 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(user.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Subscription Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Current Plan
                  </p>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className="capitalize text-base px-3 py-1"
                    >
                      {user.role === "admin" ? "admin" : user.subscription?.plan || "starter"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Subscription Status
                  </p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {user.subscription?.status || "active"}
                  </p>
                </div>
                <div className="space-y-1 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Messages Used
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user.subscription?.messages_used || 0} messages
                  </p>
                </div>
                <div className="space-y-1 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Subscription Start
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user.subscription?.start_date
                      ? new Date(
                          user.subscription.start_date,
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Subscription End
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user.subscription?.end_date
                      ? new Date(
                          user.subscription.end_date,
                        ).toLocaleDateString()
                      : "No end date"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="space-y-4">
          {waAccount?.phone_number_id ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Phone className="w-5 h-5 text-emerald-500" />
                    WhatsApp Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Connection Status
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-medium text-emerald-600">
                        Connected
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {waAccount.phone_number || "Linked"}
                    </p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground">
                      Phone Number ID
                    </p>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {waAccount.phone_number_id || "—"}
                    </p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground">
                      Account ID
                    </p>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {waAccount.account_id || "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {business && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Business Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Business Name
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {business.name || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground">
                        About
                      </p>
                      <p className="text-sm text-foreground">
                        {business.about || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground">
                        Website
                      </p>
                      <p className="text-sm text-foreground">
                        {business.website || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground">
                        Email
                      </p>
                      <p className="text-sm text-foreground">
                        {business.email || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-sm text-foreground">
                        {business.phone || "—"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <Phone className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    No WhatsApp Account Connected
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This user has not connected a WhatsApp Business Account yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Total Contacts
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.contacts}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Total Messages
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.messages || 0}
                    </p>
                  </div>
                  <MessageSquare className="w-12 h-12 text-purple-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Campaigns Sent
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.campaigns}
                    </p>
                  </div>
                  <Send className="w-12 h-12 text-orange-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Outbound Messages
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.outboundMessages || 0}
                    </p>
                  </div>
                  <Send className="w-12 h-12 text-green-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Inbound Messages
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.inboundMessages || 0}
                    </p>
                  </div>
                  <MessageCircle className="w-12 h-12 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Templates Used
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.templates}
                    </p>
                  </div>
                  <BarChart className="w-12 h-12 text-teal-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet & Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Current Balance
                </p>
                <p className="text-4xl font-bold text-foreground">
                  ₹{(user.wallet?.balance || 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Transaction History
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {transactions?.length || 0} transactions
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                          Description
                        </th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr
                          key={t._id}
                          className="border-b border-border last:border-0 hover:bg-secondary/20"
                        >
                          <td className="py-3 px-4">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                t.type === "credit" ? "outline" : "secondary"
                              }
                              className={
                                t.type === "credit"
                                  ? "text-emerald-500 border-emerald-500/30"
                                  : ""
                              }
                            >
                              {t.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{t.description}</td>
                          <td
                            className={`py-3 px-4 text-right font-medium ${t.type === "credit" ? "text-emerald-500" : "text-destructive"}`}
                          >
                            {t.type === "credit" ? "+" : "-"}₹
                            {(t.amount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Wallet className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                  <p>No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserDetails;
