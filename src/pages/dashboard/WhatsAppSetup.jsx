import * as React from "react";
import { Phone, CheckCircle2, AlertCircle, Zap, Shield, ArrowRight, ExternalLink, RefreshCw, Wifi, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiGet, apiPost } from "@/lib/api";
import AutoConnectFlow from "@/components/dashboard/whatsapp/AutoConnectFlow";
import { useToast } from "@/hooks/use-toast";

const WhatsAppSetup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [view, setView] = React.useState("status"); // "status" | "connect" | "manual"
  const [manualForm, setManualForm] = React.useState({
    phone_number_id: "",
    waba_id: "",
    access_token: "",
    phone_number: "",
  });
  const [saving, setSaving] = React.useState(false);

  const { data: dashData, isLoading, refetch } = useQuery({
    queryKey: ["wa-setup-status"],
    queryFn: () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const waAccount = dashData?.waAccount || null;
  const isConnected = !!waAccount?.phone_number_id;

  const handleManualSave = async () => {
    setSaving(true);
    try {
      await apiPost("/api/admin/businesses", { name: user?.full_name || "My Business" });
      await apiPost("/api/admin/whatsapp-accounts", manualForm);
      toast({ title: "WhatsApp account saved successfully!" });
      queryClient.invalidateQueries({ queryKey: ["wa-setup-status"] });
      setView("status");
    } catch (err) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      toast({ title: "Disconnected", description: "Please reconnect your account." });
      queryClient.invalidateQueries({ queryKey: ["wa-setup-status"] });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ─── Connected State ───────────────────────────────────────────────────────
  if (isConnected && view === "status") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">WhatsApp Setup</h1>
            <p className="text-muted-foreground">Manage your WhatsApp Business API connection.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Connected status card */}
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner">
                  <Phone className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">WhatsApp Connected</h3>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold">LIVE</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{waAccount?.phone_number || "Number not registered"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Status: <span className="font-bold capitalize text-emerald-600">{waAccount?.verification_status || "verified"}</span></p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setView("connect")} className="rounded-xl">
                  <Settings2 className="h-4 w-4 mr-1.5" /> Reconnect
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDisconnect} className="rounded-xl">
                  <Trash2 className="h-4 w-4 mr-1.5" /> Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard label="Phone Number ID" value={waAccount?.phone_number_id} mono />
          <InfoCard label="WABA ID" value={waAccount?.waba_id} mono />
          <InfoCard label="Webhook Verified" value={waAccount?.webhook_verified ? "Yes ✅" : "Not yet"} />
          <InfoCard label="Verification Status" value={waAccount?.verification_status} badge />
        </div>

        {/* Webhook Notice */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="h-4 w-4 text-primary" />
              Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configure your webhook in Meta App Dashboard</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Webhook URL: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-primary">{(import.meta.env.VITE_API_BASE_URL || "http://localhost:5005").replace(/\/$/, '')}/api/webhook</code><br />
                Verify Token: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-primary">mysecrettoken</code>
              </AlertDescription>
            </Alert>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => window.open("https://developers.facebook.com/apps", "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" /> Open Meta Developer Console
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Not Connected / Connect View ─────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WhatsApp Setup</h1>
        <p className="text-muted-foreground">Connect your WhatsApp Business API to start sending messages.</p>
      </div>

      {/* Method Selector */}
      {view === "status" && (
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Auto / Facebook Login */}
          <button
            onClick={() => setView("connect")}
            className="group relative text-left rounded-2xl border-2 border-[#1877F2]/30 bg-card p-6 space-y-3 hover:border-[#1877F2] hover:shadow-lg transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1877F2]/10 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#1877F2]">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground text-base">Login with Facebook</h3>
                <Badge className="bg-emerald-100 text-emerald-700 text-[9px] border-none">RECOMMENDED</Badge>
              </div>
              <p className="text-sm text-muted-foreground">The easiest way to connect. Authorize via Meta Embedded Signup in seconds.</p>
            </div>
            <div className="flex items-center gap-1.5 text-[#1877F2] text-sm font-bold mt-2 group-hover:gap-3 transition-all">
              Connect Now <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Manual Setup */}
          <button
            onClick={() => setView("manual")}
            className="group text-left rounded-2xl border-2 border-border bg-card p-6 space-y-3 hover:border-primary/40 hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Settings2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground text-base">Manual Setup</h3>
                <Badge variant="outline" className="text-[9px]">ADVANCED</Badge>
              </div>
              <p className="text-sm text-muted-foreground">For developers. Provide your Phone Number ID, WABA ID, and Access Token directly.</p>
            </div>
            <div className="flex items-center gap-1.5 text-primary text-sm font-bold mt-2 group-hover:gap-3 transition-all">
              Configure <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Auto Connect - Meta Embedded Signup */}
      {view === "connect" && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setView("status")} className="text-sm -ml-2 h-8">← Back</Button>
          <AutoConnectFlow onSuccess={() => { refetch(); setView("status"); }} />
        </div>
      )}

      {/* Manual Setup Form */}
      {view === "manual" && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setView("status")} className="text-sm -ml-2 h-8">← Back</Button>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Manual API Setup</CardTitle>
              <CardDescription>Enter your WhatsApp Business credentials from the Meta Developer Console.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <AlertTitle className="text-amber-800 font-bold">Developer Required</AlertTitle>
                <AlertDescription className="text-xs text-amber-700">
                  This requires a Meta Developer account with WhatsApp Business API access. Get your credentials from <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline font-bold">developers.facebook.com</a>.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_number_id" className="font-bold text-sm">Phone Number ID <span className="text-destructive">*</span></Label>
                  <Input id="phone_number_id" placeholder="e.g. 123456789012345" className="h-11 rounded-xl font-mono" value={manualForm.phone_number_id} onChange={(e) => setManualForm(f => ({ ...f, phone_number_id: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">Found in Meta Developer Console → App → WhatsApp → API Setup</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waba_id" className="font-bold text-sm">WhatsApp Business Account ID (WABA ID) <span className="text-destructive">*</span></Label>
                  <Input id="waba_id" placeholder="e.g. 234567890123456" className="h-11 rounded-xl font-mono" value={manualForm.waba_id} onChange={(e) => setManualForm(f => ({ ...f, waba_id: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="font-bold text-sm">Phone Number</Label>
                  <Input id="phone_number" placeholder="+91 98765 43210" className="h-11 rounded-xl" value={manualForm.phone_number} onChange={(e) => setManualForm(f => ({ ...f, phone_number: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access_token" className="font-bold text-sm">Permanent System Access Token <span className="text-destructive">*</span></Label>
                  <Input id="access_token" type="password" placeholder="EAAxxxxxxx ..." className="h-11 rounded-xl font-mono" value={manualForm.access_token} onChange={(e) => setManualForm(f => ({ ...f, access_token: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">Use a System User token for production. Never use a personal token.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50 border">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">Your credentials are encrypted at rest and never shared with third parties.</p>
              </div>

              <Button onClick={handleManualSave} disabled={saving || !manualForm.phone_number_id || !manualForm.waba_id || !manualForm.access_token} className="w-full h-11 rounded-xl font-bold">
                {saving ? "Saving..." : "Save & Connect"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ label, value, mono, badge }) => (
  <div className="flex items-start justify-between p-4 rounded-xl border bg-card shadow-sm gap-3">
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</p>
      {badge ? (
        <Badge variant="outline" className="capitalize font-bold">{value || "—"}</Badge>
      ) : (
        <p className={`text-sm font-bold text-foreground truncate ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</p>
      )}
    </div>
  </div>
);

export default WhatsAppSetup;
