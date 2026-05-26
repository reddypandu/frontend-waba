import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, UserPlus, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost, apiPut } from "@/lib/api";
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

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = React.useState(user?.full_name || "");
  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);
  const [invite, setInvite] = React.useState({ email: "", full_name: "", password: "", role: "user" });
  const canManageTeam = user?.role === "admin" || user?.role === "manager";

  const { data: teamMembers = [], isLoading: teamLoading } = useQuery({
    queryKey: ["team-members", user?.id],
    queryFn: async () => {
      const data = await apiGet("/api/team");
      return data.members || [];
    },
    enabled: canManageTeam,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      // Logic would go here
      console.log("Update profile", name);
    },
    onSuccess: () => {
      toast({ title: "Profile updated" });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => apiPost("/api/team/invite", invite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", user?.id] });
      setInvite({ email: "", full_name: "", password: "", role: "user" });
      toast({ title: "Agent invited" });
    },
    onError: (err) => toast({ title: "Invite failed", description: err.message, variant: "destructive" }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => apiPut(`/api/team/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", user?.id] });
      toast({ title: "Role updated" });
    },
    onError: (err) => toast({ title: "Role update failed", description: err.message, variant: "destructive" }),
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled />
          </div>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {canManageTeam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Team Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={invite.full_name}
                  onChange={(e) => setInvite((prev) => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Support Agent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-email">Email</Label>
                <Input
                  id="agent-email"
                  type="email"
                  value={invite.email}
                  onChange={(e) => setInvite((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="agent@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={invite.role} onValueChange={(role) => setInvite((prev) => ({ ...prev, role }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Agent</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    {user?.role === "admin" && <SelectItem value="admin">Admin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="agent-password">Temporary Password</Label>
                <Input
                  id="agent-password"
                  type="password"
                  value={invite.password}
                  onChange={(e) => setInvite((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  disabled={!invite.email || !invite.password || inviteMutation.isPending}
                  onClick={() => inviteMutation.mutate()}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_180px_160px] gap-3 bg-muted/40 px-4 py-3 text-xs font-semibold text-muted-foreground">
                <span>Member</span>
                <span>Current Role</span>
                <span>Change Role</span>
              </div>
              {teamLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading team...</div>
              ) : teamMembers.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No team members found.</div>
              ) : (
                teamMembers.map((member) => (
                  <div key={member._id} className="grid grid-cols-[1fr_180px_160px] gap-3 px-4 py-3 border-t border-border items-center text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{member.full_name || member.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <Badge variant="outline" className="w-fit capitalize">{member.role || "user"}</Badge>
                    <Select
                      value={member.role || "user"}
                      onValueChange={(role) => roleMutation.mutate({ id: member._id, role })}
                      disabled={roleMutation.isPending || member._id === user?.id}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Agent</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        {user?.role === "admin" && <SelectItem value="admin">Admin</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowLogoutAlert(true)}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of your account? You'll need to log in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
