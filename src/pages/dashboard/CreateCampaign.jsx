import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Loader2, Upload, ChevronDown, ChevronUp,
  FileSpreadsheet, UserPlus, Clock, Zap, Check, Smartphone,
  Send, CalendarDays, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";
import * as XLSX from "xlsx";

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [campaignName, setCampaignName] = useState("");
  const [openSection, setOpenSection] = useState("type");
  const [campaignType, setCampaignType] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [excelContacts, setExcelContacts] = useState([]);
  const [scheduleType, setScheduleType] = useState("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [variableMappings, setVariableMappings] = useState({});
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [interactiveParams, setInteractiveParams] = useState({ header_image_url: "", offer_code: "" });

  const [completedSections, setCompletedSections] = useState(new Set());

  const markComplete = (section) => {
    setCompletedSections(prev => new Set(prev).add(section));
  };

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["templates-for-campaign"],
    queryFn: async () => {
      let metaTemplates = [];
      try {
        const metaRes = await apiPost("/api/whatsapp", { action: "sync_templates" });
        metaTemplates = metaRes?.templates || [];
      } catch (e) {
        console.error("Meta sync failed", e);
      }
      
      const localRes = await apiGet("/api/whatsapp/templates/all");
      const localTemplates = localRes?.templates || [];
      
      const metaNames = new Set(metaTemplates.map(t => t.name));
      const localOnly = localTemplates.filter(t => !metaNames.has(t.name));
      return [...metaTemplates, ...localOnly];
    },
    enabled: !!user,
  });

  // Fetch existing contacts (for manual selection)
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts-for-campaign"],
    queryFn: async () => {
      const data = await apiPost("/api/whatsapp", { action: "get_contacts" });
      return data?.contacts || [];
    },
    enabled: !!user,
  });

  const selectedTemplate = (templates || []).find(t => t.id === templateId || t._id === templateId || t.name === templateId);
  const totalRecipients = dataSource === "excel" ? excelContacts.length : selectedContacts.length;

  // Extract variables
  const templateBody = (Array.isArray(selectedTemplate?.components) 
    ? selectedTemplate?.components?.find(c => c.type === 'BODY')?.text 
    : selectedTemplate?.body_text) || "";
  const templateVars = (templateBody.match(/\{\{(\d+)\}\}/g) || [])
    .map(v => parseInt(v.replace(/[{}]/g, "")))
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b);

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rows.length < 2) return toast({ title: "Invalid File", variant: "destructive" });

        const header = rows[0].map(h => String(h || "").toLowerCase().trim());
        const phoneIdx = header.findIndex(h => h.includes("phone") || h.includes("number"));
        const nameIdx = header.findIndex(h => h.includes("name"));

        const parsed = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const phone = String(row[phoneIdx] || "").trim();
          if (phone) parsed.push({ name: nameIdx !== -1 ? String(row[nameIdx] || "") : "User", phone });
        }
        setExcelContacts(parsed);
        toast({ title: `${parsed.length} contacts loaded` });
      } catch { toast({ title: "Error parsing Excel", variant: "destructive" }); }
    };
    reader.readAsArrayBuffer(file);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      let finalContacts = selectedContacts;
      if (dataSource === 'excel') {
        const res = await apiPost("/api/whatsapp/contacts/batch", { contacts: excelContacts });
        finalContacts = res.ids;
      }
      
      const payload = {
        name: campaignName,
        template_name: selectedTemplate?.name,
        audience_type: dataSource === 'excel' ? 'excel' : 'existing',
        schedule_type: scheduleType === 'scheduled' ? 'later' : 'now',
        scheduled_at: scheduleType === 'scheduled' ? `${scheduledDate}T${scheduledTime}` : null,
        contacts: finalContacts,
        requires_follow_up: requiresFollowUp,
        interactive_params: interactiveParams.header_image_url || interactiveParams.offer_code ? interactiveParams : null,
      };
      
      return await apiPost("/api/whatsapp/campaigns", payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campaign Saved!" });
      navigate(`/dashboard/campaigns/${data.campaign_id}${scheduleType === 'immediate' ? '?golive=true' : ''}`);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const SectionHeader = ({ number, title, sectionKey, summary }) => {
    const isOpen = openSection === sectionKey;
    const isComplete = completedSections.has(sectionKey);
    return (
      <button
        onClick={() => setOpenSection(isOpen ? "" : sectionKey)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {isComplete ? <Check className="w-4 h-4" /> : number}
          </div>
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {summary && !isOpen && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{summary}</span>}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/campaigns")}><ArrowLeft className="w-5 h-5" /></Button>
          <Input 
            value={campaignName} 
            onChange={e => setCampaignName(e.target.value)} 
            placeholder="Untitled Campaign" 
            className="h-10 text-lg font-bold border-none focus-visible:ring-0 px-0 translate-y-[-2px] uppercase tracking-tight"
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => createMutation.mutate()} disabled={!campaignName}>Save Draft</Button>
           <Button variant="default" size="sm" onClick={() => createMutation.mutate()} disabled={!campaignName || !templateId || totalRecipients === 0}>
             {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go Live"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          {/* Step 1: Type */}
          <SectionHeader number={1} title="Campaign Type" sectionKey="type" summary={campaignType ? "One Time Campaign" : ""} />
          {openSection === "type" && (
            <Card className="border-none shadow-none bg-muted/20">
              <CardContent className="p-4 pt-0 space-y-4">
                <RadioGroup value={campaignType} onValueChange={setCampaignType} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Label htmlFor="one_time" className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${campaignType === 'one_time' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                    <RadioGroupItem value="one_time" id="one_time" className="sr-only" />
                    <Send className="w-5 h-5 text-primary mb-2" />
                    <p className="font-bold text-sm">One Time</p>
                    <p className="text-[10px] text-muted-foreground">Broadcast to selected audience</p>
                  </Label>
                  <Label htmlFor="ongoing" className="p-4 rounded-xl border-2 border-border bg-muted/20 opacity-50 cursor-not-allowed">
                    <RadioGroupItem value="ongoing" id="ongoing" disabled className="sr-only" />
                    <Zap className="w-5 h-5 text-muted-foreground mb-2" />
                    <p className="font-bold text-sm">Ongoing</p>
                    <p className="text-[10px] text-muted-foreground">Triggered by external events</p>
                  </Label>
                </RadioGroup>
                <div className="flex justify-end"><Button size="sm" disabled={!campaignType} onClick={() => { markComplete("type"); setOpenSection("template"); }}>Continue</Button></div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Template */}
          <SectionHeader number={2} title="Message Template" sectionKey="template" summary={selectedTemplate?.name} />
          {openSection === "template" && (
            <Card className="border-none shadow-none bg-muted/20">
              <CardContent className="p-4 pt-0 space-y-4">
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger className="bg-card"><SelectValue placeholder="Select template..." /></SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={String(t.id || t._id)} value={String(t.id || t._id || t.name)}>
                        <div className="flex items-center gap-2">
                           <span className="font-medium text-xs">{t.name}</span>
                           <Badge variant="outline" className="text-[9px] uppercase">{t.status}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <div className="rounded-xl border border-border bg-card p-3 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Body Text</p>
                      <p className="text-xs whitespace-pre-wrap">{templateBody}</p>
                    </div>
                    
                    <div className="space-y-3 pt-3 border-t border-border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Rich Template Settings (Optional)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Header Image URL</Label>
                          <Input 
                            placeholder="https://..." 
                            className="h-8 text-xs" 
                            value={interactiveParams.header_image_url}
                            onChange={e => setInteractiveParams(p => ({...p, header_image_url: e.target.value}))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Offer/Coupon Code</Label>
                          <Input 
                            placeholder="e.g. SAVE20" 
                            className="h-8 text-xs uppercase" 
                            value={interactiveParams.offer_code}
                            onChange={e => setInteractiveParams(p => ({...p, offer_code: e.target.value.toUpperCase()}))}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input type="checkbox" className="rounded accent-primary w-3 h-3" checked={requiresFollowUp} onChange={e => setRequiresFollowUp(e.target.checked)} />
                        <span className="text-[11px] text-muted-foreground font-medium">Enable Follow-up (Send demo msg when read)</span>
                      </label>
                    </div>
                  </div>
                )}
                <div className="flex justify-end"><Button size="sm" disabled={!templateId} onClick={() => { markComplete("template"); setOpenSection("audience"); }}>Continue</Button></div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Audience */}
          <SectionHeader number={3} title="Audience" sectionKey="audience" summary={totalRecipients > 0 ? `${totalRecipients} Contacts` : ""} />
          {openSection === "audience" && (
            <Card className="border-none shadow-none bg-muted/20">
              <CardContent className="p-4 pt-0 space-y-4">
                <RadioGroup value={dataSource} onValueChange={setDataSource} className="grid grid-cols-2 gap-3">
                  <Label htmlFor="manual" className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${dataSource === 'manual' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                    <RadioGroupItem value="manual" id="manual" className="sr-only" />
                    <UserPlus className="w-5 h-5 text-primary mb-2" />
                    <p className="font-bold text-xs text-center">Existing List</p>
                  </Label>
                  <Label htmlFor="excel" className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${dataSource === 'excel' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                    <RadioGroupItem value="excel" id="excel" className="sr-only" />
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-2" />
                    <p className="font-bold text-xs text-center">Upload File</p>
                  </Label>
                </RadioGroup>

                {dataSource === 'manual' && (
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-card">
                    {contacts.map(c => (
                      <div key={c._id} className="flex items-center gap-3 p-3 border-b border-border last:border-0 hover:bg-muted/30">
                        <input 
                          type="checkbox" 
                          checked={selectedContacts.includes(c._id)} 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedContacts(prev => [...prev, c._id]);
                            else setSelectedContacts(prev => prev.filter(id => id !== c._id));
                          }}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold truncate">{c.name}</p>
                           <p className="text-[10px] text-muted-foreground">{c.phone_number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {dataSource === 'excel' && (
                  <div className="space-y-3">
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
                    <Button variant="outline" className="w-full h-24 border-dashed border-2 bg-card group" onClick={() => fileInputRef.current.click()}>
                       <div className="flex flex-col items-center gap-2">
                         <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                         <span className="text-xs text-muted-foreground">{excelContacts.length > 0 ? `${excelContacts.length} numbers loaded` : "Select Excel/CSV file"}</span>
                       </div>
                    </Button>
                  </div>
                )}
                <div className="flex justify-end"><Button size="sm" disabled={totalRecipients === 0} onClick={() => { markComplete("audience"); setOpenSection("schedule"); }}>Continue</Button></div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Schedule */}
          <SectionHeader number={4} title="Schedule" sectionKey="schedule" summary={scheduleType === 'immediate' ? "Immediate" : scheduledDate} />
          {openSection === "schedule" && (
             <Card className="border-none shadow-none bg-muted/20">
               <CardContent className="p-4 pt-0 space-y-4">
                 <RadioGroup value={scheduleType} onValueChange={setScheduleType} className="grid grid-cols-2 gap-3">
                    <Label htmlFor="immediate" className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${scheduleType === 'immediate' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                      <RadioGroupItem value="immediate" id="immediate" className="sr-only" />
                      <Zap className="w-5 h-5 text-amber-500 mb-2" />
                      <p className="font-bold text-xs text-center">Now</p>
                    </Label>
                    <Label htmlFor="later" className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${scheduleType === 'scheduled' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                      <RadioGroupItem value="scheduled" id="later" className="sr-only" />
                      <Clock className="w-5 h-5 text-blue-500 mb-2" />
                      <p className="font-bold text-xs text-center">Later</p>
                    </Label>
                 </RadioGroup>
                 {scheduleType === 'scheduled' && (
                   <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95">
                      <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                      <Input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
                   </div>
                 )}
                 <div className="flex justify-end"><Button size="sm" onClick={() => markComplete("schedule")}>Finish</Button></div>
               </CardContent>
             </Card>
          )}
        </div>

        {/* Sidebar: Preview */}
        <div className="space-y-4">
           <div className="sticky top-6">
              <div className="rounded-[40px] border-[8px] border-foreground/90 bg-foreground/5 shadow-2xl relative overflow-hidden aspect-[9/16] w-full max-w-[280px] mx-auto">
                 <div className="bg-[#075e54] pt-8 pb-3 px-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
                    <div className="flex-1">
                       <p className="text-[12px] font-bold text-white leading-tight">Your Business</p>
                       <p className="text-[10px] text-white/70">Online</p>
                    </div>
                 </div>
                 <div className="p-3 space-y-3 bg-[#e5ddd5] h-full overflow-y-auto">
                    <div className="max-w-[85%] bg-white rounded-xl p-3 shadow-sm relative animate-in slide-in-from-left duration-300">
                       <p className="text-[11px] leading-relaxed text-foreground whitespace-pre-wrap">
                         {templateBody || "Select a template to preview your message here..."}
                       </p>
                       <p className="text-[9px] text-muted-foreground text-right mt-1">10:45 AM</p>
                    </div>
                 </div>
              </div>

              {/* Test Message UI */}
              {templateId && (
                <div className="mt-6 space-y-3 bg-muted/50 p-4 rounded-2xl border border-border">
                   <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Test</p>
                      <Smartphone className="w-3 h-3 text-muted-foreground" />
                   </div>
                   {!showTestDialog ? (
                     <Button variant="outline" className="w-full text-xs h-9 rounded-xl" onClick={() => setShowTestDialog(true)}>
                       Send Test to Me
                     </Button>
                   ) : (
                     <div className="space-y-3 animate-in fade-in zoom-in-95">
                        <Input 
                          placeholder="Phone (incl. code)" 
                          value={testPhone} 
                          onChange={e => setTestPhone(e.target.value)} 
                          className="h-9 text-xs"
                        />
                        <div className="flex gap-2">
                           <Button size="sm" className="flex-1 text-xs" disabled={sendingTest || !testPhone} onClick={async () => {
                             setSendingTest(true);
                             try {
                               await apiPost("/api/whatsapp", { 
                                 action: "send_template", 
                                 to: testPhone, 
                                 template_name: selectedTemplate.name 
                               });
                               toast({ title: "Test Sent!" });
                               setShowTestDialog(false);
                             } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
                             finally { setSendingTest(false); }
                           }}>
                             {sendingTest ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send"}
                           </Button>
                           <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowTestDialog(false)}>Cancel</Button>
                        </div>
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
