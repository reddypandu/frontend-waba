import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Bold, Italic, Type, MessageSquare, Globe, Phone, X, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";

const EditTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = React.useState({
    name: "",
    category: "MARKETING",
    language: "en",
    headerType: "none",
    headerText: "",
    headerFormat: "IMAGE",
    body: "",
    footer: "",
    buttons: []
  });
  const [headerPreviewUrl, setHeaderPreviewUrl] = React.useState(null);

  const { data: templateData, isLoading } = useQuery({
    queryKey: ["template", id],
    queryFn: () => apiGet(`/api/whatsapp/templates/${id}`),
    enabled: !!id,
  });

  const template = templateData?.template;

  React.useEffect(() => {
    if (template) {
      const components = template.components || [];
      const header = components.find(c => c.type === 'HEADER');
      const body = components.find(c => c.type === 'BODY');
      const footer = components.find(c => c.type === 'FOOTER');
      const buttonComp = components.find(c => c.type === 'BUTTONS');

      setForm({
        name: template.name || "",
        category: template.category || "MARKETING",
        language: template.language || "en",
        headerType: header ? (header.format === 'TEXT' ? 'text' : 'media') : 'none',
        headerText: header?.text || "",
        headerFormat: header?.format || "IMAGE",
        body: body?.text || "",
        footer: footer?.text || "",
        buttons: buttonComp?.buttons?.map(b => ({
          type: b.type,
          text: b.text,
          url: b.url,
          phone_number: b.phone_number
        })) || []
      });
    }
  }, [template]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setHeaderPreviewUrl(url);
      toast({ title: "Asset selected", description: "This will be re-uploaded on save." });
    }
  };

  const addButton = (type) => {
    if (form.buttons.length >= 3) {
      toast({ title: "Max 3 buttons allowed", variant: "destructive" });
      return;
    }
    const newBtn = type === 'QUICK_REPLY' 
      ? { type, text: "" } 
      : { type, text: "", url: type === 'URL' ? "" : undefined, phone_number: type === 'PHONE_NUMBER' ? "" : undefined };
    setForm({ ...form, buttons: [...form.buttons, newBtn] });
  };

  const removeButton = (index) => {
    const newBtns = [...form.buttons];
    newBtns.splice(index, 1);
    setForm({ ...form, buttons: newBtns });
  };

  const updateButton = (index, field, value) => {
    const newBtns = [...form.buttons];
    newBtns[index] = { ...newBtns[index], [field]: value };
    setForm({ ...form, buttons: newBtns });
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const components = [{ type: "BODY", text: form.body }];
      if (form.headerType === 'text') {
        components.push({ type: "HEADER", format: "TEXT", text: form.headerText });
      } else if (form.headerType === 'media') {
        components.push({ type: "HEADER", format: form.headerFormat, example: { header_handle: ["456"] } });
      }
      if (form.footer) components.push({ type: "FOOTER", text: form.footer });
      if (form.buttons.length > 0) {
        components.push({ type: "BUTTONS", buttons: form.buttons.map(b => {
          const btn = { type: b.type, text: b.text };
          if (b.type === 'URL') btn.url = b.url;
          if (b.type === 'PHONE_NUMBER') btn.phone_number = b.phone_number;
          return btn;
        })});
      }

      return apiPost("/api/whatsapp", {
        action: "edit_template",
        name: form.name,
        category: form.category,
        components
      });
    },
    onSuccess: () => {
      toast({ title: "Template updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      navigate("/dashboard/templates");
    },
    onError: (err) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) return <div className="p-20 text-center text-muted-foreground animate-pulse">Loading data...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/templates")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Template</h1>
          <p className="text-sm text-muted-foreground">Modify your WhatsApp marketing assets</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => navigate("/dashboard/templates")}>Cancel</Button>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Plus className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm bg-card/50">
            <CardHeader><CardTitle className="text-lg">Template Basics</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input value={form.name} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/50">
            <CardHeader><CardTitle className="text-lg">Message Content</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Header (Optional)</Label>
                <RadioGroup value={form.headerType} onValueChange={v => setForm({...form, headerType: v})} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="h-none" /><Label htmlFor="h-none" className="font-normal">None</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="text" id="h-text" /><Label htmlFor="h-text" className="font-normal">Text</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="media" id="h-media" /><Label htmlFor="h-media" className="font-normal">Media</Label></div>
                </RadioGroup>
                
                {form.headerType === 'text' && (
                  <Input 
                    value={form.headerText} 
                    onChange={e => setForm({...form, headerText: e.target.value})} 
                    placeholder="Enter header text (max 60 chars)" 
                    maxLength={60} 
                  />
                )}
                {form.headerType === 'media' && (
                  <div className="space-y-3 mt-2">
                    <Select value={form.headerFormat} onValueChange={v => setForm({...form, headerFormat: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMAGE">Image (.jpg, .png)</SelectItem>
                        <SelectItem value="VIDEO">Video (.mp4)</SelectItem>
                        <SelectItem value="DOCUMENT">Document (.pdf)</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-3 p-4 border-2 border-dashed rounded-xl bg-muted/30">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">Change {form.headerFormat}</p>
                        <p className="text-[10px] text-muted-foreground">Re-upload to change media</p>
                      </div>
                      <Input type="file" className="hidden" id="header-file" onChange={handleFileChange} accept={form.headerFormat === 'IMAGE' ? "image/*" : form.headerFormat === 'VIDEO' ? "video/*" : ".pdf"} />
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="header-file" className="cursor-pointer">Select</label>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Body Message</Label>
                  <div className="flex gap-2 text-xs text-muted-foreground">Use {"{{1}}"} for variables</div>
                </div>
                <Textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Hi {{1}}, thank you!" rows={6} />
              </div>

              <div className="space-y-2">
                <Label>Footer (Optional)</Label>
                <Input value={form.footer} onChange={e => setForm({...form, footer: e.target.value})} placeholder="Reply STOP to opt-out" />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold">Buttons (Optional)</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => addButton('QUICK_REPLY')}>+ Quick Reply</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addButton('URL')}>+ URL</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addButton('PHONE_NUMBER')}>+ Phone</Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {form.buttons.map((btn, index) => (
                    <div key={index} className="p-4 rounded-xl border bg-muted/30 space-y-3 relative">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeButton(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-2 gap-4 mr-8">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Type</Label>
                          <Badge variant="secondary" className="block text-center">{btn.type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Button Text</Label>
                          <Input value={btn.text || ""} onChange={e => updateButton(index, 'text', e.target.value)} placeholder="Button label" className="h-8 text-sm" />
                        </div>
                      </div>
                      {btn.type === 'URL' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">URL</Label>
                          <Input value={btn.url || ""} onChange={e => updateButton(index, 'url', e.target.value)} placeholder="https://..." className="h-8 text-sm" />
                        </div>
                      )}
                      {btn.type === 'PHONE_NUMBER' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Phone</Label>
                          <Input value={btn.phone_number || ""} onChange={e => updateButton(index, 'phone_number', e.target.value)} placeholder="+91..." className="h-8 text-sm" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-6 overflow-hidden border-none shadow-xl bg-[#ECE5DD]">
            <CardHeader className="bg-[#075E54] text-white py-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <MessageSquare className="w-3 h-3" /> WhatsApp Preview
              </div>
            </CardHeader>
            <CardContent className="min-h-[460px] p-4 flex flex-col justify-start">
              <div className="bg-white rounded-xl rounded-tl-none shadow-sm max-w-[90%] overflow-hidden relative">
                {form.headerType === 'media' && (
                  <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center border-b overflow-hidden">
                    {headerPreviewUrl ? (
                      form.headerFormat === 'IMAGE' ? <img src={headerPreviewUrl} className="w-full h-full object-cover" /> :
                      form.headerFormat === 'VIDEO' ? <video src={headerPreviewUrl} className="w-full h-full object-cover" /> :
                      <div className="flex flex-col items-center"><Type className="h-8 w-8 text-gray-300" /><span className="text-[10px] text-gray-400 font-bold uppercase">{form.headerFormat}</span></div>
                    ) : (
                      <>
                        <Type className="h-8 w-8 text-gray-300 mb-1" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{form.headerFormat} HEADER</span>
                      </>
                    )}
                  </div>
                )}
                <div className="p-3 space-y-1">
                  {form.headerType === 'text' && form.headerText && <p className="text-[13px] font-bold text-gray-900 leading-tight mb-1">{form.headerText}</p>}
                  {form.body ? <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed">{form.body}</p> : <p className="text-[13px] text-muted-foreground italic">Start typing...</p>}
                  {form.footer && <p className="text-[11px] text-gray-400 mt-2 border-t pt-1 uppercase">{form.footer}</p>}
                  <p className="text-[9px] text-gray-400 text-right mt-1 font-mono uppercase">12:00 PM</p>
                </div>
                {form.buttons.map((btn, i) => (
                  <div key={i} className="border-t border-gray-100 py-2.5 text-center text-[13px] font-medium text-[#00a5f4] hover:bg-gray-50 flex items-center justify-center gap-2">
                    {btn.type === 'URL' && <Globe className="w-3 h-3" />}
                    {btn.type === 'PHONE_NUMBER' && <Phone className="w-3 h-3" />}
                    {btn.text || "Button Text"}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditTemplate;
