import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Info,
  MessageSquare,
  Users,
  Calendar,
  Copy,
  ExternalLink,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusStyles = {
  completed: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  running: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  scheduled: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  draft: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  paused: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  failed: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
};

const CampaignDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [reportType, setReportType] = useState(null);
  const [showContactList, setShowContactList] = useState(false);
  const [contactListFilter, setContactListFilter] = useState(null);
  const [showRetargetConfirm, setShowRetargetConfirm] = useState(false);

  // Go Live countdown state
  const isGoLive = searchParams.get("golive") === "true";
  const [countdown, setCountdown] = useState(null);
  const [goLiveStarted, setGoLiveStarted] = useState(false);
  const [goLiveFired, setGoLiveFired] = useState(false);
  const countdownRef = useRef(null);

  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: ["campaign-detail", user?.id, id],
    queryFn: () => apiGet(`/api/whatsapp/campaigns/${id}`),
    select: (data) => data.campaign,
    enabled: !!user && !!id,
  });

  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ["campaign-stats", user?.id, id],
    queryFn: () => apiGet(`/api/whatsapp/campaigns/${id}/stats`),
    enabled: !!user && !!id,
    refetchInterval: (c) => (campaign?.status === 'running' ? 3000 : false),
  });

  const { data: messageLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ["campaign-message-logs", user?.id, id],
    queryFn: () => apiGet(`/api/whatsapp/messages-by-campaign/${id}`),
    select: (data) => data.messages,
    enabled: !!user && !!id,
  });

  const templateName = campaign?.template_name;
  const { data: template } = useQuery({
    queryKey: ["campaign-template", user?.id, templateName],
    queryFn: async () => {
      const { templates } = await apiPost("/api/whatsapp", { action: "get_templates" });
      return templates.find(t => t.name === templateName);
    },
    enabled: !!user && !!templateName,
  });

  // Go Live send mutation
  const goLiveMutation = useMutation({
    mutationFn: () => apiPost(`/api/whatsapp/campaigns/${id}/send`),
    onSuccess: () => {
      toast({ title: "Campaign is Live!", description: "Messages are being sent." });
      setSearchParams({}, { replace: true });
      refetch();
      refetchStats();
      refetchLogs();
    },
    onError: (err) => {
      toast({ title: "Launch failed", description: err.message, variant: "destructive" });
      setSearchParams({}, { replace: true });
    },
  });

  // Retarget mutation - resend to failed contacts
  const retargetMutation = useMutation({
    mutationFn: () => apiPost(`/api/whatsapp/campaigns/${id}/retarget`),
    onSuccess: (data) => {
      toast({ title: `Retargeting ${data.sent} failed contact(s)...` });
      setShowRetargetConfirm(false);
      refetch();
      refetchStats();
    },
    onError: (err) => toast({ title: "Failed to retarget", description: err.message, variant: "destructive" }),
  });

  // Go Live countdown effect
  useEffect(() => {
    if (isGoLive && campaign && !goLiveStarted && !goLiveFired && (campaign.status === "draft" || campaign.status === "scheduled")) {
      setGoLiveStarted(true);
      setCountdown(20);
    }
  }, [isGoLive, campaign?.status, goLiveStarted, goLiveFired, campaign]);

  useEffect(() => {
    if (!goLiveStarted || goLiveFired) return;
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [goLiveStarted, goLiveFired]);

  useEffect(() => {
    if (countdown === 0 && goLiveStarted && !goLiveFired) {
      setGoLiveFired(true);
      setGoLiveStarted(false);
      goLiveMutation.mutate();
    }
  }, [countdown, goLiveStarted, goLiveFired, goLiveMutation]);

  const cancelGoLive = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
    setGoLiveStarted(false);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading report...</p>
    </div>
  );

  if (!campaign) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Campaign not found.</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/campaigns")}>Back to Campaigns</Button>
    </div>
  );

  const failedLogs = messageLogs.filter(l => l.status === "failed");
  const failReasonsGrouped = [];
  const reasonMap = new Map();
  failedLogs.forEach(l => {
    let reason = l.error_details || "Meta Policy or Connection Error";
    if (reason === "undefined") reason = "Meta Policy or Media Error";
    reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
  });
  reasonMap.forEach((count, reason) => failReasonsGrouped.push({ reason, count }));

  const getFilteredLogs = (filter) => {
    if (!filter) return messageLogs;
    if (filter === "sent") return messageLogs.filter(l => ["sent", "delivered", "read"].includes(l.status));
    if (filter === "delivered") return messageLogs.filter(l => ["delivered", "read"].includes(l.status));
    if (filter === "read") return messageLogs.filter(l => l.status === "read");
    if (filter === "failed") return messageLogs.filter(l => l.status === "failed");
    return messageLogs;
  };

  const statusStyle = statusStyles[campaign.status] || statusStyles.draft;
  const isProcessing = campaign.status === "running";
  const totalCost = (statsData?.sent || 0) * 0.50; // Dynamic scale logic could be added

  const stats = [
    { key: "attempted", label: "Attempted", value: campaign.total_contacts, color: "text-foreground" },
    { key: "sent", label: "Sent", value: statsData?.sent || 0, color: "text-foreground" },
    { key: "delivered", label: "Delivered", value: statsData?.delivered || 0, color: "text-emerald-600" },
    { key: "read", label: "Read", value: statsData?.read || 0, color: "text-primary" },
    { key: "replied", label: "Replied", value: statsData?.replied || 0, color: "text-foreground" },
    { key: "failed", label: "Failed", value: statsData?.failed || 0, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      {/* Go Live Banner */}
      {countdown !== null && countdown > 0 && (
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-6 text-center space-y-3 animate-in slide-in-from-top-4 duration-300">
          <p className="text-lg font-semibold text-foreground">Campaign starts in</p>
          <p className="text-5xl font-bold text-primary tabular-nums tracking-tighter">{countdown}</p>
          <p className="text-sm text-muted-foreground">seconds · messages will be sent to {campaign.total_contacts} contacts</p>
          <Button variant="destructive" size="sm" onClick={cancelGoLive}>Cancel Launch</Button>
        </div>
      )}
      {countdown === 0 && goLiveMutation.isPending && (
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-6 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-lg font-semibold text-primary">Sending messages now...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/campaigns")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{campaign.name}</h1>
          <Separator orientation="vertical" className="h-6" />
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">WhatsApp</span>
          <Separator orientation="vertical" className="h-6" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
            <span className="capitalize">{campaign.status}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(id); toast({ title: "ID Copied" }); }}>
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm bg-muted/50 px-4 py-2 rounded-lg border border-border">
          <span className="text-muted-foreground">Estimated Cost:</span>
          <span className="text-lg font-bold text-foreground">₹ {totalCost.toLocaleString("en-IN")}</span>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Statistics</h2>
            <Button variant="outline" size="sm" onClick={() => { refetch(); refetchStats(); refetchLogs(); }} className="gap-1.5 h-8">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <span className="text-xs text-primary bg-white px-2 py-1 rounded border border-primary/20 shadow-sm animate-pulse">
              Live Updates Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            {failedLogs.length > 0 && (campaign.status === "completed" || campaign.status === "failed") && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() => setShowRetargetConfirm(true)}
                disabled={retargetMutation.isPending}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retarget Failed ({failedLogs.length})
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        </div>

        <TooltipProvider>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="border-border hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{campaign.template_name}</span>
                    {template?.needs_media_update && !template?.local_url && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold border border-orange-200">
                        <AlertCircle className="w-3 h-3" />
                        MEDIA UPDATE REQUIRED
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
                    <Info className="w-3 h-3 text-muted-foreground/30" />
                  </div>
                  <p className={`text-2xl font-bold font-mono tracking-tight ${s.color}`}>{s.value}</p>
                  {isProcessing && s.key !== "attempted" && s.key !== "failed" && (
                    <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-progress-indefinite" />
                    </div>
                  )}
                  {s.value > 0 && (
                    <button
                      className="text-[10px] font-semibold text-primary hover:underline mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { setReportType(s.key); setShowContactList(false); }}
                    >
                      User list <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TooltipProvider>
      </div>

      <Separator />

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 text-sm">
        <p className="text-muted-foreground font-semibold">Message & Template</p>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Template</p>
            <p className="font-semibold text-primary underline underline-offset-4 decoration-primary/30">{campaign.template_name}</p>
          </div>
          {template?.components ? (
            <div className="rounded-xl border border-border bg-emerald-50/20 shadow-inner p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
              <p className="text-xs font-bold text-emerald-800/60 uppercase mb-2">Content Preview</p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed truncate max-h-[120px]">
                {template.components.find(c => c.type === 'BODY')?.text || campaign.template_name}
              </p>
            </div>
          ) : (
             <div className="rounded-xl border border-dashed border-border p-4 text-center italic text-muted-foreground">
               Body content not available in locally synced data.
             </div>
          )}
        </div>

        <p className="text-muted-foreground font-semibold">Audience Info</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-border">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-bold">{campaign.total_contacts} Contacts</span>
          </div>
          <Badge variant="outline" className="capitalize">{campaign.audience_type}</Badge>
        </div>

        <p className="text-muted-foreground font-semibold">Timestamps</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground w-20">Launch:</span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {campaign.started_at ? format(new Date(campaign.started_at), "dd/MM/yyyy HH:mm:ss") : "Queued"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground w-20">End:</span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {campaign.completed_at ? format(new Date(campaign.completed_at), "dd/MM/yyyy HH:mm:ss") : "---"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Report Drill-down Dialog */}
      <Dialog open={reportType !== null} onOpenChange={(o) => !o && setReportType(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="capitalize">{reportType}</span> User List
            </DialogTitle>
          </DialogHeader>
          
          {reportType === "failed" && failReasonsGrouped.length > 0 && (
             <div className="space-y-3 mb-4">
               {failReasonsGrouped.map((item, i) => (
                 <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-xs">
                   <div className="flex justify-between font-bold text-destructive mb-1">
                     <span>Reason: {item.reason}</span>
                     <span>Count: {item.count}</span>
                   </div>
                 </div>
               ))}
             </div>
          )}

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
               <TableHeader className="bg-muted/50">
                 <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Phone</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Last Action</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {getFilteredLogs(reportType).map((log, i) => (
                   <TableRow key={log._id}>
                     <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                     <TableCell className="font-mono text-xs">{log.phone_number}</TableCell>
                     <TableCell>
                       <Badge variant="outline" className={`text-[10px] scale-90 ${
                         log.status === 'read' ? 'bg-primary/10 text-primary border-primary/20' :
                         log.status === 'failed' ? 'bg-destructive/10 text-destructive border-destructive/20' : ''
                       }`}>
                         {log.status}
                       </Badge>
                     </TableCell>
                     <TableCell className="text-right text-[10px] text-muted-foreground">
                       {format(new Date(log.updatedAt || log.createdAt), "HH:mm:ss")}
                     </TableCell>
                   </TableRow>
                 ))}
                 {getFilteredLogs(reportType).length === 0 && (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No contacts matching this list.</TableCell>
                   </TableRow>
                 )}
               </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Retarget Confirmation */}
      <AlertDialog open={showRetargetConfirm} onOpenChange={setShowRetargetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-600" />
              Retarget Failed Contacts
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will resend the campaign to <strong>{failedLogs.length}</strong> contact(s) that didn't receive the message. Estimated cost: ₹ {(failedLogs.length * 0.50).toFixed(2)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => retargetMutation.mutate()}
              disabled={retargetMutation.isPending}
            >
              {retargetMutation.isPending ? "Starting..." : "Start Retargeting"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 2s infinite linear;
        }
      `}} />
    </div>
  );
};

export default CampaignDetail;
