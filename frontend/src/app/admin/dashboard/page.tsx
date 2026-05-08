"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FileText, Calendar, Users, DollarSign, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import DashboardLoading from "./loading";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [statsRes, revenueRes] = await Promise.all([
        fetchApi("/api/dashboard/stats"),
        fetchApi("/api/admin/revenue-chart?months=6")
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (revenueRes.data?.data) setRevenue(revenueRes.data.data);
      
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <DashboardLoading />;
  if (!stats) return <div>Failed to load dashboard data.</div>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-2 border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          <p className="text-accent font-bold">PKR {payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading text-white">Dashboard Overview</h1>
        <p className="text-muted">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Quotes" 
          value={stats.total_quotes} 
          icon={<FileText className="w-6 h-6" />} 
          badge={stats.pending_quotes > 0 ? <span className="bg-danger text-white text-xs px-2 py-1 rounded-full ml-2">{stats.pending_quotes} Pending</span> : null}
        />
        <StatCard 
          title="Total Events" 
          value={stats.total_events} 
          icon={<Calendar className="w-6 h-6" />} 
          badge={stats.upcoming_events > 0 ? <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">{stats.upcoming_events} Upcoming</span> : null}
        />
        <StatCard 
          title="Total Clients" 
          value={stats.total_clients} 
          icon={<Users className="w-6 h-6" />} 
        />
        <StatCard 
          title="Revenue (Month)" 
          value={stats.revenue_this_month} 
          prefix="Rs. "
          icon={<DollarSign className="w-6 h-6" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Revenue (Last 6 Months)</h2>
            </div>
            <div className="h-72 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <BarChart data={revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6B6B6B", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B6B6B", fontSize: 12 }} tickFormatter={(val) => `PKR ${(val/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                  <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recent Quotes */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Recent Quotes</h2>
              <Link href="/admin/quotes" className="text-sm text-accent hover:text-accent-light flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-2/50 text-muted text-sm border-b border-white/5">
                    <th className="px-6 py-3 font-medium">Company</th>
                    <th className="px-6 py-3 font-medium">Event Type</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recent_quotes?.length > 0 ? (
                    stats.recent_quotes.map((quote: any) => (
                      <tr key={quote.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{quote.client?.company_name || '-'}</td>
                        <td className="px-6 py-4 text-muted">{quote.event_type || "-"}</td>
                        <td className="px-6 py-4 text-muted">{new Date(quote.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><Badge status={quote.status} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted">No recent quotes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <Card className="flex flex-col h-[calc(100%-2rem)]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
              <Link href="/admin/events" className="text-sm text-accent hover:text-accent-light">
                View All
              </Link>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {stats.upcoming_events_list?.length > 0 ? (
                stats.upcoming_events_list.map((event: any, i: number) => (
                  <div key={event.id} className="relative pl-6 pb-6 border-l border-white/10 last:pb-0 last:border-transparent">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-surface"></div>
                    <div className="text-xs text-accent font-bold mb-1">
                      {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <h3 className="text-white font-bold mb-1">{event.title}</h3>
                    <p className="text-sm text-muted mb-2">{event.venue_address}</p>
                    <Badge status={event.status} />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-8">No upcoming events.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
