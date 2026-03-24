import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, FileSpreadsheet, Send, Zap, Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaignName, setCampaignName] = React.useState("");
  const [templateId, setTemplateId] = React.useState("");
  const [audienceType, setAudienceType] = React.useState("existing");
  const [scheduleType, setScheduleType] = React.useState("now");

  const { data: templatesData } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: () => apiPost("/api/whatsapp", { action: "get_templates" }),
    enabled: !!user,
  });

  const templates = (templatesData?.data || []).filter(t => t.status === "APPROVED");

  const createMutation = useMutation({
    mutationFn: async () => {
      const template = templates.find(t => t.id === templateId);
      return apiPost("/api/whatsapp/campaigns", {
        name: campaignName,
        template_name: template?.name || templateId,
        audience_type: audienceType,
        schedule_type: scheduleType,
        contacts: [], // Backend will fetch if audience_type is 'existing'
      });
    },
    onSuccess: () => {
      toast({ title: "Campaign created successfully!" });
      navigate("/dashboard/campaigns");
    },
    onError: (err) => {
      toast({ title: "Failed to create campaign", description: err.message, variant: "destructive" });
    }
  });

  const selectedTemplate = templates.find(t => t.id === templateId);
  const templateBody = selectedTemplate?.components?.find(c => c.type === 'BODY')?.text || "Select a template to preview its content.";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/campaigns")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Input 
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
            placeholder="Untitled Campaign"
          />
        </div>
        <Button 
          onClick={() => createMutation.mutate()} 
          disabled={!campaignName || !templateId || createMutation.isPending}
          className="shadow-md"
        >
          <Send className="h-4 w-4 mr-2" /> 
          {createMutation.isPending ? "Launching..." : "Launch Campaign"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">1</span>
                Template Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a WhatsApp template" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id} className="cursor-pointer">{t.name}</SelectItem>
                  ))}
                  {templates.length === 0 && <div className="p-4 text-sm text-center text-muted-foreground italic">No templates approved yet</div>}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">2</span>
                Choose Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={audienceType} onValueChange={setAudienceType} className="grid grid-cols-2 gap-4">
                <div className={`flex items-center space-x-2 border-2 rounded-xl p-4 cursor-pointer transition-all ${audienceType === "existing" ? "border-primary bg-primary/5" : "hover:bg-muted border-border"}`}>
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing" className="flex flex-col gap-1 cursor-pointer">
                    <span className="font-bold">Existing Contacts</span>
                    <span className="text-xs text-muted-foreground">Select from your contact list</span>
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 border-2 rounded-xl p-4 cursor-pointer transition-all ${audienceType === "excel" ? "border-primary bg-primary/5" : "hover:bg-muted border-border"}`}>
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex flex-col gap-1 cursor-pointer">
                    <span className="font-bold">Upload Excel/CSV</span>
                    <span className="text-xs text-muted-foreground">Import contacts for this campaign</span>
                  </Label>
                </div>
              </RadioGroup>

              {audienceType === "excel" && (
                <div className="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center space-y-3 bg-primary/5">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-primary/50" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">Accepts .csv, .xlsx, .xls</p>
                  </div>
                  <Input type="file" className="hidden" id="file-upload" />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload').click()} className="rounded-lg">
                    Browse Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">3</span>
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
               <RadioGroup value={scheduleType} onValueChange={setScheduleType} className="grid grid-cols-2 gap-4">
                <div className={`flex items-center space-x-2 border-2 rounded-xl p-4 cursor-pointer transition-all ${scheduleType === "now" ? "border-primary bg-primary/5" : "hover:bg-muted border-border"}`}>
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="font-bold cursor-pointer">Send Instantly</Label>
                </div>
                <div className={`flex items-center space-x-2 border-2 rounded-xl p-4 cursor-pointer transition-all ${scheduleType === "later" ? "border-primary bg-primary/5" : "hover:bg-muted border-border"}`}>
                  <RadioGroupItem value="later" id="later" />
                  <Label htmlFor="later" className="font-bold cursor-pointer">Schedule for Later</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6 overflow-hidden rounded-2xl border-none shadow-xl bg-[#ECE5DD]">
            <CardHeader className="bg-[#075E54] text-white py-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Smartphone className="w-4 h-4" /> WhatsApp Preview
              </div>
            </CardHeader>
            <CardContent className="min-h-[450px] p-4 flex flex-col justify-start">
              <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[90%] space-y-2 relative border-l-4 border-[#25D366]">
                <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">{templateBody}</p>
                <div className="flex items-center justify-end gap-1 opacity-50">
                   <p className="text-[10px] text-right">12:00 PM</p>
                   <Zap className="w-3 h-3 fill-blue-500 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
