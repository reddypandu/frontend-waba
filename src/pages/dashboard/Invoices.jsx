import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Receipt, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";

const Invoices = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: async () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const payments = data?.transactions || [];
  const totalAmount = payments.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">View all your billing transactions and invoices</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Total Payments</p>
            </div>
            <p className="text-2xl font-bold">{payments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
            <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading invoices...</div>
          ) : payments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No payment history available yet.</div>
          ) : (
            <div className="space-y-4">
              {payments.map((p) => (
                <div key={p._id || p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">INV-{String(p._id || p.id).slice(-5).padStart(5, '0')}</span>
                      <Badge
                        variant="secondary"
                        className={`uppercase text-[10px] ${p.status === 'completed' || p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.createdAt || p.created_at || p.updatedAt || p.updated_at || Date.now()).toLocaleDateString()} • {p.description || p.reference_id || 'Payment'}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="font-bold">₹{(p.amount || 0).toLocaleString()}</p>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
