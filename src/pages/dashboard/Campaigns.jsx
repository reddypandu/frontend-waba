import React, { useState } from "react";
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
import { Plus, Send, Trash2, Play, Pause, Radio, Loader2 } from "lucide-react";
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
  const [deleteId, setDeleteId] = useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns", user?.id],
    queryFn: async () => {
      const data = await apiGet("/api/whatsapp/campaigns");
      return data.campaigns || [];
    },
    enabled: !!user,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts-summary", user?.id],
    queryFn: async () => {
      const data = await apiPost("/api/whatsapp", { action: "get_contacts" });
      return data.contacts || [];
    },
    enabled: !!user,
  });

  // Fetch real stats for each campaign
  const campaignIds = campaigns.map((c) => c._id);
  const { data: allStats = {} } = useQuery({
    queryKey: ["campaigns-real-stats", user?.id, campaignIds],
    queryFn: async () => {
      const statsMap = {};
      for (const cid of campaignIds) {
        try {
          const stats = await apiGet(`/api/whatsapp/campaigns/${cid}/stats`);
          if (stats) statsMap[cid] = stats;
        } catch (e) { console.error("Stats fail for", cid, e); }
      }
      return statsMap;
    },
    enabled: !!user && campaignIds.length > 0,
    refetchInterval: 10000, // Refresh every 10s for live feel
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Assuming a generic delete or an action
      await apiPost("/api/whatsapp", { action: "delete_campaign", id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campaign deleted" });
      setDeleteId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await apiPost(`/api/whatsapp/campaigns/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campaign status updated" });
    },
    onError: (err) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const deliveryRate = (sent, delivered) => {
    if (!sent) return "—";
    return `${Math.round((delivered / sent) * 100)}%`;
  };

  const readRate = (sent, read) => {
    if (!sent) return "—";
    return `${Math.round((read / sent) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground">Create and send WhatsApp campaigns · {contacts.length} total contacts</p>
        </div>
        <Button onClick={() => navigate("/dashboard/campaigns/create")}>
          <Plus className="w-4 h-4 mr-2" /> Create Campaign
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground">Create your first campaign to start messaging.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Campaign Name</TableHead>
                <TableHead className="font-semibold">Template</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Contacts</TableHead>
                <TableHead className="font-semibold text-center">Sent</TableHead>
                <TableHead className="font-semibold text-center">Delivered</TableHead>
                <TableHead className="font-semibold text-center">Read</TableHead>
                <TableHead className="font-semibold text-center">Created At</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => {
                const stats = c.stats || { sent: 0, delivered: 0, read: 0 };
                return (
                  <TableRow
                    key={c._id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/dashboard/campaigns/${c._id}`)}
                  >
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm truncate max-w-[150px]">
                      {c.template_name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize text-xs font-semibold ${statusStyles[c.status] || ""}`}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{c.total_contacts || 0}</TableCell>
                    <TableCell className="text-center font-bold">{stats.sent}</TableCell>
                    <TableCell className="text-center font-bold text-emerald-600">
                      {stats.delivered}
                      {stats.sent > 0 && <span className="text-[10px] ml-1 opacity-60 font-normal">({Math.round((stats.delivered/stats.sent)*100)}%)</span>}
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {stats.read}
                      {stats.sent > 0 && <span className="text-[10px] ml-1 opacity-60 font-normal">({Math.round((stats.read/stats.sent)*100)}%)</span>}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {(c.status === "draft" || c.status === "scheduled") && (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => navigate(`/dashboard/campaigns/${c._id}?golive=true`)}
                          >
                            <Play className="w-3 h-3 mr-1" /> Go Live
                          </Button>
                        )}
                        {c.status === "running" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-orange-300 text-orange-600 hover:bg-orange-50"
                            onClick={() => statusMutation.mutate({ id: c._id, status: "paused" })}
                          >
                            <Pause className="w-3 h-3 mr-1" /> Stop
                          </Button>
                        )}
                        {c.status === "paused" && (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => statusMutation.mutate({ id: c._id, status: "running" })}
                          >
                            <Radio className="w-3 h-3 mr-1" /> Resume
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setDeleteId(c._id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground bg-muted/20">
            {campaigns.length} Campaigns Found
          </div>
        </div>
      )}

      {/* Delete Campaign Confirmation */}
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
