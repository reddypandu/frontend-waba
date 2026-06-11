import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Trash2,
  FileUp,
  Download,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost, apiDelete, apiUpload } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Contacts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [newContact, setNewContact] = React.useState({
    name: "",
    phone: "",
    tags: "",
    opt_in_status: "opted_in",
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [csvFile, setCsvFile] = React.useState(null);
  const [deleteId, setDeleteId] = React.useState(null);
  const [selectedIds, setSelectedIds] = React.useState(new Set());

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: async () => {
      const data = await apiGet("/api/contacts");
      return data.contacts || [];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (contact) =>
      apiPost("/api/contacts", {
        name: contact.name,
        phone_number: contact.phone,
        tags: contact.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        opt_in_status: contact.opt_in_status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", user?.id] });
      setDialogOpen(false);
      setNewContact({
        name: "",
        phone: "",
        tags: "",
        opt_in_status: "opted_in",
      });
      toast({ title: "Contact added successfully" });
    },
    onError: (err) => {
      toast({
        title: "Failed to add contact",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", user?.id] });
      setDeleteId(null);
      toast({ title: "Contact deleted" });
    },
    onError: (err) => {
      toast({
        title: "Failed to delete",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", csvFile);
      return apiUpload("/api/contacts/import", formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts", user?.id] });
      setImportOpen(false);
      setCsvFile(null);
      toast({
        title: "CSV import complete",
        description: `${data.imported || 0} imported, ${data.failed || 0} failed`,
      });
    },
    onError: (err) =>
      toast({
        title: "Import failed",
        description: err.message,
        variant: "destructive",
      }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      return Promise.all(ids.map((id) => apiDelete(`/api/contacts/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", user?.id] });
      setSelectedIds(new Set());
      toast({ title: "Selected contacts deleted" });
    },
    onError: (err) => {
      toast({
        title: "Bulk delete failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const filteredContacts = contacts.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number?.includes(search),
  );

  const toggleSelectAll = (checked) => {
    const next = new Set(selectedIds);
    if (checked) {
      filteredContacts.forEach((c) => next.add(c._id));
    } else {
      filteredContacts.forEach((c) => next.delete(c._id));
    }
    setSelectedIds(next);
  };

  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExport = () => {
    const contactsToExport =
      selectedIds.size > 0
        ? contacts.filter((c) => selectedIds.has(c._id))
        : filteredContacts;

    if (contactsToExport.length === 0) {
      toast({ title: "No contacts to export" });
      return;
    }

    const csvRows = [
      ["Name", "Phone", "Email", "Status", "Tags"].join(","),
      ...contactsToExport.map((c) =>
        [
          `"${c.name || ""}"`,
          `"${c.phone_number || ""}"`,
          `"${c.email || ""}"`,
          `"${c.opt_in_status || ""}"`,
          `"${(c.tags || []).join(";")}"`,
        ].join(","),
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "contacts_export.csv";
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">{contacts.length} contacts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileUp className="mr-2 h-4 w-4" /> Bulk Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Import CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv">CSV file</Label>
                  <Input
                    id="csv"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Columns: phone, name, email, tags. Separate multiple tags
                    with semicolons.
                  </p>
                </div>
                <Button
                  className="w-full"
                  disabled={!csvFile || importMutation.isPending}
                  onClick={() => importMutation.mutate()}
                >
                  {importMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="mr-2 h-4 w-4" />
                  )}
                  Import Contacts
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />{" "}
            {selectedIds.size > 0
              ? `Export (${selectedIds.size})`
              : "Export All"}
          </Button>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm(`Delete ${selectedIds.size} contacts?`))
                  bulkDeleteMutation.mutate(Array.from(selectedIds));
              }}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedIds.size})
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contact</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addMutation.mutate(newContact);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                    placeholder="91 98765 43210"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newContact.tags}
                    onChange={(e) =>
                      setNewContact({ ...newContact, tags: e.target.value })
                    }
                    placeholder="VIP, Active"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opt_in_status">Opt-in Status</Label>
                  <Select
                    value={newContact.opt_in_status}
                    onValueChange={(value) =>
                      setNewContact({ ...newContact, opt_in_status: value })
                    }
                  >
                    <SelectTrigger id="opt_in_status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opted_in">Opted in</SelectItem>
                      <SelectItem value="opted_out">Opted out</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? "Adding..." : "Add Contact"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          className="pl-9 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-10" />
              <p>
                {search
                  ? "No matching contacts found."
                  : "No contacts found. Add your first contact or import a CSV!"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-sm">
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          className="rounded border-border accent-primary cursor-pointer"
                          checked={
                            filteredContacts.length > 0 &&
                            filteredContacts.every((c) =>
                              selectedIds.has(c._id),
                            )
                          }
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Opt-in
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Tags
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((c) => (
                      <tr
                        key={c._id}
                        className="border-b border-border last:border-0 hover:bg-secondary/20"
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="rounded border-border accent-primary cursor-pointer"
                            checked={selectedIds.has(c._id)}
                            onChange={() => toggleSelectOne(c._id)}
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {c.name}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {c.phone_number}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              c.opt_in_status === "opted_out"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[10px] capitalize"
                          >
                            {(c.opt_in_status || "opted_in").replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {(c.tags || []).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px]"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary"
                              onClick={() =>
                                navigate(
                                  `/dashboard/inbox?phone=${c.phone_number}`,
                                )
                              }
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => setDeleteId(c._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this contact and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contacts;
