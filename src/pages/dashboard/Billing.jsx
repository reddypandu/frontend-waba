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
    id: "free",
    name: "Free Trial",
    price: 0, // Corrected price for Free Trial
    icon: Zap, // Using Zap for Free Trial
    color: "border-gray-400 shadow-gray-100 shadow-md",
    badge: "Free",
    features: [
      "10 Contacts",
      "Connect WhatsApp Business",
      "Basic Messaging",
    ],
  },
  {
    id: "paid",
    name: "Paid Plan",
    price: 30000,
    icon: Crown, // Using Crown for Paid Plan
    color: "border-blue-400 shadow-blue-100 shadow-md",
    badge: "Popular",
    features: [
      "Send bulk WhatsApp campaigns",
      "Manage chats in a Shared Team Inbox & set up simple greeting / OOO automations",
      "Unlimited Messages (Based on your WhatsApp Number)",
      "Unlimited Contacts",
      "Auto Replies",
      "Auto Work flows",
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
    plan: "paid", // Default to 'paid' for existing users if plan is not explicitly set
    status: "active",
    messages_used: 0,
  };
  const currentPlan = subscription.plan || "paid"; // Default to 'paid' for existing users if plan is not explicitly set

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    setUpgrading(planId);
    try {
      const plan = PLANS.find((p) => p.id === planId);
      const orderData = await apiPost("/api/subscription/create-order", {
        plan: planId,
        amount: plan.price,
      });

      const razorpayKey = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "";
      if (!razorpayKey) {
        throw new Error('Razorpay key missing. Check deployment environment variable VITE_RAZORPAY_KEY_ID.');
      }

      const options = {
        key: razorpayKey,
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
              amount: orderData.amount,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and upgrade to unlock more features.
        </p>
        {currentPlan === 'free' && (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
            You are currently on the Free Trial. Upgrade anytime to the Paid Plan for unlimited contacts, campaigns, and automation.
          </div>
        )}
      </div>

      {/* Current Plan Card */}
      <Card className="shadow-sm border-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground font-medium">
                Current Plan
              </p>
              <Badge className={`capitalize ${currentPlan === 'free' ? 'bg-gray-100 text-gray-700' : 'bg-primary/10 text-primary'} border-none font-bold`}>
                {currentPlan}
              </Badge>
            </div>
            <p className="text-2xl font-black text-foreground">
              {currentPlan === 'free' ? 'Free Trial' : 'Paid Plan'}
            </p>
            {currentPlan === 'free' && <p className="text-sm text-muted-foreground mt-1">Limited to 10 contacts.</p>}
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
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-bold shadow-sm text-xs px-3">
                    Most Popular
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
                  <span className="text-3xl font-black text-foreground">{plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString()}`}</span>
                  <span className="text-sm text-muted-foreground mb-0.5">{plan.price === 0 ? "" : "/year"}</span>
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
                  disabled={isCurrent || upgrading === plan.id || (plan.id === 'free' && currentPlan === 'paid')}
                  onClick={() => {
                    if (plan.id === 'paid') { // Only call handleUpgrade for the paid plan
                      handleUpgrade(plan.id);
                    } else if (plan.id === 'free' && currentPlan === 'paid') {
                      // Optionally, navigate to a support page or show a toast for downgrade
                      toast({ title: "Downgrade not supported via button", description: "Please contact support to downgrade your plan.", variant: "info" });
                    }
                  }}
                >
                  {isCurrent
                    ? "Current Plan"
                    : upgrading === plan.id
                      ? "Processing..."
                      : plan.id === 'free' && currentPlan === 'paid'
                        ? "Downgrade (Contact Support)"
                        : plan.id === 'free'
                          ? "Start Free Trial"
                          : "Upgrade Now"}
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
