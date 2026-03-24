import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Phone, Globe, Mail, MapPin, RefreshCw, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const BusinessProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Mock data
  const business = { name: "Your Business", address: "123 Main St", email: "info@example.com", website: "https://example.com" };
  const whatsappProfile = { about: "Welcome to our business!", description: "We provide quality services.", vertical: "RETAIL" };

  const [form, setForm] = React.useState({ ...business, ...whatsappProfile });

  const updateMutation = useMutation({
    mutationFn: async () => {
      console.log("Update profile", form);
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({ title: "Profile updated successfully" });
    },
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your WhatsApp Business presence</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-2" /> Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}><X className="h-4 w-4 mr-2" /> Cancel</Button>
            <Button onClick={() => updateMutation.mutate()}><Check className="h-4 w-4 mr-2" /> Save Changes</Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <Card className="overflow-hidden">
          <div className="h-32 bg-primary/10 flex items-end p-6">
            <div className="w-24 h-24 rounded-2xl bg-background border-4 border-background shadow-lg flex items-center justify-center -mb-12 ring-2 ring-primary/5">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardContent className="pt-16 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{form.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Verified</Badge>
                  <span>WhatsApp Business API</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditing ? (
              <div className="grid sm:grid-cols-2 gap-6">
                <InfoItem icon={MapPin} label="Address" value={form.address} />
                <InfoItem icon={Mail} label="Contact Email" value={form.email} />
                <InfoItem icon={Globe} label="Website" value={form.website} />
                <InfoItem icon={Building2} label="Vertical" value={form.vertical} />
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Business Name</Label>
                    <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Vertical / Industry</Label>
                    <Input value={form.vertical} onChange={e => setForm({...form, vertical: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Public Email</Label>
                    <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Website</Label>
                    <Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public WhatsApp Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">About Status</Label>
                  <p className="mt-1 text-foreground font-medium">{form.about}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Business Description</Label>
                  <p className="mt-1 text-foreground whitespace-pre-wrap">{form.description}</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label>About Tagline (Status)</Label>
                  <Input value={form.about} onChange={e => setForm({...form, about: e.target.value})} maxLength={139} />
                  <p className="text-[10px] text-muted-foreground">Max 139 characters</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Detailed Description</Label>
                  <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} maxLength={512} />
                  <p className="text-[10px] text-muted-foreground">Max 512 characters</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3">
    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
      <p className="text-sm font-semibold truncate mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

export default BusinessProfile;
