import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Receipt, FileText, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const Invoices = () => {
  const { user } = useAuth();

  // Mock data
  const payments = [
    { id: '1', amount: 500, status: 'paid', created_at: new Date().toISOString(), payment_method: 'UPI' },
    { id: '2', amount: 1000, status: 'paid', created_at: new Date().toISOString(), payment_method: 'Card' },
  ];

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
            <p className="text-2xl font-bold">₹{payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">INV-{p.id.padStart(5, '0')}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 uppercase text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()} via {p.payment_method}
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <p className="font-bold">₹{p.amount.toLocaleString()}</p>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
