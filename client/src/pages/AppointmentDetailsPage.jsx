import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAppointmentById, updateAppointmentStatus } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

export const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await getAppointmentById(id);
      if (res.success) {
        setAppointment(res.data);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error loading appointment details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await updateAppointmentStatus(id, { status: newStatus });
      if (res.success) {
        showToast(`Status updated to ${newStatus}`, 'success');
        fetchDetails();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  if (loading) {
    return <Loader message="Fetching appointment records..." />;
  }

  if (!appointment) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        Appointment record not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          to="/my-appointments"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Appointments
        </Link>
        <span className="text-xs font-mono font-bold text-slate-500">ID: {appointment._id}</span>
      </div>

      {/* Main Details Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{appointment.service?.name}</h1>
              <StatusBadge status={appointment.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Category: {appointment.service?.category} • Duration: {appointment.service?.duration} mins
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Service Fee</span>
            <span className="text-xl font-extrabold text-emerald-400">
              {formatCurrency(appointment.service?.price)}
            </span>
          </div>
        </div>

        {/* Date & Time Highlight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Scheduled Date</p>
              <p className="text-sm font-bold text-white">{formatDate(appointment.appointmentDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Scheduled Time Window</p>
              <p className="text-sm font-bold text-emerald-400">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </p>
            </div>
          </div>
        </div>

        {/* People Involved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" /> Client Profile
            </h3>
            <p className="text-base font-bold text-white">{appointment.user?.name}</p>
            <p className="text-xs text-slate-300">Email: {appointment.user?.email}</p>
            <p className="text-xs text-slate-300">Phone: {appointment.user?.phone || 'N/A'}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" /> Specialist Profile
            </h3>
            <p className="text-base font-bold text-white">{appointment.staff?.name}</p>
            <p className="text-xs text-brand-300">{appointment.staff?.specialization}</p>
            <p className="text-xs text-slate-300">Dept: {appointment.staff?.department}</p>
          </div>
        </div>

        {/* Reason & Notes */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Reason for Visit</h4>
            <p className="text-sm text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {appointment.reason}
            </p>
          </div>

          {appointment.notes && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Additional Notes</h4>
              <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                "{appointment.notes}"
              </p>
            </div>
          )}

          {appointment.cancellationReason && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <strong>Cancellation Reason:</strong> {appointment.cancellationReason}
            </div>
          )}

          {appointment.rejectionReason && (
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs">
              <strong>Rejection Reason:</strong> {appointment.rejectionReason}
            </div>
          )}
        </div>

        {/* Quick Action Buttons for Staff/Admin */}
        {(user?.role === 'staff' || user?.role === 'admin') && ['PENDING', 'CONFIRMED'].includes(appointment.status) && (
          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            {appointment.status === 'PENDING' && (
              <button
                onClick={() => handleStatusUpdate('CONFIRMED')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl"
              >
                Approve Request
              </button>
            )}
            {appointment.status === 'CONFIRMED' && (
              <button
                onClick={() => handleStatusUpdate('COMPLETED')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
              >
                Mark Completed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
