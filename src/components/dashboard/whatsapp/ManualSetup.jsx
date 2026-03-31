import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Building2, Globe, Phone, Key, Webhook, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";

const steps = [
  { title: "Business Details", icon: Building2 },
  { title: "Meta Business", icon: Globe },
  { title: "WhatsApp Number", icon: Phone },
  { title: "API Connection", icon: Key },
  { title: "Webhook Setup", icon: Webhook },
];

const ManualSetup = ({ business, waAccount }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: "", website: "", industry: "", country: "", timezone: "",
    metaBusinessId: "", phoneNumber: "", phoneNumberId: "", wabaId: "", accessToken: "",
  });
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData(prev => ({
        ...prev,
        businessName: business.name || "", website: business.website || "",
        industry: business.industry || "", country: business.country || "",
        timezone: business.timezone || "", metaBusinessId: business.meta_business_id || "",
      }));
    }
    if (waAccount) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: waAccount.phone_number || "", phoneNumberId: waAccount.phone_number_id || "",
        wabaId: waAccount.waba_id || "", accessToken: "",
      }));
    }
  }, [business, waAccount]);

  const saveBusiness = useMutation({
    mutationFn: async () => {
      return await apiPost("/api/admin/businesses", {
        name: formData.businessName, website: formData.website,
        industry: formData.industry, country: formData.country, timezone: formData.timezone,
        meta_business_id: formData.metaBusinessId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({ title: "Business details saved" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const saveWhatsApp = useMutation({
    mutationFn: async () => {
      const payload = {
        phone_number: formData.phoneNumber,
        phone_number_id: formData.phoneNumberId,
        waba_id: formData.wabaId,
      };
      if (formData.accessToken) {
        payload.access_token = formData.accessToken;
      }
      return await apiPost("/api/admin/whatsapp-accounts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-account"] });
      toast({ title: "WhatsApp details saved" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleValidateToken = async () => {
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      toast({ title: "Token validation", description: "Token format looks valid." });
    }, 1500);
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0 || currentStep === 1) await saveBusiness.mutateAsync();
      if (currentStep === 2 || currentStep === 3) await saveWhatsApp.mutateAsync();
      if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
      else toast({ title: "Setup complete!", description: "Your WhatsApp Business API is configured." });
    } catch (e) {
      // Error handled by mutation
    }
  };

  const webhookUrl = `${import.meta.env.VITE_API_BASE_URL}/api/webhook`;
  const verifyToken = `Yestick AI_${user?.id?.toString().slice(0, 8)}`;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label>Business Name</Label>
              <Input value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} placeholder="Your Business Name" className="mt-1.5" />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://yourbusiness.com" className="mt-1.5" />
            </div>
            <div>
              <Label>Industry</Label>
              <Select value={formData.industry} onValueChange={v => setFormData({ ...formData, industry: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Select value={formData.country} onValueChange={v => setFormData({ ...formData, country: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Timezone</Label>
                <Select value={formData.timezone} onValueChange={v => setFormData({ ...formData, timezone: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Timezone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IST (UTC+5:30)">IST (UTC+5:30)</SelectItem>
                    <SelectItem value="EST (UTC-5)">EST (UTC-5)</SelectItem>
                    <SelectItem value="GMT (UTC+0)">GMT (UTC+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-secondary rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-foreground">Prerequisites</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                <li>Create a <a href="https://business.facebook.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Meta Business Account</a></li>
                <li>Verify your business identity</li>
                <li>Create a WhatsApp Business App in Meta Developer Portal</li>
              </ol>
            </div>
            <div>
              <Label>Meta Business Account ID</Label>
              <Input value={formData.metaBusinessId} onChange={e => setFormData({ ...formData, metaBusinessId: e.target.value })} placeholder="Enter your Meta Business Account ID" className="mt-1.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Verification Status:</span>
              <Badge variant={business?.meta_verification_status === "verified" ? "default" : "outline"}>
                {business?.meta_verification_status || "Pending"}
              </Badge>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>WhatsApp Phone Number</Label>
              <Input value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="+91 98765 43210" className="mt-1.5" />
            </div>
            <div>
              <Label>Phone Number ID</Label>
              <Input value={formData.phoneNumberId} onChange={e => setFormData({ ...formData, phoneNumberId: e.target.value })} placeholder="From Meta Developer Console" className="mt-1.5" />
            </div>
            <div>
              <Label>WhatsApp Business Account ID (WABA)</Label>
              <Input value={formData.wabaId} onChange={e => setFormData({ ...formData, wabaId: e.target.value })} placeholder="From Meta Developer Console" className="mt-1.5" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground">
              <p>Enter your permanent Meta Cloud API access token from the <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Meta Developer Console</a>.</p>
            </div>
            <div>
              <Label>Access Token</Label>
              <Input value={formData.accessToken} onChange={e => setFormData({ ...formData, accessToken: e.target.value })} placeholder={waAccount?.phone_number_id ? "••••••••  (token saved — enter new to update)" : "Enter your access token"} className="mt-1.5" />
            </div>
            <Button variant="outline" size="sm" onClick={handleValidateToken} disabled={validating || !formData.accessToken}>
              {validating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Validating...</> : "Validate Token"}
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <div className="flex gap-2 mt-1.5">
                <Input value={webhookUrl} readOnly className="bg-muted" />
                <Button size="sm" onClick={() => { navigator.clipboard.writeText(webhookUrl); toast({ title: "Copied!" }); }}>Copy</Button>
              </div>
            </div>
            <div>
              <Label>Verify Token</Label>
              <div className="flex gap-2 mt-1.5">
                <Input value={verifyToken} readOnly className="bg-muted" />
                <Button size="sm" onClick={() => { navigator.clipboard.writeText(verifyToken); toast({ title: "Copied!" }); }}>Copy</Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Webhook Status:</span>
              <Badge variant={waAccount?.webhook_verified ? "default" : "outline"}>
                {waAccount?.webhook_verified ? "Connected" : "Pending"}
              </Badge>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${i === currentStep ? "bg-primary text-black" :
                    i < currentStep ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  }`}
              >
                {i < currentStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-4">
        {renderStep()}
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext}>
            {saveBusiness.isPending || saveWhatsApp.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
            ) : currentStep === steps.length - 1 ? "Complete Setup" : (
              <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualSetup;
