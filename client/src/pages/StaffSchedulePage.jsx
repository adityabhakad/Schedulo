import React, { useState, useEffect } from 'react';
import { getAppointments } from '../services/appointmentService';
import { StatusBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { formatDate, formatTime } from '../utils/formatters';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';

export const StaffSchedulePage = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const res = await getAppointments({ date });
        if (res.success) {
          setAppointments(res.data);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [date]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Daily Schedule</h1>
          <p className="text-xs text-slate-400 mt-1">
            Agenda view for {formatDate(date)}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <Calendar className="w-4 h-4 text-brand-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <Loader message="Loading daily agenda..." />
      ) : appointments.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 text-slate-400 text-xs">
          No appointments scheduled on this date.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((app) => (
            <div
              key={app._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center font-mono font-bold text-xs text-emerald-400 shrink-0">
                  {formatTime(app.startTime)}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{app.service?.name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <User className="w-3.5 h-3.5 text-brand-400" /> Client: {app.user?.name} ({app.user?.phone || app.user?.email})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
