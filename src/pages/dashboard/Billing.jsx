import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Crown, Rocket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: Zap,
    color: "border-border",
    badge: null,
    features: ["1,000 messages/month", "1 WhatsApp number", "Basic templates", "Community support"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 999,
    icon: Rocket,
    color: "border-blue-400 shadow-blue-100 shadow-md",
    badge: "Popular",
    features: ["10,000 messages/month", "3 WhatsApp numbers", "Unlimited templates", "Auto-replies", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 2999,
    icon: Crown,
    color: "border-primary shadow-primary/10 shadow-md",
    badge: "Best Value",
    features: ["Unlimited messages", "10 WhatsApp numbers", "Workflow automation", "Campaign analytics", "Priority support", "API access"],
  },
];

const Billing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = React.useState(null);

  const { data: dashData } = useQuery({
    queryKey: ["wa-setup-status"],
    queryFn: () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const subscription = dashData?.subscription || { plan: "free", status: "active", messages_used: 0 };
  const currentPlan = subscription.plan || "free";

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    setUpgrading(planId);
    try {
      const plan = PLANS.find(p => p.id === planId);
      const orderData = await apiPost("/api/subscription/create-order", { plan: planId, amount: plan.price * 100 });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: "INR",
        name: "Connectly Chat",
        description: `${plan.name} Plan Subscription`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            await apiPost("/api/subscription/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            });
            toast({ title: `Upgraded to ${plan.name} plan!` });
            window.location.reload();
          } catch (err) {
            toast({ title: "Payment verification failed", description: err.message, variant: "destructive" });
          }
        },
        prefill: { email: user?.email, name: user?.full_name },
        theme: { color: "#6366f1" },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast({ title: "Razorpay not initialized", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to initiate payment", description: err.message, variant: "destructive" });
    } finally {
      setUpgrading(null);
    }
  };

  const usagePercent = currentPlan === "free" ? Math.min((subscription.messages_used / 1000) * 100, 100) :
    currentPlan === "starter" ? Math.min((subscription.messages_used / 10000) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Plans</h1>
        <p className="text-muted-foreground">Manage your subscription and upgrade as you grow.</p>
      </div>

      {/* Current Plan Card */}
      <Card className="shadow-sm border-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground font-medium">Current Plan</p>
              <Badge className="capitalize bg-primary/10 text-primary border-none font-bold">{currentPlan}</Badge>
            </div>
            <p className="text-2xl font-black text-foreground">{subscription.messages_used?.toLocaleString() || 0} <span className="text-sm font-medium text-muted-foreground">messages used this month</span></p>
          </div>
          <div className="w-full sm:w-48">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Usage</span>
              <span>{Math.round(usagePercent)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-primary'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          return (
            <Card key={plan.id} className={`relative border-2 ${plan.color} transition-all`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-bold shadow-sm text-xs px-3">{plan.badge}</Badge>
                </div>
              )}
              <CardHeader className="pb-3 pt-7">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-foreground">₹{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground mb-0.5">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full rounded-xl font-bold"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || upgrading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrent ? "Current Plan" : upgrading === plan.id ? "Processing..." : plan.price === 0 ? "Downgrade" : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">
        All plans include 256-bit encryption, GDPR compliance, and Meta-approved WhatsApp Business API access. Payments powered by Razorpay.
      </p>
    </div>
  );
};

export default Billing;
