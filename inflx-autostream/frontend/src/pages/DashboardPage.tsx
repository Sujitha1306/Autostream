import { motion } from 'framer-motion';
import { Users, UserCheck, Trophy, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import StatsCard from '../components/dashboard/StatsCard';
import PlatformChart from '../components/dashboard/PlatformChart';
import LeadsTable from '../components/dashboard/LeadsTable';

export default function DashboardPage() {
  const { data, isLoading, refetch, isFetching } = useLeads();

  const topPlatform = data?.platforms
    ? Object.entries(data.platforms).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    : '—';

  const conversionRate = data?.total
    ? Math.round((data.total / Math.max(data.total * 3, 1)) * 100)
    : 0;

  // CSV export
  const handleExport = () => {
    if (!data?.leads?.length) return;
    const headers = ['Name', 'Email', 'Platform', 'Captured At', 'Session ID', 'Turns'];
    const rows = data.leads.map(l =>
      [l.name, l.email, l.platform, l.captured_at, l.session_id, l.turn_count].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inflx-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pt-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-3xl font-bold"
            >
              Leads Dashboard
            </motion.h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time intelligence on all captured leads · Auto-refreshes every 10s
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={!data?.total}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2A2A3A] bg-[#111118] text-slate-400 hover:text-white hover:border-indigo-500/40 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => refetch()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 text-sm transition-all`}
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Leads"
            value={data?.total ?? 0}
            subtitle="All time captures"
            icon={Users}
            color="indigo"
          />
          <StatsCard
            title="Today"
            value={data?.total_today ?? 0}
            subtitle="Leads captured today"
            icon={UserCheck}
            color="emerald"
            trend={{ value: data?.total_today ?? 0, label: 'new today' }}
          />
          <StatsCard
            title="Top Platform"
            value={topPlatform}
            subtitle="Most common creator platform"
            icon={Trophy}
            color="violet"
          />
          <StatsCard
            title="Avg Turns to Convert"
            value={
              data?.leads?.length
                ? Math.round(data.leads.reduce((s, l) => s + l.turn_count, 0) / data.leads.length)
                : '—'
            }
            subtitle="Messages before capture"
            icon={TrendingUp}
            color="amber"
          />
        </div>

        {/* Charts + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-1">
            <PlatformChart platforms={data?.platforms ?? {}} total={data?.total ?? 0} />
          </div>
          <div className="lg:col-span-2">
            {/* Intent timeline — simple visual summary */}
            <div className="p-5 rounded-2xl bg-[#111118] border border-[#2A2A3A] h-full">
              <h3 className="text-white font-semibold mb-1">Recent Activity</h3>
              <p className="text-slate-500 text-xs mb-5">Latest leads at a glance</p>
              {data?.leads?.length ? (
                <div className="space-y-2">
                  {[...data.leads].reverse().slice(0, 6).map((lead, i) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#1A1A24] border border-[#2A2A3A]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{lead.name}</p>
                          <p className="text-slate-500 text-xs">{lead.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300 text-xs">{lead.platform}</p>
                        <p className="text-slate-600 text-xs">{lead.turn_count} turns</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-600">
                  <span className="text-3xl mb-2">🌱</span>
                  <p className="text-sm">No activity yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Leads Table */}
        <LeadsTable leads={data?.leads ?? []} />

      </div>
    </div>
  );
}
