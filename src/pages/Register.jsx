import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";
import { motion } from "framer-motion";

const benefits = [
  "14-day free trial, no credit card needed",
  "Up to 1,000 messages free forever",
  "Setup in under 5 minutes",
  "Official Meta WhatsApp Business API",
];

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!form.email) {
      toast({ title: "Please enter your email first", variant: "destructive" });
      return;
    }
    setSendingOtp(true);
    try {
      await apiPost("/api/auth/send-otp", { email: form.email });
      setOtpSent(true);
      toast({ title: "OTP sent to your email!" });
    } catch (error) {
      toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({ title: "Please enter the OTP", variant: "destructive" });
      return;
    }
    setVerifyingOtp(true);
    try {
      await apiPost("/api/auth/verify-otp", { email: form.email, otp });
      setOtpVerified(true);
      toast({ title: "OTP verified successfully!" });
    } catch (error) {
      toast({ title: "Failed to verify OTP", description: error.message, variant: "destructive" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!otpVerified) {
      toast({ title: "Please verify your email first", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await signUp(form.email, form.password, form.name);
      if (error) throw error;
      toast({ title: "Account created!", description: "You are now signed in." });
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden items-center justify-center p-12 bg-muted/30">
        <div className="absolute inset-0 opacity-30" />
        
        <div className="relative z-10 max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-btn text-primary-foreground">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">
              WazzUp
            </span>
          </Link>

          <h2 className="text-4xl font-extrabold text-foreground mb-4 leading-tight">
            Start scaling with
            <br />
            <span className="text-primary">WhatsApp today</span>
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Join 50,000+ businesses already reaching customers directly on their phones.
          </p>

          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11 border-border/60 focus:border-primary/60 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="h-11 border-border/60 focus:border-primary/60 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work Email *</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => {
                     setForm({ ...form, email: e.target.value });
                     setOtpSent(false);
                     setOtpVerified(false);
                  }}
                  disabled={otpVerified}
                  className="h-11 flex-1 border-border/60 focus:border-primary/60 transition-colors"
                />
                {!otpVerified && (
                  <Button 
                    type="button" 
                    onClick={handleSendOtp} 
                    disabled={sendingOtp || !form.email}
                    className="h-11 px-4"
                  >
                    {sendingOtp ? "Sending..." : (otpSent ? "Resend" : "Send OTP")}
                  </Button>
                )}
              </div>
            </div>

            {otpSent && !otpVerified && (
              <div className="space-y-1.5 animate-in fade-in zoom-in-95">
                <Label htmlFor="otp">Verification Code *</Label>
                <div className="flex gap-2">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-11 flex-1 border-border/60 focus:border-primary/60 transition-colors"
                    maxLength={6}
                  />
                  <Button 
                    type="button" 
                    onClick={handleVerifyOtp} 
                    disabled={verifyingOtp || otp.length !== 6}
                    className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              </div>
            )}

            {otpVerified && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium py-1">
                <Check className="h-4 w-4" /> OTP Verified Successfully
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-11 border-border/60 focus:border-primary/60 transition-colors"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold shadow-md active:scale-[0.98] transition-all duration-200 mt-2"
              disabled={loading || !otpVerified}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="hover:underline">Terms</Link> and{" "}
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
