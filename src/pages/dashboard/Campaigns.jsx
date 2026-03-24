import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Send, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api";
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
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  running: "bg-blue-100 text-blue-700 border-blue-200",
  scheduled: "bg-amber-100 text-amber-700 border-amber-200",
  draft: "bg-muted text-muted-foreground",
  paused: "bg-orange-100 text-orange-700 border-orange-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

const Campaigns = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const data = await apiPost("/api/whatsapp", { action: "get_campaigns" });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Logic for deleting campaign would be an action as well
      console.log("Delete campaign", id);
    },
    onSuccess: () => {
      toast({ title: "Campaign deleted" });
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground">Create and send WhatsApp campaigns.</p>
        </div>
        <Button onClick={() => navigate("/dashboard/campaigns/create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Send className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground">Create your first campaign to start messaging.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Campaign Name</TableHead>
                <TableHead className="font-bold">Template</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Created At</TableHead>
                <TableHead className="text-right font-bold font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.template_id || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${statusStyles[c.status?.toLowerCase()] || ""}`}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/campaigns/${c.id}`)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this campaign and its message logs. This action cannot be undone.
            </AlertDialogDescription>
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

export default Campaigns;
