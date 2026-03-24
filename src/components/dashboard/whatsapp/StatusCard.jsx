import { CheckCircle, Loader2, AlertTriangle, WifiOff, Building2, Hash, Phone, MessageSquare, FileText, Send, FlaskConical, Clock, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const statusConfig = {
  connected: {
    icon: CheckCircle,
    iconClass: "text-success",
    bgClass: "bg-success/5 border-success/20",
    badgeClass: "bg-success/10 text-success border-success/20",
    badgeLabel: "Connected",
    title: "WhatsApp Business connected",
    description: "Your WhatsApp Business account is connected successfully.\nYou can now send messages and run campaigns.",
  },
  sandbox: {
    icon: FlaskConical,
    iconClass: "text-warning",
    bgClass: "bg-warning/5 border-warning/20",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    badgeLabel: "Sandbox mode",
    title: "WhatsApp test number connected",
    description: "This account is connected using a Meta-provided test number.\nTest numbers are for development and testing only and cannot send real customer messages.",
  },
  connecting: {
    icon: Loader2,
    iconClass: "text-info animate-spin",
    bgClass: "bg-info/5 border-info/20",
    badgeClass: "bg-info/10 text-info border-info/20",
    badgeLabel: "Connecting",
    title: "Connecting phone number",
    description: "Meta is processing your WhatsApp setup.\nThis may take a few minutes.",
  },
  action_required: {
    icon: AlertTriangle,
    iconClass: "text-destructive",
    bgClass: "bg-destructive/5 border-destructive/20",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    badgeLabel: "Action required",
    title: "Action required to complete WhatsApp setup",
    description: "We couldn't finish connecting your phone number. Please contact The Patterns support team to resolve this issue.",
  },
  pending_partner: {
    icon: Clock,
    iconClass: "text-warning",
    bgClass: "bg-warning/5 border-warning/20",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    badgeLabel: "Action required",
    title: "Phone number pending verification",
    description: "Meta requires additional setup to complete phone number registration.",
  },
  not_connected: {
    icon: WifiOff,
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted/50 border-border",
    badgeClass: "bg-muted text-muted-foreground border-border",
    badgeLabel: "Not connected",
    title: "No WhatsApp account connected yet",
    description: "Connect your WhatsApp account to start sending messages.",
  },
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
    <div className="flex items-center gap-2.5">
      
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <span className="text-sm font-medium font-mono text-foreground">{value || "—"}</span>
  </div>
);

const SandboxDisabledButton = ({ children, icon: Icon }) => (
  
    
      
        <span className="inline-flex">
          
             {children}
          </Button>
        </span>
      </TooltipTrigger>
      
        <p>Available after connecting a real WhatsApp number.</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const StatusCard = ({ status, phoneNumber, businessName, wabaId, onConnect, onRetry, onContactSupport, onSendTest, onAddRealNumber }) => {
  const config = statusConfig[status] || statusConfig.not_connected;
  const Icon = config.icon;
  const navigate = useNavigate();

  return (
    
      
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5">
              
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-foreground">{config.title}</p>
              {config.description.split("\n").map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground max-w-md">{line}</p>
              ))}
            </div>
          </div>
          
            {config.badgeLabel}
          </Badge>
        </div>

        {status === "connected" && (
          <div className="mt-5 ml-10 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              
              
              
              
            </div>
            <div className="flex items-center gap-3">
               navigate("/dashboard/templates/create")}>
                 Create Template
              </Button>
              
                 Send Test Message
              </Button>
            </div>
          </div>
        )}

        {status === "sandbox" && (
          <div className="mt-5 ml-10 space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-info/20 bg-info/5 p-3">
              
              <p className="text-sm text-foreground">
                To start real messaging, connect a verified WhatsApp Business number.
              </p>
            </div>
            <div className="flex items-center gap-3">
              
                Add real WhatsApp number
              </Button>
               window.open("https://developers.facebook.com/docs/whatsapp/cloud-api/get-started", "_blank")}>
                View setup guide
              </Button>
            </div>
            <div className="flex items-center gap-3">
              Create Template</SandboxDisabledButton>
              Send Test Message</SandboxDisabledButton>
            </div>
          </div>
        )}

        {status === "connecting" && (
          <div className="mt-4 ml-10 space-y-2">
            
               Connecting…
            </Button>
            <p className="text-xs text-muted-foreground">
              If this does not update, please add a real WhatsApp Business number.
            </p>
          </div>
        )}

        {status === "pending_partner" && (
          <div className="mt-5 ml-10 space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3">
              
              <p className="text-sm text-foreground">
                This commonly occurs when using a test number. Connect a real WhatsApp Business number to complete setup.
              </p>
            </div>
            
              Add real WhatsApp number
            </Button>
          </div>
        )}

        {status === "action_required" && (
          <div className="flex items-center gap-3 mt-4 ml-10">
            
              Contact Support
            </Button>
            
              Retry Connection
            </Button>
          </div>
        )}

        {status === "not_connected" && (
          <div className="mt-4 ml-10">
            
              Connect WhatsApp
            </Button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border ml-10">
          <p className="text-xs text-muted-foreground">
            Powered by WhatsApp Business Platform by Meta
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
