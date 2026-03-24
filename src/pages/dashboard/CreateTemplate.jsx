import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Bold, Italic, Type, MessageSquare, Globe, Phone, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";

const CreateTemplate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setHeaderPreviewUrl(url);
      toast({ title: "Asset uploaded", description: "Media ID generated" });
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

  const createMutation = useMutation({
    mutationFn: async () => {
      const components = [{ type: "BODY", text: form.body }];
      if (form.headerType === "text" && form.headerText) {
        components.unshift({ type: "HEADER", format: "TEXT", text: form.headerText });
      } else if (form.headerType === "media") {
        components.unshift({ type: "HEADER", format: form.headerFormat, example: { header_handle: ["TEMPLATE_MEDIA_ID"] } });
      }
      
      if (form.footer) {
        components.push({ type: "FOOTER", text: form.footer });
      }

      if (form.buttons.length > 0) {
        components.push({ type: "BUTTONS", buttons: form.buttons });
      }

      return apiPost("/api/whatsapp", {
        action: "create_template",
        name: form.name,
        category: form.category,
        language: form.language,
        components
      });
    },
    onSuccess: () => {
      toast({ title: "Template submitted for approval" });
      navigate("/dashboard/templates");
    },
    onError: (err) => {
      toast({ title: "Failed to submit template", description: err.message, variant: "destructive" });
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/templates")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Template</h1>
          <p className="text-sm text-muted-foreground">Select a category and craft your message</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard/templates")}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.body || createMutation.isPending}>
            {createMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})} placeholder="order_update_v1" />
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Header (Optional)</Label>
                <RadioGroup value={form.headerType} onValueChange={v => setForm({...form, headerType: v})} className="flex gap-4">
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="none" id="h-none" />
                    <Label htmlFor="h-none">None</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="text" id="h-text" />
                    <Label htmlFor="h-text">Text</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="media" id="h-media" />
                    <Label htmlFor="h-media">Media</Label>
                  </div>
                </RadioGroup>

                {form.headerType === 'text' && (
                  <Input 
                    value={form.headerText} 
                    onChange={e => setForm({...form, headerText: e.target.value})} 
                    placeholder="Enter header text..." 
                    maxLength={60}
                    className="mt-2"
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
                        <p className="text-xs font-bold text-foreground">Upload {form.headerFormat}</p>
                        <p className="text-[10px] text-muted-foreground">Click to select file or drag and drop</p>
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
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    Use {"{{1}}"} for variables
                  </div>
                </div>
                <Textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Hi {{1}}, thank you for your order!" rows={6} />
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
                          <Badge variant="secondary">{btn.type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Button Text</Label>
                          <Input value={btn.text || ""} onChange={e => updateButton(index, 'text', e.target.value)} placeholder="e.g. Visit Website" className="h-8 text-sm" />
                        </div>
                      </div>
                      {btn.type === 'URL' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">URL</Label>
                          <Input value={btn.url || ""} onChange={e => updateButton(index, 'url', e.target.value)} placeholder="https://example.com" className="h-8 text-sm" />
                        </div>
                      )}
                      {btn.type === 'PHONE_NUMBER' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Phone Number</Label>
                          <Input value={btn.phone_number || ""} onChange={e => updateButton(index, 'phone_number', e.target.value)} placeholder="+919876543210" className="h-8 text-sm" />
                        </div>
                      )}
                    </div>
                  ))}
                  {form.buttons.length === 0 && <p className="text-xs text-center text-muted-foreground py-2 italic">No buttons added</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
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
                      form.headerFormat === 'IMAGE' ? (
                        <img src={headerPreviewUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : form.headerFormat === 'VIDEO' ? (
                        <video src={headerPreviewUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Type className="h-8 w-8 text-gray-300 mb-1" />
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{form.headerFormat} HEADER</span>
                        </div>
                      )
                    ) : (
                      <>
                        <Type className="h-8 w-8 text-gray-300 mb-1" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{form.headerFormat} HEADER</span>
                      </>
                    )}
                  </div>
                )}
                <div className="p-3 space-y-1">
                  {form.headerType === 'text' && form.headerText && (
                    <p className="text-[13px] font-bold text-gray-900 leading-tight mb-1">{form.headerText}</p>
                  )}
                  {form.body ? (
                    <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed">{form.body}</p>
                  ) : (
                    <p className="text-[13px] text-muted-foreground italic">Start typing to see preview...</p>
                  )}
                  {form.footer && <p className="text-[11px] text-gray-400 mt-2 border-t pt-1">{form.footer}</p>}
                  <p className="text-[9px] text-gray-400 text-right mt-1">12:00 PM</p>
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

export default CreateTemplate;
