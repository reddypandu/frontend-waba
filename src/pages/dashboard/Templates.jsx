import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RefreshCw, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusStyles = {
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const Templates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState(null);

  const { data: templatesData, isLoading, refetch } = useQuery({
    queryKey: ["whatsapp-templates", user?.id],
    queryFn: () => apiPost("/api/whatsapp", { action: "sync_templates" }),
    enabled: !!user,
  });

  const allTemplates = templatesData?.templates || [];

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Logic for deleting template from Meta
      console.log("Delete template", id);
    },
    onSuccess: () => {
      toast({ title: "Template deleted" });
      setDeleteId(null);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground">Manage your WhatsApp message templates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Meta
          </Button>
          <Button onClick={() => navigate("/dashboard/templates/create")}>
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8 animate-pulse">Loading templates...</div>
      ) : allTemplates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20 flex items-center justify-center">
            <Plus className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground">No templates found. Create your first template or sync from Meta.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {allTemplates.map((t) => (
            <div
              key={t.id || t.name}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="min-w-0 flex-1 mr-3">
                  <h3 className="font-semibold text-foreground text-base truncate">{t.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize mt-0.5">
                    {(t.category || "").toLowerCase()} · {t.language}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`capitalize text-xs font-semibold shrink-0 ${statusStyles[t.status] || ""}`}
                >
                  {(t.status || "").toLowerCase()}
                </Badge>
              </div>

              <div className="mt-3 rounded-lg bg-muted/50 p-3.5 text-sm text-foreground/80 leading-relaxed line-clamp-4 min-h-[80px]">
                {t.components?.find(c => c.type === 'BODY')?.text || "No preview available"}
              </div>

              <div className="flex gap-2 items-center mt-3 pt-3 border-t border-border">
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/dashboard/templates/edit/${t._id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                  onClick={() => setDeleteId(t.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this template. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Templates;
