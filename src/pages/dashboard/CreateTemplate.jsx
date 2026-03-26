import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Plus, Bold, Italic, Globe, Phone, X, Smartphone, 
  ExternalLink, Type, Image as ImageIcon, Video, FileText, Loader2,
  Check, Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
];

const CreateTemplate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = React.useState({
    name: "",
    category: "MARKETING",
    language: "en",
    headerType: "none", // none, text, image, video, document
    headerText: "",
    body: "",
    footer: "",
    buttons: []
  });

  const [variableSamples, setVariableSamples] = React.useState({});
  const [headerFile, setHeaderFile] = React.useState(null);
  const [headerPreviewUrl, setHeaderPreviewUrl] = React.useState(null);

  // Extract variables from body text: {{1}}, {{2}}, etc.
  const extractedVars = React.useMemo(() => {
    const matches = form.body.match(/\{\{(\d+)\}\}/g) || [];
    const ids = matches.map(m => parseInt(m.replace(/[{}]/g, "")));
    return [...new Set(ids)].sort((a, b) => a - b);
  }, [form.body]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeaderFile(file);
      setHeaderPreviewUrl(URL.createObjectURL(file));
    }
  };

  const addVariable = () => {
    const nextIdx = extractedVars.length > 0 ? Math.max(...extractedVars) + 1 : 1;
    setForm(prev => ({ ...prev, body: prev.body + ` {{${nextIdx}}}` }));
  };

  const formatText = (wrap) => {
    setForm(prev => ({ ...prev, body: prev.body + `${wrap}text${wrap}` }));
  };

  const addButton = (type) => {
    if (form.buttons.length >= 3) {
      toast({ title: "Maximum 3 buttons allowed", variant: "destructive" });
      return;
    }
    const newBtn = { type, text: "" };
    if (type === 'URL') newBtn.url = "";
    if (type === 'PHONE_NUMBER') newBtn.phone_number = "";
    setForm({ ...form, buttons: [...form.buttons, newBtn] });
  };

  const removeButton = (idx) => {
    setForm({ ...form, buttons: form.buttons.filter((_, i) => i !== idx) });
  };

  const updateButton = (idx, field, val) => {
    // Meta sanitization: no newlines, no formatting, max 25 chars
    const sanitized = val.replace(/[\n\r]/g, "").replace(/[*_~`]/g, "").slice(0, 25);
    const newBtns = [...form.buttons];
    newBtns[idx] = { ...newBtns[idx], [field]: field === 'text' ? sanitized : val };
    setForm({ ...form, buttons: newBtns });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const components = [];

      // Header component
      if (form.headerType === 'text' && form.headerText) {
        components.push({ type: "HEADER", format: "TEXT", text: form.headerText });
      } else if (['image', 'video', 'document'].includes(form.headerType)) {
        components.push({ 
          type: "HEADER", 
          format: form.headerType.toUpperCase(), 
          example: { header_handle: ["4_HANDLE_ID_FROM_UPLOAD_API"] } 
        });
      }

      // Body component with dynamic examples
      const bodyComp = { type: "BODY", text: form.body };
      if (extractedVars.length > 0) {
        const samples = extractedVars.map(v => variableSamples[v] || `Sample ${v}`);
        bodyComp.example = { body_text: [samples] };
      }
      components.push(bodyComp);

      // Footer
      if (form.footer) {
        components.push({ type: "FOOTER", text: form.footer });
      }

      // Buttons
      if (form.buttons.length > 0) {
        components.push({ 
          type: "BUTTONS", 
          buttons: form.buttons.map(b => ({
            type: b.type,
            text: b.text,
            ...(b.url && { url: b.url }),
            ...(b.phone_number && { phone_number: b.phone_number })
          }))
        });
      }

      return apiPost("/api/whatsapp", {
        action: "create_template",
        name: form.name.toLowerCase().replace(/\s+/g, '_'),
        category: form.category,
        language: form.language,
        components
      });
    },
    onSuccess: () => {
      toast({ title: "Template submitted!", description: "Waiting for Meta's approval." });
      navigate("/dashboard/templates");
    },
    onError: (err) => {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/templates")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <Input 
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:opacity-30"
            placeholder="Enter template name..."
          />
          <p className="text-xs text-muted-foreground mt-0.5">WhatsApp · Create & Submit for Approval</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard/templates")}>Cancel</Button>
          <Button 
            onClick={() => createMutation.mutate()} 
            disabled={!form.name || !form.body || createMutation.isPending}
            className="shadow-lg px-6"
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Submit Template
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* CONFIGURATION */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Language</Label>
                <Select value={form.language} onValueChange={v => setForm({...form, language: v})}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(l => (
                      <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 py-4 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> Template Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <Label className="text-sm font-bold">Header (Optional)</Label>
                <RadioGroup value={form.headerType} onValueChange={v => setForm({...form, headerType: v})} className="flex flex-wrap gap-4">
                  {['none', 'text', 'image', 'video', 'document'].map(t => (
                    <div key={t} className="flex items-center space-x-2">
                      <RadioGroupItem value={t} id={`ht-${t}`} />
                      <Label htmlFor={`ht-${t}`} className="capitalize cursor-pointer text-xs">{t}</Label>
                    </div>
                  ))}
                </RadioGroup>
                
                {form.headerType === 'text' && (
                  <Input 
                    value={form.headerText} 
                    onChange={e => setForm({...form, headerText: e.target.value})} 
                    placeholder="Enter header text (e.g. Order Confirmed)" 
                    className="h-10 rounded-lg"
                  />
                )}
                
                {['image', 'video', 'document'].includes(form.headerType) && (
                  <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-2 bg-muted/20 relative group">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                      {form.headerType === 'image' ? <ImageIcon className="h-5 w-5" /> : form.headerType === 'video' ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <p className="text-xs font-bold">Click to upload {form.headerType}</p>
                    <p className="text-[10px] text-muted-foreground">{headerFile ? headerFile.name : "Supported formats based on selection"}</p>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Body Message</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{form.body.length}/1024</span>
                </div>
                <div className="relative">
                  <Textarea 
                    value={form.body} 
                    onChange={e => setForm({...form, body: e.target.value})} 
                    placeholder="Hi {{1}}, thank you for choosing us! Your code is {{2}}." 
                    className="min-h-[140px] rounded-xl resize-none pb-12 focus-visible:ring-1"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <button onClick={addVariable} className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline">
                      <Plus className="h-3 w-3" /> Add variable
                    </button>
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                      <button onClick={() => formatText('*')} className="p-1 hover:bg-white rounded shadow-sm"><Bold className="h-3.5 w-3.5" /></button>
                      <button onClick={() => formatText('_')} className="p-1 hover:bg-white rounded shadow-sm"><Italic className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variable Samples */}
              {extractedVars.length > 0 && (
                <div className="p-4 rounded-xl border bg-primary/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">!</div>
                     <p className="text-xs font-bold">Variable Samples (Required by Meta)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {extractedVars.map(v => (
                      <div key={v} className="flex items-center gap-2">
                         <span className="text-[10px] font-mono text-muted-foreground shrink-0">{`{{${v}}}`}</span>
                         <Input 
                           value={variableSamples[v] || ""} 
                           onChange={e => setVariableSamples({...variableSamples, [v]: e.target.value})} 
                           placeholder={`Sample for {{${v}}}`}
                           className="h-8 text-xs rounded-lg"
                         />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="space-y-2">
                 <Label className="text-sm font-bold">Footer (Optional)</Label>
                 <Input 
                   value={form.footer} 
                   onChange={e => setForm({...form, footer: e.target.value})} 
                   placeholder="e.g. Reply STOP to opt-out" 
                   maxLength={60}
                   className="h-10 rounded-lg"
                 />
              </div>

              {/* Buttons */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                   <Label className="text-sm font-bold">Buttons (Optional)</Label>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addButton('QUICK_REPLY')} className="text-[10px] h-7">+ Quick Reply</Button>
                      <Button variant="outline" size="sm" onClick={() => addButton('URL')} className="text-[10px] h-7">+ Website</Button>
                      <Button variant="outline" size="sm" onClick={() => addButton('PHONE_NUMBER')} className="text-[10px] h-7">+ Phone</Button>
                   </div>
                </div>
                
                <div className="grid gap-3">
                  {form.buttons.map((btn, i) => (
                    <div key={i} className="p-3 border rounded-xl flex items-start gap-3 bg-muted/10 relative group">
                      <div className="mt-1.5 w-7 h-7 rounded-lg bg-background flex items-center justify-center border text-primary">
                        {btn.type === 'QUICK_REPLY' ? <Smartphone className="h-4 w-4" /> : btn.type === 'URL' ? <Globe className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input value={btn.text} onChange={e => updateButton(i, 'text', e.target.value)} placeholder="Button Text (max 25)" className="h-8 text-xs font-bold" />
                        {btn.type === 'URL' && <Input value={btn.url} onChange={e => updateButton(i, 'url', e.target.value)} placeholder="https://..." className="h-7 text-[10px]" />}
                        {btn.type === 'PHONE_NUMBER' && <Input value={btn.phone_number} onChange={e => updateButton(i, 'phone_number', e.target.value)} placeholder="+123..." className="h-7 text-[10px]" />}
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeButton(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6 overflow-hidden rounded-[2.5rem] border-8 border-gray-800 shadow-2xl bg-[#ECE5DD] min-h-[580px] flex flex-col">
            <CardHeader className="bg-[#075E54] text-white py-4 flex flex-row items-center gap-3 rounded-t-none">
              <ArrowLeft className="h-4 w-4" />
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                <ImageIcon className="h-5 w-5 text-white/50" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">Your Business</p>
                <p className="text-[10px] opacity-70">Online</p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex flex-col justify-start">
              <div className="space-y-4">
                <div className="bg-white rounded-xl rounded-tl-none shadow-sm max-w-[92%] overflow-hidden border-l border-t border-gray-100 relative">
                  {/* Header Preview */}
                  {form.headerType !== 'none' && (
                    <div className="bg-gray-50 flex flex-col items-center justify-center border-b min-h-[100px] overflow-hidden">
                      {headerPreviewUrl ? (
                        form.headerType === 'image' ? <img src={headerPreviewUrl} className="w-full h-full object-cover" /> :
                        form.headerType === 'video' ? <div className="p-8 text-primary/50"><Video className="h-8 w-8" /></div> :
                        <div className="p-8 text-primary/50"><FileText className="h-8 w-8" /></div>
                      ) : (
                        <div className="p-8 flex flex-col items-center gap-2 text-gray-300">
                          {form.headerType === 'text' ? <p className="text-[11px] font-bold text-black p-2">{form.headerText || "TEXT HEADER"}</p> : <Type className="h-10 w-10" />}
                          {form.headerType !== 'text' && <span className="text-[8px] font-bold uppercase tracking-widest">{form.headerType} placeholder</span>}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3 space-y-1">
                    <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
                      {form.body || <span className="text-muted-foreground/30 italic">Start typing to craft your message...</span>}
                    </p>
                    {form.footer && <p className="text-[11px] text-gray-400 mt-2 border-t pt-1">{form.footer}</p>}
                    <div className="flex items-center justify-end gap-1 opacity-40">
                      <p className="text-[9px]">12:00 PM</p>
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                {/* Preview Buttons */}
                <div className="space-y-1.5 max-w-[92%]">
                   {form.buttons.map((btn, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm py-2 px-3 text-center text-[12px] font-semibold text-[#00a5f4] flex items-center justify-center gap-2">
                        {btn.type === 'URL' ? <ExternalLink className="w-3 h-3" /> : btn.type === 'PHONE_NUMBER' ? <Phone className="w-3 h-3" /> : null}
                        {btn.text || "Button Text"}
                      </div>
                   ))}
                </div>
              </div>
            </CardContent>
            <div className="p-6 bg-white border-t rounded-b-[2.5rem]">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Info className="h-5 w-5" /></div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 leading-tight">Professional Preview</p>
                    <p className="text-[9px] text-muted-foreground">This is how your customers will see your message.</p>
                  </div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplate;
