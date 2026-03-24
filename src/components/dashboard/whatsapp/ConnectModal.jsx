import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, Building2, Phone, ShieldCheck } from "lucide-react";



const steps = [
  { icon: LogIn, label: "Login with Facebook", description: "Authenticate with your Facebook account" },
  { icon: Building2, label: "Select your Business Account", description: "Choose your Meta Business portfolio" },
  { icon: Phone, label: "Add or select phone number", description: "Pick the number for WhatsApp messaging" },
  { icon: ShieldCheck, label: "Complete verification", description: "Verify ownership and finalize setup" },
];

const ConnectModal = ({ open, onOpenChange, onConnect, loading }: ConnectModalProps) => {
  return (
    
      
        
          Connect your WhatsApp Business</DialogTitle>
          
            Follow these steps to connect your WhatsApp Business account to The Patterns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0 text-sm font-bold">
                {i + 1}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
          By connecting, you authorize The Patterns to send and receive messages on behalf of your WhatsApp Business account.
        </div>

        <div className="flex justify-end gap-3 pt-2">
           onOpenChange(false)}>
            Cancel
          </Button>
          
            
            {loading ? "Connecting..." : "Continue with Facebook"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectModal;

