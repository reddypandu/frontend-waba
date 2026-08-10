import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, IndianRupee, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function PaymentFlow() {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, verifying, success
  
  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      const res = await fetch(`/api/business/transaction/${transactionId}`);
      const data = await res.json();
      if (data.success) {
        setTransaction(data.transaction);
        if (data.transaction.payment_status === 'completed') {
          setStatus('success');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPayLoading(true);
    setStatus('verifying');
    
    // Simulate WhatsApp Payment Verification delay
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/business/pay/${transactionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: 'pay_' + Math.random().toString(36).substr(2, 9) })
        });
        const data = await res.json();
        
        if (data.success) {
          toast.success("Payment Successful!");
          setStatus('success');
        } else {
          toast.error("Payment failed to verify");
          setStatus('pending');
        }
      } catch (err) {
        toast.error("An error occurred");
        setStatus('pending');
      } finally {
        setPayLoading(false);
      }
    }, 2500);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading Invoice...</p>
      </div>
    </div>
  );

  if (!transaction) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center py-12 shadow-xl border-0">
        <CardTitle className="text-red-500 mb-2">Invoice Not Found</CardTitle>
        <p className="text-slate-500">The requested invoice could not be found or has expired.</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-slate-200 overflow-hidden">
        
        {status === 'pending' && (
          <>
            <div className="bg-[#128C7E] text-white p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <IndianRupee className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <p className="text-[#E0F2F1] text-sm font-medium uppercase tracking-wider mb-2">Amount Due</p>
                <div className="flex items-center justify-center gap-1 text-5xl font-bold">
                  <span className="text-3xl text-[#E0F2F1]">₹</span>
                  {transaction.payment_amount}
                </div>
              </div>
            </div>
            <CardContent className="p-6 bg-white">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-500">Service</span>
                  <span className="font-semibold text-slate-800 text-right">{transaction.service_name || 'Consultation'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-500">Billed To</span>
                  <span className="font-semibold text-slate-800 text-right">{transaction.customer_name}</span>
                </div>
                {transaction.meeting_date && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-500">Schedule</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {new Date(transaction.meeting_date).toLocaleDateString()} at {transaction.meeting_time}
                    </span>
                  </div>
                )}
              </div>

              <Button 
                className="w-full py-6 text-lg font-semibold rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg shadow-[#25D366]/30 transition-all flex items-center justify-center gap-2"
                onClick={handlePay}
                disabled={payLoading}
              >
                <CreditCard className="w-5 h-5" />
                Pay via WhatsApp
              </Button>
              <div className="flex items-center justify-center gap-1 mt-4 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4" />
                Secured Payments
              </div>
            </CardContent>
          </>
        )}

        {status === 'verifying' && (
          <div className="p-12 text-center bg-white flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <IndianRupee className="w-8 h-8 text-[#128C7E]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying Payment</h2>
            <p className="text-slate-500">Please wait while we confirm your payment securely with WhatsApp...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-[#0B141A] min-h-[400px] flex flex-col relative overflow-hidden">
            {/* Background Pattern Simulation */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#25D366 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
            
            {/* Top Amount Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
              <div className="flex items-center gap-1 text-6xl font-normal text-white tracking-tight mb-8">
                <span className="text-5xl">₹</span>
                {transaction.payment_amount}
              </div>
            </div>

            {/* Bottom Receipt Card */}
            <div className="bg-[#111B21] rounded-t-3xl p-6 relative z-10 shadow-2xl border-t border-[#2A3942]">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                  <IndianRupee className="w-6 h-6 text-[#111B21]" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-[#E9EDEF] text-lg font-medium mb-1">
                    Sent to {transaction.service_name || 'Business'}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#25D366] text-base font-medium">Completed</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[#8696A0] text-sm">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      {/* Double Blue Ticks */}
                      <div className="flex -space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-[#53BDEB]" />
                        <CheckCircle2 className="w-4 h-4 text-[#53BDEB]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full py-6 rounded-full bg-[#25D366] hover:bg-[#1DA851] text-[#111B21] font-semibold text-base transition-colors"
                onClick={() => window.close()}
              >
                Return to WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
