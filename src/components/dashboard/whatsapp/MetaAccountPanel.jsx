import * as React from "react";
import {
  Building2,
  User,
  Smartphone,
  FileText,
  BadgeCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

const templateStatusColor = {
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
};

const MetaAccountPanel = ({ userId }) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["meta-account-snapshot", userId || "self"],
    queryFn: () =>
      apiGet(
        userId
          ? `/api/meta/snapshot?user_id=${userId}`
          : "/api/meta/snapshot"
      ),
    staleTime: 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardContent className="p-6 flex items-center justify-center text-muted-foreground text-sm">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin text-primary/50" />
          Loading Meta account details...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Couldn't load Meta account info</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-3 mt-1">
          <span className="text-xs">{error?.message || "Please try again."}</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const me = data?.me;
  const business = Array.isArray(data?.businesses)
    ? data?.businesses?.[0]
    : data?.businesses?.data?.[0];
  const waba = Array.isArray(data?.wabas)
    ? data?.wabas?.[0]
    : data?.wabas?.data?.[0];
  const phoneNumbers = Array.isArray(data?.phoneNumbers)
    ? data?.phoneNumbers
    : data?.phoneNumbers?.data || [];
  const templates = Array.isArray(data?.templates)
    ? data?.templates
    : data?.templates?.data || [];

  const templateCounts = templates.reduce(
    (acc, t) => {
      const statusKey = t.status?.toUpperCase() || "PENDING";
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    },
    { APPROVED: 0, REJECTED: 0, PENDING: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">
          Meta Business Manager
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Meta Account Card */}
        <Card className="shadow-sm border-border/50 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <User className="h-4 w-4 text-primary" /> Meta Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Name" value={me?.name} />
            <Row label="User ID" value={me?.id} mono />
          </CardContent>
        </Card>

        {/* Business Card */}
        <Card className="shadow-sm border-border/50 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Building2 className="h-4 w-4 text-primary" /> Business
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {business ? (
              <>
                <Row label="Name" value={business.name} />
                <Row label="Business ID" value={business.id} mono />
                <Row
                  label="Verification Status"
                  value={
                    <Badge
                      variant="outline"
                      className={
                        business.verification_status?.toLowerCase() === "verified"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 capitalize font-bold text-[10px]"
                          : "capitalize font-bold text-[10px]"
                      }
                    >
                      {business.verification_status || "unverified"}
                    </Badge>
                  }
                />
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                No business found on this account.
              </p>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Business Account Card (Full Width) */}
        <Card className="shadow-sm border-border/50 rounded-xl sm:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Smartphone className="h-4 w-4 text-primary" /> WhatsApp Business Account
            </CardTitle>
            <CardDescription className="text-xs">
              {waba?.name ? `${waba.name} (WABA ID: ${waba.id})` : waba?.id ? `WABA ID: ${waba.id}` : "No WABA found."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {waba ? (
              <div className="space-y-3">
                <Row label="WABA ID" value={waba.id} mono />
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Phone Numbers
                  </p>
                  {phoneNumbers.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No phone numbers registered.
                    </p>
                  ) : (
                    phoneNumbers.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/30 gap-2"
                      >
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {p.display_phone_number || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {p.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {p.quality_rating && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                              Quality: {p.quality_rating}
                            </Badge>
                          )}
                          <Badge
                            className={
                              p.code_verification_status === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold"
                                : "bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold"
                            }
                          >
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            {p.code_verification_status || "PENDING"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No WABA associated with this account.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Message Templates Card (Full Width) */}
        <Card className="shadow-sm border-border/50 rounded-xl sm:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <FileText className="h-4 w-4 text-primary" /> Message Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Badge className={`${templateStatusColor.APPROVED} font-bold text-[10px]`}>
                Approved: {templateCounts.APPROVED || 0}
              </Badge>
              <Badge className={`${templateStatusColor.PENDING} font-bold text-[10px]`}>
                Pending: {templateCounts.PENDING || 0}
              </Badge>
              <Badge className={`${templateStatusColor.REJECTED} font-bold text-[10px]`}>
                Rejected: {templateCounts.REJECTED || 0}
              </Badge>
            </div>
            {templates.length === 0 ? (
              <p className="text-xs text-muted-foreground pt-1">
                No templates found.
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 pt-1">
                {templates.map((t) => {
                  const statusKey = t.status?.toUpperCase() || "PENDING";
                  const badgeStyle = templateStatusColor[statusKey] || "bg-muted text-muted-foreground";
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-border/40 bg-card hover:bg-muted/20 transition-colors"
                    >
                      <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
                        {t.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {t.category && (
                          <Badge variant="outline" className="text-[9px] capitalize font-medium">
                            {t.category.toLowerCase()}
                          </Badge>
                        )}
                        <Badge className={`${badgeStyle} text-[9px] font-bold`}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Row = ({ label, value, mono }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
      {label}
    </span>
    {typeof value === "object" && value !== null ? (
      value
    ) : (
      <span
        className={`text-sm font-bold text-foreground truncate ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value ?? "—"}
      </span>
    )}
  </div>
);

export default MetaAccountPanel;
