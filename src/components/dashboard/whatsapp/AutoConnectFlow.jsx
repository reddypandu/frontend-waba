import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn, Loader2, CheckCircle, CheckCircle2, Shield, Phone, Wifi, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";

const STEPS = [
  { id: 1, label: "Authorize" },
  { id: 2, label: "Select Business" },
  { id: 3, label: "Select Number" },
  { id: 4, label: "Done" },
];

const AutoConnectFlow = ({ onSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState("idle"); // idle | connecting | processing | done | error
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metaAppId, setMetaAppId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { toast } = useToast();

  const esWabaIdRef = useRef("");
  const esPhoneNumberIdRef = useRef("");

  // Load App ID from Backend
  useEffect(() => {
    const fetchAppId = async () => {
      try {
        const data = await apiPost("/api/otp", { action: "get_app_id" });
        if (data?.app_id) setMetaAppId(data.app_id);
      } catch (err) {
        console.error("Failed to fetch Meta App ID:", err);
      }
    };
    fetchAppId();
  }, []);

  // Initialize Facebook SDK
  useEffect(() => {
    if (!metaAppId) return;

    const initFB = () => {
      if (!window.FB) return;
      window.FB.init({
        appId: metaAppId,
        cookie: true,
        xfbml: true,
        version: "v24.0",
      });
      setSdkReady(true);
    };

    if (window.FB) {
      initFB();
    } else {
      window.fbAsyncInit = initFB;
      // Load the SDK script if not already loaded
      if (!document.getElementById('fb-sdk-script')) {
        const script = document.createElement("script");
        script.id = "fb-sdk-script";
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [metaAppId]);

  // Listen for WABA/Phone IDs from Meta popup
  const handleMessage = useCallback((event) => {
    if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;
    try {
      const messageData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      if (messageData.type === "WA_EMBEDDED_SIGNUP") {
        if (messageData.data?.waba_id) {
          esWabaIdRef.current = messageData.data.waba_id;
          esPhoneNumberIdRef.current = messageData.data.phone_number_id || "";
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const embeddedSignupMutation = useMutation({
    mutationFn: async (authResponse) => {
      const wabaId = esWabaIdRef.current;
      const phoneNumberId = esPhoneNumberIdRef.current;

      const data = await apiPost("/api/otp", {
        action: "exchange_token",
        code: authResponse.code,
        user_id: user.id,
        waba_id: wabaId,
        phone_number_id: phoneNumberId,
      });

      esWabaIdRef.current = "";
      esPhoneNumberIdRef.current = "";
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wa-setup-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setStep("done");
      toast({ title: "🎉 WhatsApp Business Connected!", description: "Your account is live and ready to use." });
      setTimeout(() => onSuccess?.(), 2000);
    },
    onError: (err) => {
      setStep("error");
      setErrorMsg(err.message);
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    },
  });

  const handleFacebookLogin = () => {
    if (!window.FB || !sdkReady) {
      toast({
        title: "Facebook SDK not ready",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setStep("connecting");

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          setStep("processing");
          embeddedSignupMutation.mutate(response.authResponse);
        } else {
          setStep("idle");
          toast({ title: "Facebook login cancelled", variant: "destructive" });
        }
        setLoading(false);
      },
      {
        config_id: "930508866294892",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: "mobile",
          featureType: "",
          sessionInfoVersion: "3",
        },
      }
    );
  };

  // ── Done State
  if (step === "done") {
    return (
      <Card className="border-emerald-400/40 bg-gradient-to-br from-emerald-50/60 to-card shadow-sm">
        <CardContent className="py-14 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-2 shadow-inner">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-foreground">All Set!</h3>
          <p className="text-muted-foreground max-w-xs text-sm">Your WhatsApp Business API is now connected and ready to use.</p>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">Connected & Active</Badge>
        </CardContent>
      </Card>
    );
  }

  // ── Error State
  if (step === "error") {
    return (
      <Card className="border-destructive/30 shadow-sm">
        <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-2">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-destructive">Connection Failed</h3>
          <p className="text-muted-foreground text-sm max-w-sm">{errorMsg || "Something went wrong. Please try again."}</p>
          <Button variant="outline" onClick={() => { setStep("idle"); setErrorMsg(null); }} className="rounded-xl mt-2">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Processing State
  if (step === "processing") {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-14 flex flex-col items-center text-center space-y-5">
          <div className="relative w-20 h-20">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Wifi className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Connecting your account...</h3>
            <p className="text-muted-foreground text-sm">Exchanging tokens and saving your business details.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Idle / Connect State
  return (
    <div className="space-y-5">
      {/* Info Cards Row */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[
          { icon: LogIn, label: "Authorize", desc: "Login with Facebook" },
          { icon: Phone, label: "Select Number", desc: "Choose your phone" },
          { icon: Shield, label: "Secure & Fast", desc: "Token encrypted" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="rounded-xl border bg-card p-3 text-center shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-bold text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      <Card className="border-[#1877F2]/20 shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1877F2] via-[#42b883] to-[#25D366]" />
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#1877F2]/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#1877F2]">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <CardTitle className="text-lg">Connect with Facebook</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Official Meta Embedded Signup</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pb-7">
          <div className="bg-muted/50 rounded-xl p-4 space-y-2.5 border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What happens when you click below:</p>
            {[
              "Facebook login popup opens securely",
              "Select or create your Meta Business Account",
              "Select your WhatsApp Business Account (WABA)",
              "Select or register a Phone Number",
              "Our platform gets a secure access token",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground">{step}</p>
              </div>
            ))}
          </div>

          <Button
            onClick={handleFacebookLogin}
            disabled={loading || embeddedSignupMutation.isPending || !sdkReady}
            size="lg"
            className="w-full h-12 rounded-xl font-bold text-sm bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-lg gap-3 transition-all"
          >
            {loading || embeddedSignupMutation.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
                <ArrowRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </Button>

          {!sdkReady && metaAppId && (
            <p className="text-xs text-muted-foreground text-center animate-pulse">Loading Facebook SDK...</p>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            By connecting, you agree to <a href="https://www.whatsapp.com/legal/business-policy" target="_blank" rel="noreferrer" className="underline">WhatsApp's Business Policy</a>. We only access your WhatsApp Business Account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoConnectFlow;
