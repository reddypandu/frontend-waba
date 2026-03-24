import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Send, Users, CheckCircle, Eye, MessageCircle, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

const statusStyles = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  running: "bg-blue-100 text-blue-700 border-blue-200",
  scheduled: "bg-amber-100 text-amber-700 border-amber-200",
  draft: "bg-muted text-muted-foreground",
  paused: "bg-orange-100 text-orange-700 border-orange-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["campaign-detail", id],
    queryFn: () => apiPost("/api/whatsapp", { action: "get_campaign_detail", id }),
    enabled: !!id,
  });

  const campaign = data?.campaign || { name: "Loading...", status: "draft" };
  const logs = data?.logs || [];
  
  // Calculate stats from logs
  const stats = {
    sent: logs.length,
    delivered: logs.filter(l => ['delivered', 'read'].includes(l.status?.toLowerCase())).length,
    read: logs.filter(l => l.status?.toLowerCase() === 'read').length,
    failed: logs.filter(l => l.status?.toLowerCase() === 'failed').length,
    replied: 0 // Replica of inbox logic needed here
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading campaign details...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/campaigns")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className={`capitalize ${statusStyles[campaign.status?.toLowerCase()] || ""}`}>
                {campaign.status}
              </Badge>
              <span className="text-xs text-muted-foreground">Created {new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Stats
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <DetailStatCard label="Sent" value={stats.sent} icon={Send} color="text-blue-600" />
        <DetailStatCard label="Delivered" value={stats.delivered} icon={CheckCircle} color="text-emerald-600" />
        <DetailStatCard label="Read" value={stats.read} icon={Eye} color="text-violet-600" />
        <DetailStatCard label="Replied" value={stats.replied} icon={MessageCircle} color="text-indigo-600" />
        <DetailStatCard label="Failed" value={stats.failed} icon={XCircle} color="text-rose-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Delivery Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Contact</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Time</TableHead>
                    <TableHead className="text-right font-bold">Message ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-muted-foreground italic">
                        No logs available for this campaign yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="font-medium text-sm">{log.contact_name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">+{log.phone_number}</div>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="text-[10px] capitalize">{log.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-[10px] text-muted-foreground font-mono">
                          {log.whatsapp_message_id?.split('_').pop() || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Campaign Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Template Used</Label>
              <p className="font-bold text-primary text-sm">{campaign.template_id}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Audience</Label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-bold text-sm">{stats.sent} Total Contacts</span>
              </div>
              <p className="text-xs text-muted-foreground">Method: <span className="capitalize">{campaign.audience_type}</span></p>
            </div>
            <div className="pt-4 border-t space-y-4">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Campaign Configuration</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Schedule:</span>
                  <span className="font-medium capitalize">{campaign.schedule_type}</span>
                </div>
                {campaign.scheduled_at && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Target Date:</span>
                    <span className="font-medium">{new Date(campaign.scheduled_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DetailStatCard = ({ label, value, icon: Icon, color }) => (
  <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
      <div className={`p-2.5 rounded-xl bg-muted mb-2.5 shadow-inner`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-xl font-black tabular-nums tracking-tight">{value.toLocaleString()}</p>
      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">{label}</p>
    </CardContent>
  </Card>
);

export default CampaignDetail;
