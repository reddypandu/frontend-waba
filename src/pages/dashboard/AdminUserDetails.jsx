import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Phone, CheckCircle2, ShieldAlert, CreditCard, Building2, MessageSquare, BarChart } from "lucide-react";

const AdminUserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-user-details', id],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || 'Failed to fetch user details');
            }
            return res.json();
        }
    });

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading user details...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center space-y-4">
                <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
                <p className="text-xl font-bold">{error.message}</p>
                <Button onClick={() => navigate('/dashboard/admin')}>Back to Admin Panel</Button>
            </div>
        );
    }

    const { user, waAccount, business, stats, transactions } = data;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/admin')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        User Details
                        {user.role === 'admin' && <Badge variant="destructive">Admin</Badge>}
                    </h1>
                    <p className="text-sm text-muted-foreground">Manage and view user activity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Profile Details */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {user.full_name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                            <CardTitle>{user.full_name || "—"}</CardTitle>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                            <span className="text-muted-foreground">Subscription</span>
                            <Badge variant="outline" className="capitalize">{user.subscription?.plan || "free"}</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                            <span className="text-muted-foreground">Wallet Balance</span>
                            <span className="font-bold">₹{(user.wallet?.balance || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                            <span className="text-muted-foreground">Joined</span>
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* WhatsApp & Business */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Phone className="w-5 h-5 text-emerald-500" />
                            WhatsApp Setup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {waAccount?.phone_number_id ? (
                            <>
                                <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                                    <span className="text-muted-foreground">Status</span>
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> Connected
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                                    <span className="text-muted-foreground">Phone Number</span>
                                    <span>{waAccount.phone_number || 'Linked'}</span>
                                </div>
                                {business && (
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                                        <span className="text-muted-foreground">Business Name</span>
                                        <span>{business.name || '—'}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg border-border">
                                No WhatsApp account connected
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Usage Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-primary" />
                            Usage Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                            <span className="text-muted-foreground">Total Contacts</span>
                            <span className="font-bold">{stats.contacts}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                            <span className="text-muted-foreground">Campaigns Sent</span>
                            <span className="font-bold">{stats.campaigns}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                            <span className="text-muted-foreground">Templates Used</span>
                            <span className="font-bold">{stats.templates}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Description</th>
                                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions?.map((t) => (
                                    <tr key={t._id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                                        <td className="py-3 px-4">{new Date(t.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant={t.type === 'credit' ? "outline" : "secondary"} className={t.type === 'credit' ? "text-emerald-500 border-emerald-500/30" : ""}>
                                                {t.type}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">{t.description}</td>
                                        <td className={`py-3 px-4 text-right font-medium ${t.type === 'credit' ? 'text-emerald-500' : 'text-destructive'}`}>
                                            {t.type === 'credit' ? '+' : '-'}₹{(t.amount || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {!transactions?.length && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-muted-foreground">No recent transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUserDetails;
