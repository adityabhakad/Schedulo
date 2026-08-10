import React, { useState, useEffect } from 'react';
import {
  getAppointmentsSummary,
  getServicePerformance,
  getStaffWorkload,
} from '../services/dashboardService';
import { Loader } from '../components/common/Loader';
import { formatCurrency } from '../utils/formatters';
import { BarChart3, PieChart as PieIcon, TrendingUp, Layers, Users } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AnalyticsPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [servicePerformance, setServicePerformance] = useState([]);
  const [staffWorkload, setStaffWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, serviceRes, workloadRes] = await Promise.all([
          getAppointmentsSummary(),
          getServicePerformance(),
          getStaffWorkload(),
        ]);
        if (summaryRes.success) setSummaryData(summaryRes.data);
        if (serviceRes.success) setServicePerformance(serviceRes.data);
        if (workloadRes.success) setStaffWorkload(workloadRes.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader message="Generating system reports..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white">System Reports & Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Deep metrics breakdown for enterprise resource allocation</p>
      </div>

      {/* Staff Workload Detailed Chart */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-400" /> Staff Workload Breakdown
        </h3>

        <div className="h-72 w-full">
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
              <Bar dataKey="totalAppointments" name="Total Appointments" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completedAppointments" name="Completed Visits" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pendingAppointments" name="Pending Requests" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Service Performance Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" /> Service Revenue & Demand Metrics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Service Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Unit Price</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Total Bookings</th>
                <th className="px-6 py-3.5 text-right">Est. Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {servicePerformance.map((srv, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{srv.name}</td>
                  <td className="px-6 py-4 text-slate-400">{srv.category}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(srv.price)}</td>
                  <td className="px-6 py-4">{srv.duration} Mins</td>
                  <td className="px-6 py-4 font-bold text-brand-400">{srv.bookingsCount}</td>
                  <td className="px-6 py-4 text-right font-extrabold text-emerald-400">
                    {formatCurrency(srv.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
