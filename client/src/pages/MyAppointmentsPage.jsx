import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAppointments, updateAppointmentStatus } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { formatDate, formatTime } from '../utils/formatters';
import { Search, Filter, Calendar, Clock, XCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const MyAppointmentsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [selectedAppToCancel, setSelectedAppToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAppointments({
        search,
        status: statusFilter,
      });
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (error) {
      showToast('Error loading appointments list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppToCancel) return;
    setUpdating(true);
    try {
      const res = await updateAppointmentStatus(selectedAppToCancel._id, {
        status: 'CANCELLED',
        cancellationReason: cancellationReason || 'Cancelled by user',
      });
      if (res.success) {
        showToast('Appointment cancelled successfully', 'success');
        setCancelModalOpen(false);
        setSelectedAppToCancel(null);
        setCancellationReason('');
        fetchAppointments();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to cancel appointment', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {user?.role === 'staff' ? 'Assigned Appointment Requests' : 'My Appointments'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track appointment status, view details, and manage bookings
          </p>
        </div>

        {user?.role === 'user' && (
          <Link
            to="/book"
            className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/20 transition-all"
          >
            + Book Appointment
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff, service, or keyword..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors w-full md:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="RESCHEDULED">RESCHEDULED</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <Loader message="Fetching appointment records..." />
      ) : appointments.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <Clock className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Appointments Found</h3>
          <p className="text-xs text-slate-400">No appointments match your search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((app) => (
            <div
              key={app._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <span className="text-[11px] text-slate-500 font-mono">Ref: {app._id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <p className="text-[11px] text-slate-400">Service</p>
                    <p className="text-sm font-bold text-white">{app.service?.name}</p>
                    <p className="text-[11px] text-slate-400">{app.service?.category}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Assigned Staff</p>
                    <p className="text-sm font-bold text-white">{app.staff?.name}</p>
                    <p className="text-[11px] text-brand-400">{app.staff?.specialization}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Scheduled Date & Time</p>
                    <p className="text-sm font-bold text-white">{formatDate(app.appointmentDate)}</p>
                    <p className="text-[11px] font-semibold text-emerald-400">
                      {formatTime(app.startTime)} - {formatTime(app.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <Link
                  to={`/appointments/${app._id}`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  View Details
                </Link>

                {/* Cancel Button (User eligible for PENDING or CONFIRMED) */}
                {['PENDING', 'CONFIRMED'].includes(app.status) && (
                  <button
                    onClick={() => {
                      setSelectedAppToCancel(app);
                      setCancelModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal with Reason */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to cancel your scheduled visit for{' '}
            <strong className="text-white">{selectedAppToCancel?.service?.name}</strong> on{' '}
            <strong className="text-white">{formatDate(selectedAppToCancel?.appointmentDate)}</strong>?
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Cancellation Reason (Optional)
            </label>
            <input
              type="text"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g. Personal schedule conflict..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Back
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={updating}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl shadow-lg shadow-rose-600/20"
            >
              {updating ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
