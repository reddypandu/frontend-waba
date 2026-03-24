import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, IndianRupee, Receipt, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GST_RATE = 0.18;

[];
  onConfirm: () => void;
  loading?;
}

const PaymentSummary = ({
  open,
  onOpenChange,
  title,
  description,
  lineItems,
  onConfirm,
  loading = false,
}) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = Math.round((subtotal + gstAmount) * 100) / 100;

  return (
    
      
        {/* Header */}
        <div className="bg-primary/5 px-6 pt-6 pb-4">
          
            {title}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </DialogHeader>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            
            <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            {lineItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">
                  ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>

          

          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-sm font-medium text-foreground">
              ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* GST */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              GST (18%)
              IGST</Badge>
            </span>
            <span className="text-sm font-medium text-foreground">
              ₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          

          {/* Total */}
          <div className="flex justify-between items-center py-1">
            <span className="text-base font-bold text-foreground">Total Amount</span>
            <div className="text-right">
              <span className="text-xl font-extrabold text-foreground flex items-center gap-1">
                
                {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-muted-foreground">Inclusive of all taxes</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="w-full h-12 text-base font-semibold gap-2"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                Pay ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            
            Secured by Razorpay · 256-bit SSL Encryption</span>
          </div>

          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            By proceeding, you agree to our Terms of Service and acknowledge that payments are non-refundable.
            An invoice will be sent to your registered email.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { PaymentSummary, GST_RATE };


