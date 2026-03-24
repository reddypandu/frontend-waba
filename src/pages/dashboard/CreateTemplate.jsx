import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Plus, Bold, Italic, Type, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const CreateTemplate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = React.useState({
    name: "",
    category: "MARKETING",
    language: "en",
    headerType: "none",
    body: "",
    footer: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const components = [{ type: "BODY", text: form.body }];
      if (form.headerType === "text" && form.headerText) {
        components.unshift({ type: "HEADER", format: "TEXT", text: form.headerText });
      }
      if (form.footer) {
        components.push({ type: "FOOTER", text: form.footer });
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
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="sticky top-6 overflow-hidden">
            <CardHeader className="bg-[#075E54] text-white py-3">
              <CardTitle className="text-xs">WhatsApp Preview</CardTitle>
            </CardHeader>
            <CardContent className="bg-[#ECE5DD] min-h-[440px] p-4 flex flex-col justify-end">
              <div className="bg-white rounded-lg shadow-sm max-w-[90%] overflow-hidden relative">
                 <div className="p-3 space-y-1">
                  {form.headerType === 'text' && form.headerText && (
                    <p className="text-xs font-bold text-gray-900 border-b pb-1 mb-1">{form.headerText}</p>
                  )}
                  {form.body ? (
                    <>
                      <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{form.body}</p>
                      {form.footer && <p className="text-[10px] text-gray-400 mt-2 border-t pt-1 italic">{form.footer}</p>}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Start typing to see preview...</p>
                  )}
                  <p className="text-[9px] text-gray-400 text-right mt-1">12:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplate;
