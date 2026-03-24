import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";





const VerificationChecklist = ({
  businessVerified,
  phoneConnected,
  webhookVerified,
}: VerificationChecklistProps) => {
  const items: CheckItem[] = [
    {
      label: "WhatsApp Account Connected",
      description: "Phone number linked to WhatsApp Business API.",
      done: phoneConnected,
    },
    {
      label: "Meta Business Verification",
      description: "Verify your business in Meta Business Manager to unlock full messaging.",
      done: businessVerified,
      link: "https://business.facebook.com/settings/security",
      linkLabel: "Go to Meta Business Manager",
    },
    {
      label: "Payment Method Added",
      description: "A payment method is required in WhatsApp Manager to send template messages.",
      done: false, // Cannot be checked via API — always show as a reminder
      link: "https://business.facebook.com/billing_hub/payment_methods",
      linkLabel: "Add Payment Method",
    },
    {
      label: "Webhook Configured",
      description: "Webhook is receiving inbound messages and status updates.",
      done: webhookVerified,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const allDone = completedCount === items.length;

  return (
    
      
        <div className="flex items-center justify-between">
          Setup Checklist</CardTitle>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{items.length} completed
          </span>
        </div>
        {allDone ? (
          <p className="text-sm text-success font-medium mt-1">
            ✅ All set You can now send messages and campaigns.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">
            Complete these steps to start sending messages and campaigns.
          </p>
        )}
      </CardHeader>
      
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 py-3 border-b border-border last:border-0"
          >
            {item.done ? (
              
            ) : (
              
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${item.done ? "text-foreground" : "text-foreground"}`}>
                  {item.label}
                </span>
                {item.done ? (
                  <span className="text-xs text-success font-medium">Verified</span>
                ) : (
                  <span className="text-xs text-warning font-medium">Pending</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              {!item.done && item.link && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-1 text-xs gap-1"
                  onClick={() => window.open(item.link, "_blank")}
                >
                  {item.linkLabel} 
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default VerificationChecklist;

