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
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorObject,
  } = useQuery({
    queryKey: ["me", user?.id],
    queryFn: async () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const userPlan = profileData?.subscription?.plan ?? "starter";
  const normalizedPlan = userPlan === "pro" ? "professional" : userPlan;
  const isAdminOrManager = ["admin", "manager"].includes(profileData?.user?.role);
  const canUseWorkflows = isAdminOrManager || normalizedPlan === "professional";
  const [editItem, setEditItem] = React.useState(null);
  const generateId = () => `step_${Math.random().toString(36).substring(2, 9)}`;
  const defaultAction = () => ({
    id: generateId(),
    type: "send_text",
    text: "",
    buttons: [],
    next_step: "",
  });

  const [form, setForm] = React.useState({
    name: "",
    trigger_type: "keyword_match",
    trigger_value: "",
    actions: [defaultAction()],
  });

  const addAction = () => setForm((f) => ({ ...f, actions: [...(f.actions || []), defaultAction()] }));
  const removeAction = (id) =>
    setForm((f) => ({ ...f, actions: (f.actions || []).filter((action) => action.id !== id) }));
  const updateAction = (id, updates) =>
    setForm((f) => ({
      ...f,
      actions: (f.actions || []).map((action) =>
        action.id === id ? { ...action, ...updates } : action,
      ),
    }));

  const addButton = (actionId) => {
    setForm((f) => ({
      ...f,
      actions: (f.actions || []).map((action) =>
        action.id === actionId
          ? {
              ...action,
              buttons: [
                ...(action.buttons || []),
                { id: generateId(), title: "", next_step: "" },
              ],
            }
          : action,
      ),
    }));
  };

  const updateButton = (actionId, index, updates) => {
    setForm((f) => ({
      ...f,
      actions: (f.actions || []).map((action) =>
        action.id === actionId
          ? {
              ...action,
              buttons: (action.buttons || []).map((button, buttonIndex) =>
                buttonIndex === index ? { ...button, ...updates } : button,
              ),
            }
          : action,
      ),
    }));
  };

  const removeButton = (actionId, index) => {
    setForm((f) => ({
      ...f,
      actions: (f.actions || []).map((action) =>
        action.id === actionId
          ? {
              ...action,
              buttons: (action.buttons || []).filter((_, i) => i !== index),
            }
          : action,
      ),
    }));
  };

  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ["workflows", user?.id],
    queryFn: async () => {
      const data = await apiGet("/api/automation/workflows");
      return data.workflows || [];
    },
    enabled: !!user && !profileLoading && canUseWorkflows,
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiPost("/api/automation/workflows", data),
    onSuccess: () => {
      toast({ title: "Workflow created!" });
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      resetForm();
    },
    onError: (err) => toast({ title: "Workflow created!", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => apiPut(`/api/automation/workflows/${id}`, data),
    onSuccess: () => {
      toast({ title: "Workflow updated!" });
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      resetForm();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => apiPut(`/api/automation/workflows/${id}`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/automation/workflows/${id}`),
    onSuccess: () => {
      toast({ title: "Workflow deleted" });
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
    },
  });

  const resetForm = () => {
    setForm({ name: "", trigger_type: "keyword_match", trigger_value: "", actions: [defaultAction()] });
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (wf) => {
    setForm({
      name: wf.name,
      trigger_type: wf.trigger_type,
      trigger_value: wf.trigger_value || "",
      actions: wf.actions || [defaultAction()],
    });
    setEditItem(wf);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ title: "Workflow name is required", variant: "destructive" });
      return;
    }
    if (!form.actions?.length) {
      toast({ title: "Add at least one workflow action", variant: "destructive" });
      return;
    }
    if (editItem) {
      updateMutation.mutate({ id: editItem._id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  if (!user || profileLoading) {
    return <div className="text-center text-muted-foreground py-12 animate-pulse">Loading subscription...</div>;
  }

  if (profileError) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Unable to load profile</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              There was a problem loading your account information. Please refresh the page or contact support if this continues.
            </p>
            <Button onClick={() => window.location.reload()} className="rounded-xl">
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canUseWorkflows) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Workflow Automation</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Workflow automation is available on the Professional plan. Upgrade to unlock multi-step journeys, conditional actions, and workflow triggers.
            </p>
            <Button onClick={() => navigate('/dashboard/billing')} className="rounded-xl">
              Upgrade to Professional
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label className="font-bold text-sm">Workflow Steps</Label>
                  <p className="text-xs text-muted-foreground">Build the reply flow using text or interactive buttons.</p>
                </div>
                <Button size="sm" onClick={addAction} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Add Step
                </Button>
              </div>

              {(form.actions || []).map((action, index) => (
                <Card key={action.id} className="border border-border bg-muted/50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-sm font-semibold">Step {index + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeAction(action.id)} className="h-8 w-8 rounded-lg text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-sm">Action Type</Label>
                      <Select value={action.type} onValueChange={(value) => updateAction(action.id, { type: value })}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="send_text">Send Text</SelectItem>
                          <SelectItem value="send_buttons">Send Buttons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-sm">Next Step ID</Label>
                      <Input
                        placeholder="Optional next step id"
                        value={action.next_step || ""}
                        onChange={(e) => updateAction(action.id, { next_step: e.target.value })}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label className="font-bold text-sm">Message Text</Label>
                    <Input
                      placeholder="Enter message text"
                      value={action.text || ""}
                      onChange={(e) => updateAction(action.id, { text: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  {action.type === "send_buttons" && (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-bold text-sm">Buttons</Label>
                        <Button size="sm" onClick={() => addButton(action.id)} className="rounded-xl">
                          <Plus className="mr-2 h-4 w-4" /> Add Button
                        </Button>
                      </div>
                      {(action.buttons || []).map((button, buttonIndex) => (
                        <div key={button.id} className="grid sm:grid-cols-[1fr_1fr_40px] gap-3 items-end">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold">Button Title</Label>
                            <Input
                              placeholder="Button label"
                              value={button.title || ""}
                              onChange={(e) => updateButton(action.id, buttonIndex, { title: e.target.value })}
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold">Next Step ID</Label>
                            <Input
                              placeholder="Next step id"
                              value={button.next_step || ""}
                              onChange={(e) => updateButton(action.id, buttonIndex, { next_step: e.target.value })}
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-destructive" onClick={() => removeButton(action.id, buttonIndex)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <strong>Note:</strong> For button flows, set the next step IDs on buttons and actions. Leave next step empty to end the workflow.
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

      {workflowsLoading ? (
        <div className="text-center text-muted-foreground py-12 animate-pulse">Loading workflows...</div>
      ) : (
        <>
          {workflows.length === 0 ? (
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
                  <Card key={wf._id} className={`shadow-sm transition-all ${!wf.is_active ? "opacity-60" : ""}`}>
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
                          onCheckedChange={(checked) => toggleMutation.mutate({ id: wf._id, is_active: checked })}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(wf)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(wf._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-bold text-lg mb-4 text-foreground">Coming Soon</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-dashed opacity-60 hover:opacity-80 transition-opacity cursor-not-allowed">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <div className="h-6 w-6 text-blue-600">📊</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Workflow Analytics</h4>
                    <p className="text-xs text-muted-foreground mt-1">Track trigger counts, execution stats, and conversion rates for each workflow.</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 mt-2 text-[10px]">Coming Soon</Badge>
                </CardContent>
              </Card>

              <Card className="border-dashed opacity-60 hover:opacity-80 transition-opacity cursor-not-allowed">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <div className="h-6 w-6 text-purple-600">🎨</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Visual Flow Builder</h4>
                    <p className="text-xs text-muted-foreground mt-1">Drag-and-drop workflow designer with real-time flow visualization.</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 mt-2 text-[10px]">Coming Soon</Badge>
                </CardContent>
              </Card>

              <Card className="border-dashed opacity-60 hover:opacity-80 transition-opacity cursor-not-allowed">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <div className="h-6 w-6 text-emerald-600">⚡</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Templates Library</h4>
                    <p className="text-xs text-muted-foreground mt-1">Pre-built workflow templates for common business scenarios.</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 mt-2 text-[10px]">Coming Soon</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Workflows;
