import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Phone, ExternalLink, Reply } from "lucide-react";

const TemplateButtons = ({ state, onChange }) => {
  const { buttonType, quickReplies = [], ctaButtons = [] } = state;

  const setButtonType = (type) => {
    onChange({
      ...state,
      buttonType: type,
      quickReplies: type === "quick_reply" ? [{ text: "" }] : [],
      ctaButtons: type === "call_to_action" ? [{ type: "URL", text: "", url: "" }] : [],
    });
  };

  // Quick Reply handlers
  const addQuickReply = () => {
    if (quickReplies.length >= 3) return;
    onChange({ ...state, quickReplies: [...quickReplies, { text: "" }] });
  };

  const updateQuickReply = (idx, text) => {
    const updated = [...quickReplies];
    updated[idx] = { text: text.slice(0, 25) };
    onChange({ ...state, quickReplies: updated });
  };

  const removeQuickReply = (idx) => {
    onChange({ ...state, quickReplies: quickReplies.filter((_, i) => i !== idx) });
  };

  // CTA handlers
  const addCTA = () => {
    if (ctaButtons.length >= 2) return;
    const existingTypes = ctaButtons.map(b => b.type);
    const newType = existingTypes.includes("URL") ? "PHONE_NUMBER" : "URL";
    onChange({
      ...state,
      ctaButtons: [...ctaButtons, { type: newType, text: "", ...(newType === 'URL' ? { url: "" } : { phone_number: "" }) }],
    });
  };

  const updateCTA = (idx, updates) => {
    const updated = [...ctaButtons];
    updated[idx] = { ...updated[idx], ...updates };
    if (updates.text !== undefined) updated[idx].text = updates.text.slice(0, 20);
    onChange({ ...state, ctaButtons: updated });
  };

  const removeCTA = (idx) => {
    onChange({ ...state, ctaButtons: ctaButtons.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <Label className="text-sm font-semibold">Buttons (Optional)</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Add interactive buttons. You can use either Quick Reply or Call-to-Action buttons (not both).
        </p>
      </div>

      <Select value={buttonType} onValueChange={setButtonType}>
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Select button type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Buttons</SelectItem>
          <SelectItem value="quick_reply">Quick Reply (up to 3)</SelectItem>
          <SelectItem value="call_to_action">Call to Action (up to 2)</SelectItem>
        </SelectContent>
      </Select>

      {/* Quick Reply Buttons */}
      {buttonType === "quick_reply" && (
        <div className="space-y-3 pt-2">
          {quickReplies.map((qr, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Reply className="h-4 w-4" />
                <span className="text-xs font-medium">#{idx + 1}</span>
              </div>
              <Input
                value={qr.text}
                onChange={(e) => updateQuickReply(idx, e.target.value)}
                placeholder="Button text (max 25 chars)"
                maxLength={25}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10 text-right">{qr.text?.length || 0}/25</span>
              {quickReplies.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeQuickReply(idx)} className="h-8 w-8 text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {quickReplies.length < 3 && (
            <Button variant="outline" size="sm" onClick={addQuickReply} className="w-full dashed">
              <Plus className="h-4 w-4 mr-1" /> Add Quick Reply
            </Button>
          )}
        </div>
      )}

      {/* Call to Action Buttons */}
      {buttonType === "call_to_action" && (
        <div className="space-y-4 pt-2">
          {ctaButtons.map((cta, idx) => (
            <div key={idx} className="rounded-lg border border-border p-3 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 h-6">
                  {cta.type === "PHONE_NUMBER" ? (
                    <Phone className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="text-xs font-semibold">
                    {cta.type === "PHONE_NUMBER" ? "Call Phone Number" : "Visit Website"}
                  </span>
                </div>
                {ctaButtons.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeCTA(idx)} className="h-7 w-7 text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Button Text</Label>
                <Input
                  value={cta.text}
                  onChange={(e) => updateCTA(idx, { text: e.target.value })}
                  placeholder="e.g. Shop Now"
                  maxLength={20}
                  className="h-9"
                />
              </div>

              {cta.type === "URL" ? (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Website URL</Label>
                  <Input
                    value={cta.url || ""}
                    onChange={(e) => updateCTA(idx, { url: e.target.value })}
                    placeholder="https://example.com/page/{{1}}"
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground">Use {"{{1}}"} for dynamic URL suffix</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</Label>
                  <Input
                    value={cta.phone_number || ""}
                    onChange={(e) => updateCTA(idx, { phone_number: e.target.value })}
                    placeholder="+1234567890"
                    className="h-9"
                  />
                </div>
              )}
            </div>
          ))}
          {ctaButtons.length < 2 && (
            <Button variant="outline" size="sm" onClick={addCTA} className="w-full dashed">
              <Plus className="h-4 w-4 mr-1" /> Add Button
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateButtons;
