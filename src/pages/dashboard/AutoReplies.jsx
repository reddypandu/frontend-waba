import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Zap, Bot, MessageCircle, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

const AutoReplies = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState(null);
  const [form, setForm] = React.useState({ keyword: "", match_type: "contains", response: "" });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["auto-replies"],
    queryFn: () => apiGet("/api/admin/auto-replies"),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiPost("/api/admin/auto-replies", data),
    onSuccess: () => {
      toast({ title: "Auto-reply created!" });
      queryClient.invalidateQueries({ queryKey: ["auto-replies"] });
      resetForm();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => apiPut(`/api/admin/auto-replies/${id}`, data),
    onSuccess: () => {
      toast({ title: "Auto-reply updated!" });
      queryClient.invalidateQueries({ queryKey: ["auto-replies"] });
      resetForm();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => apiPut(`/api/admin/auto-replies/${id}`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auto-replies"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/admin/auto-replies/${id}`),
    onSuccess: () => {
      toast({ title: "Deleted" });
      queryClient.invalidateQueries({ queryKey: ["auto-replies"] });
    },
  });

  const resetForm = () => {
    setForm({ keyword: "", match_type: "contains", response: "" });
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (rule) => {
    setForm({ keyword: rule.keyword, match_type: rule.match_type, response: rule.response });
    setEditItem(rule);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.keyword.trim() || !form.response.trim()) {
      toast({ title: "Keyword and response are required", variant: "destructive" });
      return;
    }
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const matchTypeBadge = {
    exact: "bg-violet-100 text-violet-700 border-violet-200",
    contains: "bg-blue-100 text-blue-700 border-blue-200",
    starts_with: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> Auto Replies
          </h1>
          <p className="text-muted-foreground">Automatically respond when customers message keywords.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> New Rule
        </Button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card className="border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{editItem ? "Edit Rule" : "New Auto-Reply Rule"}</CardTitle>
            <CardDescription>When someone sends a message matching the keyword, we reply automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-sm">Keyword <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. hello, price, support" value={form.keyword} onChange={(e) => setForm(f => ({ ...f, keyword: e.target.value }))} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-sm">Match Type</Label>
                <Select value={form.match_type} onValueChange={(v) => setForm(f => ({ ...f, match_type: v }))}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Contains keyword</SelectItem>
                    <SelectItem value="exact">Exact match</SelectItem>
                    <SelectItem value="starts_with">Starts with</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-sm">Response Message <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Hello! Thanks for reaching out. Our team will respond shortly..."
                value={form.response}
                onChange={(e) => setForm(f => ({ ...f, response: e.target.value }))}
                rows={4}
                className="rounded-xl resize-none"
              />
              <p className="text-xs text-muted-foreground">{form.response.length} / 1024 characters</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl min-w-24">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editItem ? "Update" : "Create Rule"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-12 animate-pulse">Loading rules...</div>
      ) : rules.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-16 flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-primary/50" />
            </div>
            <h3 className="font-bold text-foreground">No auto-reply rules yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">Create your first rule to automatically respond when customers message specific keywords.</p>
            <Button onClick={() => setShowForm(true)} className="mt-2 rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className={`shadow-sm transition-all ${!rule.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-4 flex items-start sm:items-center gap-4 justify-between flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm text-foreground">"{rule.keyword}"</span>
                      <Badge variant="outline" className={`text-[10px] capitalize ${matchTypeBadge[rule.match_type]}`}>{rule.match_type.replace('_', ' ')}</Badge>
                      {rule.is_active ? (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-none">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-lg">{rule.response}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!rule.is_active}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: rule.id, is_active: checked ? 1 : 0 })}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(rule)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(rule.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoReplies;
