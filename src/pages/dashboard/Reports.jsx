import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Send, CheckCircle, Eye, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Reports = () => {
  const [dateRange, setDateRange] = React.useState("30");

  const data = [
    { name: "Mon", sent: 400, delivered: 240, read: 180 },
    { name: "Tue", sent: 300, delivered: 139, read: 90 },
    { name: "Wed", sent: 200, delivered: 980, read: 700 },
    { name: "Thu", sent: 278, delivered: 390, read: 200 },
    { name: "Fri", sent: 189, delivered: 480, read: 350 },
    { name: "Sat", sent: 239, delivered: 380, read: 250 },
    { name: "Sun", sent: 349, delivered: 430, read: 310 },
  ];

  const pieData = [
    { name: "Delivered", value: 1240, color: "#10b981" },
    { name: "Read", value: 840, color: "#3b82f6" },
    { name: "Failed", value: 120, color: "#ef4444" },
  ];

  const stats = [
    { title: "Total Sent", value: "2,405", icon: Send, color: "text-blue-500" },
    { title: "Delivered", value: "98.2%", icon: CheckCircle, color: "text-green-500" },
    { title: "Read Rate", value: "65.4%", icon: Eye, color: "text-purple-500" },
    { title: "Failed", value: "45", icon: XCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Reports</h1>
          <p className="text-muted-foreground">Real-time insights into your message performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{s.title}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Volume Trend</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Engagement Breakdown</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
