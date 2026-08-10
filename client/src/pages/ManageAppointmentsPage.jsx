import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from '../services/appointmentService';
import { getStaff } from '../services/staffService';
import { getServices } from '../services/serviceService';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Loader } from '../components/common/Loader';
import { formatDate, formatTime } from '../utils/formatters';
import { Search, Filter, Trash2, Edit, Calendar } from 'lucide-react';

export const ManageAppointmentsPage = () => {
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  // Delete State
  const [selectedApp, setSelectedApp] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchFilters = async () => {
    try {
      const [stfRes, srvRes] = await Promise.all([getStaff(), getServices()]);
      if (stfRes.success) setStaffMembers(stfRes.data);
      if (srvRes.success) setServicesList(srvRes.data);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const fetchAppointmentsList = async () => {
    setLoading(true);
    try {
      const res = await getAppointments({
        search,
        status: statusFilter,
        staff: staffFilter,
        service: serviceFilter,
      });
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (error) {
      showToast('Error loading appointments catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAppointmentsList();
  }, [statusFilter, staffFilter, serviceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointmentsList();
  };

  const handleStatusOverride = async (appId, newStatus) => {
    try {
      const res = await updateAppointmentStatus(appId, { status: newStatus });
      if (res.success) {
        showToast(`Status updated to ${newStatus}`, 'success');
        fetchAppointmentsList();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      const res = await deleteAppointment(selectedApp._id);
      if (res.success) {
        showToast('Appointment record deleted', 'success');
        setDeleteModalOpen(false);
        fetchAppointmentsList();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Appointments</h1>
          <p className="text-xs text-slate-400 mt-1">Master catalog of all enterprise bookings</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, staff, service, or reason..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="RESCHEDULED">RESCHEDULED</option>
          </select>

          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="">All Staff Specialists</option>
            {staffMembers.map((stf) => (
              <option key={stf._id} value={stf._id}>
                {stf.name}
              </option>
            ))}
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="">All Services</option>
            {servicesList.map((srv) => (
              <option key={srv._id} value={srv._id}>
                {srv.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <Loader message="Loading appointment records..." />
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Service</th>
                  <th className="px-6 py-3.5">Staff</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div>{app.user?.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{app.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-semibold">{app.service?.name}</td>
                    <td className="px-6 py-4 text-brand-400">{app.staff?.name}</td>
                    <td className="px-6 py-4">
                      <div>{formatDate(app.appointmentDate)}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        {formatTime(app.startTime)} - {formatTime(app.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusOverride(app._id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-brand-500 font-semibold"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="RESCHEDULED">RESCHEDULED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/appointments/${app._id}`}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Appointment Record"
        message={`Are you sure you want to permanently delete appointment reference '${selectedApp?._id}'?`}
        confirmText="Delete Record"
        isDanger={true}
        loading={submitting}
      />
    </div>
  );
};
