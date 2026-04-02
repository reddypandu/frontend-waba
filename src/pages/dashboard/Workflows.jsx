import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GitBranch, Pencil, MessageCircle, Clock, UserPlus, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

const TRIGGER_ICONS = {
  keyword_match: Zap,
  message_received: MessageCircle,
  contact_created: UserPlus,
  schedule: Clock,
};

const Workflows = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState(null);
  const [form, setForm] = React.useState({
    name: "",
    trigger_type: "keyword_match",
    trigger_value: "",
  });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["workflows", user?.id],
    queryFn: () => apiGet("/api/admin/workflows"),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiPost("/api/admin/workflows", { ...data, actions: [{ type: "send_message", message: "" }] }),
    onSuccess: () => {
      toast({ title: "Workflow created!" });
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      resetForm();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => apiPut(`/api/admin/workflows/${id}`, data),
    onSuccess: () => {
      toast({ title: "Workflow updated!" });
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      resetForm();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => apiPut(`/api/admin/workflows/${id}`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/admin/workflows/${id}`),
    onSuccess: () => {
      toast({ title: "Workflow deleted" });
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
    },
  });

  const resetForm = () => {
    setForm({ name: "", trigger_type: "keyword_match", trigger_value: "" });
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (wf) => {
    setForm({ name: wf.name, trigger_type: wf.trigger_type, trigger_value: wf.trigger_value || "" });
    setEditItem(wf);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ title: "Workflow name is required", variant: "destructive" });
      return;
    }
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const triggerBadgeColors = {
    keyword_match: "bg-violet-100 text-violet-700 border-violet-200",
    message_received: "bg-blue-100 text-blue-700 border-blue-200",
    contact_created: "bg-emerald-100 text-emerald-700 border-emerald-200",
    schedule: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" /> Workflows
          </h1>
          <p className="text-muted-foreground">Automate actions based on triggers like messages or events.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{editItem ? "Edit Workflow" : "New Workflow"}</CardTitle>
            <CardDescription>Define what triggers your workflow and what action to take.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-sm">Workflow Name <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Welcome New Contacts" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="h-11 rounded-xl" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-sm">Trigger Type</Label>
                <Select value={form.trigger_type} onValueChange={(v) => setForm(f => ({ ...f, trigger_type: v }))}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword_match">Keyword in message</SelectItem>
                    <SelectItem value="message_received">Any message received</SelectItem>
                    <SelectItem value="contact_created">New contact created</SelectItem>
                    <SelectItem value="schedule">Scheduled time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-sm">
                  {form.trigger_type === "keyword_match" ? "Trigger Keyword" : "Trigger Value"}
                </Label>
                <Input
                  placeholder={form.trigger_type === "keyword_match" ? "e.g. hello" : form.trigger_type === "schedule" ? "e.g. 09:00 daily" : "Optional"}
                  value={form.trigger_value}
                  onChange={(e) => setForm(f => ({ ...f, trigger_value: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <strong>Note:</strong> Workflow actions (messages, delays, tags) are managed after creation. This creates the workflow trigger.
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl min-w-24">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editItem ? "Update" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12 animate-pulse">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-16 flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GitBranch className="h-8 w-8 text-primary/50" />
            </div>
            <h3 className="font-bold text-foreground">No workflows yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">Create automated workflows to send messages, add tags, or take actions based on customer behavior.</p>
            <Button onClick={() => setShowForm(true)} className="mt-2 rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Create First Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf) => {
            const TriggerIcon = TRIGGER_ICONS[wf.trigger_type] || Zap;
            return (
              <Card key={wf.id} className={`shadow-sm transition-all ${!wf.is_active ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex items-start sm:items-center gap-4 justify-between flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <TriggerIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-foreground">{wf.name}</span>
                        <Badge variant="outline" className={`text-[10px] capitalize ${triggerBadgeColors[wf.trigger_type]}`}>
                          {wf.trigger_type.replace(/_/g, ' ')}
                        </Badge>
                        {wf.is_active ? (
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-none">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Paused</Badge>
                        )}
                      </div>
                      {wf.trigger_value && (
                        <p className="text-xs text-muted-foreground">Trigger: <code className="font-mono bg-muted px-1 rounded">{wf.trigger_value}</code></p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!wf.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: wf.id, is_active: checked ? 1 : 0 })}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(wf)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(wf.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Workflows;
