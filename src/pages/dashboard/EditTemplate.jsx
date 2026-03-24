import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2, Save, Bold, Italic } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
    body: "",
    footer: "",
  });

  // Mock template fetching for now
  const { data: template, isLoading } = useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      // simulate fetch
      return { id, name: "order_update", body: "Hello {{1}}, thanks for the order!" };
    },
    enabled: !!id,
  });

  React.useEffect(() => {
    if (template) {
      setForm(prev => ({
        ...prev,
        name: template.name || "",
        body: template.body || "",
      }));
    }
  }, [template]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      console.log("Update template", form);
    },
    onSuccess: () => {
      toast({ title: "Template updated successfully" });
      navigate("/dashboard/templates");
    },
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/templates")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Template</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard/templates")}>Cancel</Button>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader><CardTitle>General Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Message</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Body Message</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} rows={6} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="sticky top-6 overflow-hidden">
            <CardHeader className="bg-[#075E54] text-white">
              <CardTitle className="text-sm">WhatsApp Preview</CardTitle>
            </CardHeader>
            <CardContent className="bg-[#ECE5DD] min-h-[300px] p-4 flex flex-col justify-end">
              <div className="bg-white rounded-lg p-3 shadow-sm max-w-[90%] space-y-1 relative">
                <p className="text-xs text-gray-800 whitespace-pre-wrap">{form.body || "Preview..."}</p>
                <p className="text-[9px] text-gray-400 text-right mt-1">12:00 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditTemplate;
