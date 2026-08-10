import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getDashboardStats,
  getAppointmentsSummary,
  getServicePerformance,
  getStaffWorkload,
} from '../services/dashboardService';
import { StatCard } from '../components/common/StatCard';
import { Loader } from '../components/common/Loader';
import { formatCurrency } from '../utils/formatters';
import {
  Users,
  Briefcase,
  Layers,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [servicePerformance, setServicePerformance] = useState([]);
  const [staffWorkload, setStaffWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, summaryRes, serviceRes, workloadRes] = await Promise.all([
          getDashboardStats(),
          getAppointmentsSummary(),
          getServicePerformance(),
          getStaffWorkload(),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (summaryRes.success) setSummaryData(summaryRes.data);
        if (serviceRes.success) setServicePerformance(serviceRes.data);
        if (workloadRes.success) setStaffWorkload(workloadRes.data);
      } catch (error) {
        console.error('Error loading admin dashboard analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <Loader message="Compiling enterprise system analytics..." />;
  }

  const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#64748b', '#a855f7'];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            System Executive Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Schedulo Analytics & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time platform metrics, user demographics, staff load balancing, and financial summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/appointments"
            className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg transition-all"
          >
            Manage Appointments
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registered Users" value={stats?.totalUsers || 0} icon={Users} color="brand" />
        <StatCard title="Active Staff Members" value={stats?.totalStaff || 0} icon={Briefcase} color="cyan" />
        <StatCard title="Active Services" value={stats?.totalServices || 0} icon={Layers} color="amber" />
        <StatCard title="Estimated Revenue" value={formatCurrency(stats?.totalRevenue)} icon={DollarSign} color="emerald" />
      </div>

      {/* Analytics Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Status Breakdown */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-brand-400" /> Appointment Status Distribution
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{stats?.totalAppointments || 0} Total</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryData?.statusBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(summaryData?.statusBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart: Monthly Trends */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Monthly Appointment Volume
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summaryData?.monthlyTrends || []}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="Total" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="Completed" stroke="#10b981" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Row 2: Staff Workload & Service Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Staff Workload Distribution */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" /> Staff Workload Distribution
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffWorkload}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="totalAppointments" name="Total Assigned" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completedAppointments" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Services Performance List */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" /> Service Performance Ranking
            </h3>
            <Link to="/admin/services" className="text-xs font-bold text-brand-400 hover:underline">
              Manage Services →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Service Name</th>
                  <th className="py-2.5 px-3">Bookings</th>
                  <th className="py-2.5 px-3">Est. Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {servicePerformance.map((srv, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">{srv.name}</td>
                    <td className="py-3 px-3 font-semibold text-brand-400">{srv.bookingsCount} visits</td>
                    <td className="py-3 px-3 font-semibold text-emerald-400">{formatCurrency(srv.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
