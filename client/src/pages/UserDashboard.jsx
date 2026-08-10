import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/dashboardService';
import { getAppointments } from '../services/appointmentService';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { formatDate, formatTime } from '../utils/formatters';
import {
  CalendarPlus,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  Sparkles,
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appRes] = await Promise.all([getDashboardStats(), getAppointments()]);
        if (statsRes.success) setStats(statsRes.data);
        if (appRes.success) setRecentAppointments(appRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching user dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loader message="Loading workspace dashboard..." />;
  }

  const nextApp = stats?.nextAppointment;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Client Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your schedule, book appointments, and monitor status updates in real-time.
          </p>
        </div>

        <Link
          to="/book"
          className="px-6 py-3.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-2xl shadow-xl shadow-brand-600/30 flex items-center gap-2.5 transition-all hover:scale-105 shrink-0 z-10"
        >
          <CalendarPlus className="w-4 h-4" /> Book New Appointment
        </Link>
      </div>

      {/* KPI Stats Grid (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          icon={CalendarCheck}
          color="brand"
          subtitle="Click to view all"
          onClick={() => navigate('/my-appointments')}
        />
        <StatCard
          title="Pending Confirmation"
          value={stats?.pending || 0}
          icon={Clock}
          color="amber"
          subtitle="Click to filter pending"
          onClick={() => navigate('/my-appointments?status=PENDING')}
        />
        <StatCard
          title="Confirmed Bookings"
          value={stats?.confirmed || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Click to filter confirmed"
          onClick={() => navigate('/my-appointments?status=CONFIRMED')}
        />
        <StatCard
          title="Completed Visits"
          value={stats?.completed || 0}
          icon={CheckCircle2}
          color="blue"
          subtitle="Click to filter completed"
          onClick={() => navigate('/my-appointments?status=COMPLETED')}
        />
      </div>

      {/* Next Upcoming Appointment Spotlight */}
      {nextApp ? (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-brand-500/30 relative overflow-hidden bg-gradient-to-r from-brand-950/40 to-slate-900">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Next Upcoming Visit
            </span>
            <StatusBadge status={nextApp.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-400">Service</p>
              <h3 className="text-lg font-bold text-white mt-1">{nextApp.service?.name}</h3>
              <p className="text-xs text-slate-400">{nextApp.service?.duration} mins • {nextApp.service?.category}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Specialist</p>
              <h3 className="text-lg font-bold text-white mt-1">{nextApp.staff?.name}</h3>
              <p className="text-xs text-brand-300">{nextApp.staff?.specialization}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Date & Time</p>
              <h3 className="text-lg font-bold text-white mt-1">{formatDate(nextApp.appointmentDate)}</h3>
              <p className="text-xs font-semibold text-emerald-400">{formatTime(nextApp.startTime)} - {formatTime(nextApp.endTime)}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
            <Link
              to={`/appointments/${nextApp._id}`}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View Full Booking Details <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 text-center border border-slate-800">
          <p className="text-xs text-slate-400">No upcoming appointments scheduled.</p>
          <Link to="/book" className="text-xs font-bold text-brand-400 hover:underline mt-1 inline-block">
            Schedule an appointment now →
          </Link>
        </div>
      )}

      {/* Recent Appointments Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Appointments</h2>
          <Link to="/my-appointments" className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Service</th>
                  <th className="px-6 py-3.5">Specialist</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No appointment records found.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{app.service?.name}</td>
                      <td className="px-6 py-4 text-slate-300">{app.staff?.name}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{formatDate(app.appointmentDate)}</div>
                        <div className="text-[11px] text-slate-400">{formatTime(app.startTime)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/appointments/${app._id}`}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-brand-400 hover:text-white hover:bg-brand-500/20 transition-all"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
