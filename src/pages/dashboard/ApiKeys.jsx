import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Copy, RefreshCw, Trash2, Key, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
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
import { useNavigate } from "react-router-dom";

export default function ApiKeys() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dialogAction, setDialogAction] = useState(null); // 'regenerate' | 'revoke'

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["me", user?.id],
    queryFn: async () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const { data: keyData, isLoading, refetch } = useQuery({
    queryKey: ["apiKey"],
    queryFn: () => apiGet("/api/v1/keys"),
  });

  const generateMutation = useMutation({
    mutationFn: () => apiPost("/api/v1/keys/generate", {}),
    onSuccess: () => {
      toast({ title: "API Key generated successfully" });
      queryClient.invalidateQueries({ queryKey: ["apiKey"] });
    },
    onError: (err) => toast({ title: "Failed to generate key", description: err.message, variant: "destructive" }),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => apiPost("/api/v1/keys/regenerate", {}),
    onSuccess: () => {
      toast({ title: "API Key regenerated successfully" });
      queryClient.invalidateQueries({ queryKey: ["apiKey"] });
      setDialogAction(null);
    },
    onError: (err) => toast({ title: "Failed to regenerate key", description: err.message, variant: "destructive" }),
  });

  const revokeMutation = useMutation({
    mutationFn: () => apiDelete("/api/v1/keys"),
    onSuccess: () => {
      toast({ title: "API Key revoked successfully" });
      queryClient.invalidateQueries({ queryKey: ["apiKey"] });
      setDialogAction(null);
    },
    onError: (err) => toast({ title: "Failed to revoke key", description: err.message, variant: "destructive" }),
  });

  const handleCopy = () => {
    if (keyData?.api_key) {
      navigator.clipboard.writeText(keyData.api_key);
      setCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmAction = () => {
    if (dialogAction === "regenerate") regenerateMutation.mutate();
    if (dialogAction === "revoke") revokeMutation.mutate();
  };

  const hasKey = !!keyData?.api_key;
  const isRevoked = keyData?.is_active === false;

  const userPlan = profileData?.subscription?.plan || "free"; // Default to 'free' for new users

  if (profileLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userPlan === 'free') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Key Management</h1>
          <p className="text-muted-foreground mt-2">Integrate WhatsApp capabilities directly into your application.</p>
        </div>
        <Card className="border-primary/20 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20">
            <Key className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">API Keys are a Premium Feature</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Upgrade to the Paid Plan to generate and manage API keys for programmatic access to our platform.
            </p>
            <Button onClick={() => navigate('/dashboard/billing')}>
              Upgrade to Paid Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Key Management</h1>
        <p className="text-muted-foreground mt-2">Manage your API keys and integrate WhatsApp capabilities directly into your application.</p>
      </div>

      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" /> Your API Key
          </CardTitle>
          <CardDescription>Use this key to authenticate requests to the API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !hasKey ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20">
              <Key className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No API Key Generated</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                You haven't generated an API key yet. Generate one to start sending WhatsApp messages programmatically.
              </p>
              <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                {generateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate New Key
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border bg-muted/10 gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Secret Key</p>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono bg-background px-3 py-1.5 rounded-md border text-primary">
                        {showKey ? keyData.api_key : "yt_••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                      </code>
                      <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCopy}>
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="space-y-1 text-right">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={keyData.is_active ? "default" : "destructive"}>
                        {keyData.is_active ? "Active" : "Revoked"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/5 p-4 rounded-xl border border-dashed">
                  <div>
                    <span className="text-muted-foreground">Created:</span>{" "}
                    <span className="font-medium">{keyData.created_at ? format(new Date(keyData.created_at), "PPP") : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Used:</span>{" "}
                    <span className="font-medium">{keyData.last_used_at ? format(new Date(keyData.last_used_at), "PPP") : "Never"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogAction("regenerate")}
                  disabled={regenerateMutation.isPending}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${regenerateMutation.isPending ? "animate-spin" : ""}`} />
                  Regenerate Key
                </Button>
                {keyData.is_active && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setDialogAction("revoke")}
                    disabled={revokeMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Revoke Key
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>Learn how to use your API key to interact with our endpoints.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bash" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="bash">cURL (Bash)</TabsTrigger>
              <TabsTrigger value="javascript">Node.js (Fetch)</TabsTrigger>
              <TabsTrigger value="python">Python (Requests)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bash">
              <div className="bg-zinc-950 rounded-lg p-4 text-sm text-zinc-50 overflow-x-auto">
                <pre><code>{`curl -X POST https://api.yourdomain.com/api/v1/send-template \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "1234567890",
    "template_name": "hello_world",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John" }
        ]
      }
    ]
  }'`}</code></pre>
              </div>
            </TabsContent>
            
            <TabsContent value="javascript">
              <div className="bg-zinc-950 rounded-lg p-4 text-sm text-zinc-50 overflow-x-auto">
                <pre><code>{`const response = await fetch("https://api.yourdomain.com/api/v1/send-template", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    to: "1234567890",
    template_name: "hello_world",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "John" }
        ]
      }
    ]
  })
});

const data = await response.json();
console.log(data);`}</code></pre>
              </div>
            </TabsContent>
            
            <TabsContent value="python">
              <div className="bg-zinc-950 rounded-lg p-4 text-sm text-zinc-50 overflow-x-auto">
                <pre><code>{`import requests

url = "https://api.yourdomain.com/api/v1/send-template"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "to": "1234567890",
    "template_name": "hello_world",
    "components": [
        {
            "type": "body",
            "parameters": [
                { "type": "text", "text": "John" }
            ]
        }
    ]
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}</code></pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
            <CardDescription>Available endpoints for programmatic access.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Endpoint</th>
                      <th className="text-left py-2 px-3 font-medium">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 px-3 font-mono text-xs">/api/v1/send-template</td>
                      <td className="py-2 px-3"><Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">POST</Badge></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-xs">/api/v1/send-message</td>
                      <td className="py-2 px-3"><Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">POST</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-sm space-y-2 text-muted-foreground mt-4">
                <p><strong className="text-foreground">Authentication:</strong> Bearer Token</p>
                <p><strong className="text-foreground">Content-Type:</strong> application/json</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Examples</CardTitle>
            <CardDescription>Standard API response formats.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2 text-green-500">Success Response (200 OK)</p>
                <div className="bg-zinc-950 rounded-lg p-4 text-xs text-zinc-50 overflow-x-auto">
                  <pre><code>{`{
  "success": true,
  "message_id": "wamid.HBgLOTE...",
  "status": "sent"
}`}</code></pre>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-red-500">Error Response (401 Unauthorized)</p>
                <div className="bg-zinc-950 rounded-lg p-4 text-xs text-zinc-50 overflow-x-auto">
                  <pre><code>{`{
  "error": "Invalid or inactive API key"
}`}</code></pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!dialogAction} onOpenChange={(open) => !open && setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "regenerate" ? "Regenerate API Key?" : "Revoke API Key?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "regenerate" 
                ? "This will invalidate your current API key immediately. Any applications using the old key will stop working until updated." 
                : "This will permanently disable your API key. Integrations relying on this key will instantly fail."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={dialogAction === "revoke" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {dialogAction === "regenerate" ? "Yes, Regenerate" : "Yes, Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
