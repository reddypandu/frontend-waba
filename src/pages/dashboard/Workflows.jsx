import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Copy,
  GitBranch,
  Library,
  MessageCircle,
  Pencil,
  Plus,
  Send,
  Target,
  Trash2,
  UserPlus,
  Zap,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import VisualFlowBuilder from "@/components/dashboard/VisualFlowBuilder";

const TRIGGER_ICONS = {
  keyword_match: Zap,
  message_received: MessageCircle,
  contact_created: UserPlus,
  schedule: Clock,
};

const WORKFLOW_TEMPLATES = [
  {
    name: "Lead Welcome",
    description: "Reply to new enquiries, qualify interest, and offer a callback option.",
    trigger_type: "keyword_match",
    trigger_value: "interested",
    icon: MessageCircle,
    actions: [
      {
        id: "welcome_message",
        type: "send_buttons",
        text: "Thanks for your interest. What would you like to do next?",
        buttons: [
          { id: "book_call", title: "Book Call", next_step: "book_call_reply" },
          { id: "pricing", title: "Pricing", next_step: "pricing_reply" },
        ],
        next_step: "",
        position: { x: 2880, y: 240 },
      },
      {
        id: "book_call_reply",
        type: "send_text",
        text: "Great. Our team will contact you shortly to schedule a call.",
        buttons: [],
        next_step: "",
        position: { x: 2600, y: 420 },
      },
      {
        id: "pricing_reply",
        type: "send_text",
        text: "Sure. Please share your requirement and we will send the right pricing details.",
        buttons: [],
        next_step: "",
        position: { x: 3160, y: 420 },
      },
    ],
  },
  {
    name: "Order Status",
    description: "Answer order-status messages and collect order numbers automatically.",
    trigger_type: "keyword_match",
    trigger_value: "order",
    icon: Send,
    actions: [
      {
        id: "ask_order_number",
        type: "send_text",
        text: "Please share your order number. Our team will check and update you soon.",
        buttons: [],
        next_step: "",
        position: { x: 2880, y: 240 },
      },
    ],
  },
  {
    name: "Support Triage",
    description: "Route incoming support chats by urgency and issue type.",
    trigger_type: "message_received",
    trigger_value: "",
    icon: Target,
    actions: [
      {
        id: "support_menu",
        type: "send_buttons",
        text: "How can we help today?",
        buttons: [
          { id: "urgent", title: "Urgent", next_step: "urgent_reply" },
          { id: "general", title: "General", next_step: "general_reply" },
        ],
        next_step: "",
        position: { x: 2880, y: 240 },
      },
      {
        id: "urgent_reply",
        type: "send_text",
        text: "Thanks. We have marked this as urgent and will respond as quickly as possible.",
        buttons: [],
        next_step: "",
        position: { x: 2600, y: 420 },
      },
      {
        id: "general_reply",
        type: "send_text",
        text: "Thanks for sharing. Our support team will reply soon.",
        buttons: [],
        next_step: "",
        position: { x: 3160, y: 420 },
      },
    ],
  },
];

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDateTime = (value) => {
  if (!value) return "No activity yet";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const Workflows = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState(null);

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ["me", user?.id],
    queryFn: async () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const userPlan = profileData?.subscription?.plan ?? "paid";
  const isAdminOrManager = ["admin", "manager"].includes(profileData?.user?.role);
  const canUseWorkflows = isAdminOrManager || userPlan === "paid";

  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ["workflows", user?.id],
    queryFn: async () => {
      const data = await apiGet("/api/automation/workflows");
      return data.workflows || [];
    },
    enabled: !!user && !profileLoading && canUseWorkflows,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["workflow-analytics", user?.id],
    queryFn: async () => apiGet("/api/automation/workflows/analytics"),
    enabled: !!user && !profileLoading && canUseWorkflows,
    refetchInterval: 10000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiPost("/api/automation/workflows", data),
    onSuccess: () => {
      toast({ title: "Workflow created!" });
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["workflow-analytics", user?.id] });
      setBuilderOpen(false);
      setEditItem(null);
    },
    onError: (err) => toast({ title: "Error creating workflow", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => apiPut(`/api/automation/workflows/${id}`, data),
    onSuccess: () => {
      toast({ title: "Workflow updated!" });
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["workflow-analytics", user?.id] });
      setBuilderOpen(false);
      setEditItem(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => apiPut(`/api/automation/workflows/${id}`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["workflow-analytics", user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/automation/workflows/${id}`),
    onSuccess: () => {
      toast({ title: "Workflow deleted" });
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["workflow-analytics", user?.id] });
    },
  });

  const openBuilder = (wf = null) => {
    setEditItem(wf);
    setBuilderOpen(true);
  };

  const handleBuilderSave = (data) => {
    if (!data.name?.trim()) {
      toast({ title: "Workflow name is required", variant: "destructive" });
      return;
    }
    if (editItem) {
      updateMutation.mutate({ id: editItem._id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const createFromTemplate = (template) => {
    createMutation.mutate({
      name: template.name,
      trigger_type: template.trigger_type,
      trigger_value: template.trigger_value,
      actions: template.actions,
      is_active: true,
    });
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
              Workflow automation is available on the Paid plan. Upgrade to unlock multi-step journeys, conditional actions, and workflow triggers.
            </p>
            <Button onClick={() => navigate("/dashboard/billing")} className="rounded-xl">
              Upgrade to Paid Plan
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

  const totals = analyticsData?.totals || {};
  const analyticsRows = analyticsData?.workflows || [];
  const maxExecutions = Math.max(1, ...analyticsRows.map((row) => row.execution_count || 0));

  return (
    <div className="space-y-6">
      <VisualFlowBuilder
        isOpen={builderOpen}
        onClose={() => { setBuilderOpen(false); setEditItem(null); }}
        onSave={handleBuilderSave}
        initialData={editItem}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" /> Workflows
          </h1>
          <p className="text-muted-foreground">Automate actions based on triggers like messages or events.</p>
        </div>
        <Button onClick={() => openBuilder(null)} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

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
                <Button onClick={() => openBuilder(null)} className="mt-2 rounded-xl">
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
                              {wf.trigger_type.replace(/_/g, " ")}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openBuilder(wf)}>
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

          <section className="mt-8 pt-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Workflow Analytics
                </h3>
                <p className="text-sm text-muted-foreground">Live counters refresh every 10 seconds from real workflow activity.</p>
              </div>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                <Activity className="h-3 w-3 mr-1" /> Live
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                { label: "Active Workflows", value: totals.active_count, icon: CheckCircle2 },
                { label: "Triggers", value: totals.trigger_count, icon: Zap },
                { label: "Executions", value: totals.execution_count, icon: Send },
                { label: "Conversions", value: totals.conversion_count, icon: Target },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className="shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-2xl font-bold text-foreground">{analyticsLoading ? "..." : formatNumber(value)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                {analyticsRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Create a workflow to start collecting analytics.</p>
                ) : (
                  analyticsRows.map((row) => (
                    <div key={row._id} className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_120px_120px_120px_140px] md:items-center border-b border-border last:border-0 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground truncate">{row.name}</p>
                          <Badge variant="outline" className={`text-[10px] capitalize ${triggerBadgeColors[row.trigger_type]}`}>
                            {row.trigger_type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(row.last_executed_at || row.last_triggered_at)}</p>
                      </div>
                      <Metric label="Triggers" value={row.trigger_count} />
                      <Metric label="Executions" value={row.execution_count} />
                      <Metric label="Conversion" value={`${row.conversion_rate}%`} />
                      <div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.max(4, Math.round(((row.execution_count || 0) / maxExecutions) * 100))}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{row.steps_count} steps</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section className="mt-8 pt-6 border-t border-border space-y-4">
            <div>
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Library className="h-5 w-5 text-primary" /> Templates Library
              </h3>
              <p className="text-sm text-muted-foreground">Use a template to create a real editable workflow instantly.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-4">
              {WORKFLOW_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <Card key={template.name} className="shadow-sm">
                    <CardContent className="p-5 flex flex-col gap-4 h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-foreground">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-auto">
                        <Badge variant="outline" className={`text-[10px] capitalize ${triggerBadgeColors[template.trigger_type]}`}>
                          {template.trigger_type.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{template.actions.length} steps</Badge>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-xl w-full"
                        disabled={createMutation.isPending}
                        onClick={() => createFromTemplate(template)}
                      >
                        <Copy className="h-4 w-4 mr-2" /> Use Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-normal text-muted-foreground">{label}</p>
    <p className="font-bold text-sm text-foreground">{typeof value === "number" ? formatNumber(value) : value}</p>
  </div>
);

export default Workflows;
