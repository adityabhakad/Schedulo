import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDashboardStats } from '../services/dashboardService';
import { getAppointments, updateAppointmentStatus } from '../services/appointmentService';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { formatDate, formatTime } from '../utils/formatters';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Calendar,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Smooth Scroll Section Refs
  const pendingSectionRef = useRef(null);
  const todaySectionRef = useRef(null);

  // Filtered Appointments Modal State (For Confirmed & Completed cards)
  const [filterModalStatus, setFilterModalStatus] = useState(null); // 'CONFIRMED' | 'COMPLETED' | null
  const [filteredList, setFilteredList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Status Action Modals State
  const [actionApp, setActionApp] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00');

  const [submitting, setSubmitting] = useState(false);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [statsRes, todayRes, pendingRes] = await Promise.all([
        getDashboardStats(),
        getAppointments({ date: todayStr }),
        getAppointments({ status: 'PENDING' }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (todayRes.success) setTodayAppointments(todayRes.data);
      if (pendingRes.success) setPendingRequests(pendingRes.data);
    } catch (error) {
      showToast('Error loading staff dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Fetch specific status appointments when stat card is clicked
  const openStatusModal = async (status) => {
    setFilterModalStatus(status);
    setModalLoading(true);
    try {
      const res = await getAppointments({ status });
      if (res.success) {
        setFilteredList(res.data);
      }
    } catch (err) {
      showToast(`Failed to load ${status.toLowerCase()} appointments`, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus, payload = {}) => {
    setSubmitting(true);
    try {
      const res = await updateAppointmentStatus(appId, {
        status: newStatus,
        ...payload,
      });
      if (res.success) {
        showToast(`Appointment status updated to ${newStatus}`, 'success');
        setRejectModalOpen(false);
        setRescheduleModalOpen(false);
        setActionApp(null);
        fetchStaffData();
        if (filterModalStatus) {
          openStatusModal(filterModalStatus);
        }
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update appointment status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading staff portal statistics..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            Staff Portal Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Overview of today's schedule, pending requests, and appointment actions.
          </p>
        </div>

        <Link
          to="/schedule"
          className="px-5 py-3 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all border border-slate-700"
        >
          View Full Daily Schedule
        </Link>
      </div>

      {/* Interactive KPI Stats (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Schedule"
          value={stats?.todayAppointments || 0}
          icon={CalendarCheck}
          color="brand"
          subtitle="Click to jump to agenda"
          onClick={() => todaySectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          icon={Clock}
          color="amber"
          subtitle="Click to review queue"
          onClick={() => pendingSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
        <StatCard
          title="Confirmed Appointments"
          value={stats?.confirmedAppointments || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Click to view all confirmed"
          onClick={() => openStatusModal('CONFIRMED')}
          isActive={filterModalStatus === 'CONFIRMED'}
        />
        <StatCard
          title="Completed Visits"
          value={stats?.completedAppointments || 0}
          icon={CheckCircle2}
          color="blue"
          subtitle="Click to view completed history"
          onClick={() => openStatusModal('COMPLETED')}
          isActive={filterModalStatus === 'COMPLETED'}
        />
      </div>

      {/* Pending Appointment Requests Action Queue */}
      <div ref={pendingSectionRef} className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Pending Action Requests ({pendingRequests.length})
          </h2>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 text-center border border-slate-800 text-xs text-slate-400">
            No pending appointment requests waiting for review.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((app) => (
              <div
                key={app._id}
                className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{app.user?.name}</span>
                    <span className="text-xs text-slate-400">({app.user?.phone || app.user?.email})</span>
                  </div>
                  <p className="text-xs font-semibold text-brand-400">{app.service?.name}</p>
                  <p className="text-xs text-slate-300">
                    <strong>Date & Time:</strong> {formatDate(app.appointmentDate)} at {formatTime(app.startTime)}
                  </p>
                  <p className="text-xs text-slate-400 italic">"Reason: {app.reason}"</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStatusChange(app._id, 'CONFIRMED')}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setActionApp(app);
                      setRescheduleDate(new Date().toISOString().split('T')[0]);
                      setRescheduleModalOpen(true);
                    }}
                    disabled={submitting}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => {
                      setActionApp(app);
                      setRejectModalOpen(true);
                    }}
                    disabled={submitting}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Schedule Agenda */}
      <div ref={todaySectionRef} className="space-y-4 scroll-mt-24">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-400" /> Today's Scheduled Agenda
        </h2>

        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Time Slot</th>
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Service</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {todayAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No appointments scheduled for today.
                    </td>
                  </tr>
                ) : (
                  todayAppointments.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {formatTime(app.startTime)} - {formatTime(app.endTime)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{app.user?.name}</td>
                      <td className="px-6 py-4 text-slate-300">{app.service?.name}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {app.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusChange(app._id, 'COMPLETED')}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Confirmed / Completed Card Details */}
      <Modal
        isOpen={Boolean(filterModalStatus)}
        onClose={() => setFilterModalStatus(null)}
        title={filterModalStatus === 'CONFIRMED' ? 'All Confirmed Appointments' : 'All Completed Visits History'}
        maxWidth="max-w-3xl"
      >
        {modalLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Loading {filterModalStatus?.toLowerCase()} appointments from MongoDB...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No {filterModalStatus?.toLowerCase()} appointments found.
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredList.map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{app.user?.name}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs font-semibold text-brand-400">{app.service?.name}</p>
                  <p className="text-xs text-slate-300">
                    <strong>Date & Time:</strong> {formatDate(app.appointmentDate)} ({formatTime(app.startTime)} - {formatTime(app.endTime)})
                  </p>
                  {app.reason && <p className="text-xs text-slate-400 italic">"Reason: {app.reason}"</p>}
                </div>

                {filterModalStatus === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusChange(app._id, 'COMPLETED')}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shrink-0"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Appointment Request"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Please provide a rejection reason for <strong className="text-white">{actionApp?.user?.name}</strong>.
          </p>
          <textarea
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Unforeseen staff emergency / Specialist unavailable..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleStatusChange(actionApp._id, 'REJECTED', {
                  rejectionReason,
                })
              }
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Reschedule booking for <strong className="text-white">{actionApp?.user?.name}</strong>:
          </p>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">New Date</label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">New Start Time</label>
            <input
              type="time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setRescheduleModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleStatusChange(actionApp._id, 'RESCHEDULED', {
                  newDate: rescheduleDate,
                  newStartTime: rescheduleTime,
                })
              }
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg"
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
