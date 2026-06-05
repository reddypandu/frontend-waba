import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Crown, Rocket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 24500,
    icon: Rocket,
    color: "border-green-400 shadow-green-100 shadow-md",
    badge: null,
    features: [
      "1 WhatsApp Number",
      "3 Team Members",
      "Unlimited Contacts",
      "Campaign Broadcasting",
      "Template Management",
      "Basic Analytics",
      "Shared Inbox",
      "Email Support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 30000,
    icon: Zap,
    color: "border-blue-400 shadow-blue-100 shadow-md",
    badge: "Popular",
    features: [
      "Everything in Starter",
      "3 WhatsApp Numbers",
      "10 Team Members",
      "Auto Replies",
      "Campaign Scheduling",
      "Advanced Analytics",
      "Contact Segmentation",
      "Priority Support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 35000,
    icon: Crown,
    color: "border-violet-400 shadow-violet-100 shadow-md",
    badge: "Advanced",
    features: [
      "Everything in Growth",
      "5 WhatsApp Numbers",
      "Unlimited Team Members",
      "Workflow Automation",
      "Team Inbox Assignment",
      "API Access",
      "Custom Branding",
      "Premium Support",
    ],
  },
];

const Billing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = React.useState(null);

  const { data: dashData } = useQuery({
    queryKey: ["wa-setup-status", user?.id],
    queryFn: () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const subscription = dashData?.subscription || {
    plan: "starter",
    status: "active",
    messages_used: 0,
  };
  const currentPlan = subscription.plan || "starter";

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    setUpgrading(planId);
    try {
      const plan = PLANS.find((p) => p.id === planId);
      const orderData = await apiPost("/api/subscription/create-order", {
        plan: planId,
        amount: plan.price * 100,
      });

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
            toast({
              title: "Payment verification failed",
              description: err.message,
              variant: "destructive",
            });
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
      toast({
        title: "Failed to initiate payment",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUpgrading(null);
    }
  };

  const usagePercent = 0; // Usage limits are removed for yearly plans

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and upgrade as you grow.
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="shadow-sm border-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground font-medium">
                Current Plan
              </p>
              <Badge className="capitalize bg-primary/10 text-primary border-none font-bold">
                {currentPlan}
              </Badge>
            </div>
            <p className="text-2xl font-black text-foreground">
              {subscription.messages_used?.toLocaleString() || 0}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                messages used this month
              </span>
            </p>
          </div>
          <div className="w-full sm:w-48">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Usage</span>
              <span>{Math.round(usagePercent)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent > 80 ? "bg-red-500" : usagePercent > 50 ? "bg-amber-500" : "bg-primary"}`}
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
            <Card
              key={plan.id}
              className={`relative border-2 ${plan.color} transition-all`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-bold shadow-sm text-xs px-3">
                    {plan.badge}
                  </Badge>
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
                  <span className="text-3xl font-black text-foreground">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground mb-0.5">
                    /year
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
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
                  {isCurrent
                    ? "Current Plan"
                    : upgrading === plan.id
                      ? "Processing..."
                      : plan.price === 0
                        ? "Downgrade"
                        : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">
        All plans include 256-bit encryption, GDPR compliance, and Meta-approved
        WhatsApp Business API access. Payments powered by Razorpay.
      </p>
    </div>
  );
};

export default Billing;
