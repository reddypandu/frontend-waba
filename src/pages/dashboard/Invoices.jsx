import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Receipt, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { jsPDF } from "jspdf";

const Invoices = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: async () => apiGet("/api/admin/me"),
    enabled: !!user,
  });

  const payments = data?.transactions || [];
  const totalAmount = payments.reduce((sum, item) => sum + ((item.amount || 0) / 100), 0);

  const handleDownloadPDF = (payment) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const invoiceId = `INV-${String(payment._id || payment.id).slice(-5).padStart(5, '0')}`;
    const dateStr = new Date(payment.createdAt || Date.now()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    // Colors & Styles
    const primaryColor = [97, 177, 32]; // #61B120
    const secondaryColor = [31, 41, 55]; // Slate-800
    const lightGray = [156, 163, 175]; // Slate-400
    const bgLight = [249, 250, 251]; // Slate-50

    // Top color strip
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 4, "F");

    // Company Logo / Name
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Yestick AI", 20, 20);

    doc.setTextColor(...lightGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("WhatsApp Business API Solution", 20, 25);

    // Invoice Title
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("INVOICE", 140, 22);

    // Invoice metadata
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);

    doc.setFont("helvetica", "bold");
    doc.text("Invoice No:", 140, 32);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceId, 168, 32);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", 140, 38);
    doc.setFont("helvetica", "normal");
    doc.text(dateStr, 168, 38);

    doc.setFont("helvetica", "bold");
    doc.text("Payment ID:", 140, 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(payment.reference_id || "N/A", 168, 44);

    // Divider Line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(20, 52, 190, 52);

    // Billing Parties
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("BILL FROM", 20, 62);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text("YestickAI Technologies", 20, 68);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text("Email: billing@yestickai.com", 20, 73);
    doc.text("Web: www.yestickai.com", 20, 78);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("BILL TO", 110, 62);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text(user?.full_name || "Valued Customer", 110, 68);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(`Email: ${user?.email || "N/A"}`, 110, 73);
    if (user?.phone) {
      doc.text(`Phone: ${user.phone}`, 110, 78);
    }

    // Divider Line
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 88, 190, 88);

    // Itemized Table Header
    doc.setFillColor(243, 244, 246);
    doc.rect(20, 96, 170, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text("DESCRIPTION", 25, 101);
    doc.text("QTY", 125, 101);
    doc.text("PRICE", 145, 101);
    doc.text("TOTAL", 170, 101);

    // Row Data
    const planName = payment.metadata?.plan_name || (payment.description?.includes("paid") || payment.description?.includes("Paid") ? "Paid Plan" : "Connectly Service");
    const amountVal = (payment.amount || 0) / 100;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(10);
    doc.text(planName, 25, 112);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(payment.description || "Subscription upgrade", 25, 116);

    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text("1", 127, 112);
    doc.text(`INR ${amountVal.toLocaleString()}`, 145, 112);
    doc.text(`INR ${amountVal.toLocaleString()}`, 170, 112);

    // Line below item
    doc.setDrawColor(243, 244, 246);
    doc.line(20, 122, 190, 122);

    // Optional Features block
    let yOffset = 127;
    const features = payment.metadata?.features || (payment.description?.includes("paid") || payment.description?.includes("Paid") ? [
      "Send bulk WhatsApp campaigns",
      "Manage chats & set up simple greeting / OOO automations",
      "Unlimited Messages (Based on your WhatsApp Number)",
      "Unlimited Contacts",
      "Auto Replies",
      "Auto Work flows"
    ] : null);

    if (features && Array.isArray(features)) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text("Plan Features included:", 25, yOffset);
      yOffset += 4;

      doc.setFont("helvetica", "normal");
      features.forEach((feature) => {
        doc.text(`• ${feature}`, 27, yOffset);
        yOffset += 4;
      });
      yOffset += 2;
    }

    const finalY = Math.max(yOffset, 140);
    doc.setDrawColor(229, 231, 235);
    doc.line(110, finalY, 190, finalY);

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Subtotal:", 135, finalY + 7);
    doc.setTextColor(...secondaryColor);
    doc.text(`INR ${amountVal.toLocaleString()}`, 170, finalY + 7);

    doc.setTextColor(107, 114, 128);
    doc.text("Tax / GST (Inclusive):", 110, finalY + 13);
    doc.setTextColor(...secondaryColor);
    doc.text("INR 0.00", 170, finalY + 13);

    // Grand Total Highlight Box
    doc.setFillColor(...bgLight);
    doc.rect(110, finalY + 18, 80, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Total Paid:", 115, finalY + 24);
    doc.text(`INR ${amountVal.toLocaleString()}`, 170, finalY + 24);

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Terms & Conditions:", 20, 245);
    doc.text("1. This is a computer-generated receipt, no signature is required.", 20, 249);
    doc.text("2. Subscription charges are billed annually and are non-refundable.", 20, 253);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.text("Thank you for choosing Yestick AI!", 20, 265);

    doc.save(`${invoiceId}.pdf`);
  };

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
                    <p className="font-bold">₹{((p.amount || 0) / 100).toLocaleString()}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadPDF(p)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
