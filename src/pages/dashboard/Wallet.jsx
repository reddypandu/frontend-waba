import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";

const Wallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = React.useState("");
  const [recharging, setRecharging] = React.useState(false);

  const { data: dashData, refetch } = useQuery({
    queryKey: ["wa-setup-status"],
    queryFn: () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const wallet = dashData?.wallet || { balance: 0 };
  const transactions = dashData?.transactions || [];

  const handleRecharge = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 10) {
      toast({ title: "Minimum recharge is ₹10", variant: "destructive" });
      return;
    }
    setRecharging(true);
    try {
      const orderData = await apiPost("/api/razorpay/create-order", { amount: amt * 100 });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: "INR",
        name: "Connectly Chat",
        description: "Wallet Recharge",
        order_id: orderData.id,
        handler: async (response) => {
          try {
            await apiPost("/api/razorpay/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amt,
            });
            toast({ title: `₹${amt} added to wallet!` });
            refetch();
            setAmount("");
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
        toast({ title: "Razorpay not initialized. Add Razorpay script to index.html.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to create order", description: err.message, variant: "destructive" });
    } finally {
      setRecharging(false);
    }
  };

  const txTypeStyles = {
    credit: "text-emerald-600 bg-emerald-50",
    debit: "text-red-600 bg-red-50",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <WalletIcon className="h-6 w-6 text-primary" /> Wallet
          </h1>
          <p className="text-muted-foreground">Manage your balance and top up credits.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg border-none">
          <CardContent className="p-6">
            <p className="text-sm font-medium opacity-80 mb-1">Available Balance</p>
            <p className="text-4xl font-black">₹{parseFloat(wallet.balance || 0).toFixed(2)}</p>
            <p className="text-xs opacity-60 mt-2">Messages: {wallet.messages_used || 0} used this month</p>
          </CardContent>
        </Card>

        {/* Recharge Card */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recharge Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[100, 500, 1000, 2000].map((preset) => (
                <Button key={preset} variant="outline" size="sm" onClick={() => setAmount(String(preset))} className={`rounded-xl text-xs h-8 ${amount === String(preset) ? "border-primary bg-primary/10 text-primary" : ""}`}>
                  ₹{preset}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                min="10"
                placeholder="Custom amount (₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 rounded-xl"
              />
              <Button onClick={handleRecharge} disabled={!amount || recharging} className="h-11 rounded-xl whitespace-nowrap px-5">
                <Plus className="h-4 w-4 mr-1.5" />
                {recharging ? "..." : "Pay"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="py-14 text-center text-muted-foreground">
              <WalletIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${txTypeStyles[tx.type] || "bg-muted"}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{tx.description || (tx.type === 'credit' ? 'Wallet Recharge' : 'Message Credits Used')}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{parseFloat(tx.amount || 0).toFixed(2)}
                    </p>
                    <Badge variant="outline" className="text-[9px] capitalize mt-0.5">{tx.status || 'completed'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
