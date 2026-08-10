import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function PaymentUpiRedirect() {
  const { transactionId } = useParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionAndRedirect = async () => {
      try {
        const res = await fetch(`/api/business/transaction/${transactionId}`);
        const data = await res.json();
        
        if (data.success && data.transaction) {
          const tx = data.transaction;
          if (tx.upi_id) {
            const upiLink = `upi://pay?pa=${tx.upi_id}&pn=${encodeURIComponent(tx.service_name || 'Payment')}&am=${tx.payment_amount}&cu=INR&tr=${tx._id}`;
            window.location.href = upiLink;
          } else {
            setError('No UPI ID configured for this transaction.');
          }
        } else {
          setError('Transaction not found.');
        }
      } catch (err) {
        setError('Failed to fetch transaction details.');
      }
    };
    
    fetchTransactionAndRedirect();
  }, [transactionId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="bg-card p-8 rounded-2xl shadow-xl flex flex-col items-center border animate-in zoom-in-95">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold mb-2">Opening UPI App...</h2>
        <p className="text-muted-foreground text-center">Please wait while we redirect you to your secure payment app.</p>
      </div>
    </div>
  );
}
