import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../../services/serviceService';
import { getStaff, getStaffAvailableSlots } from '../../services/staffService';
import { createAppointment } from '../../services/appointmentService';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { Loader } from '../common/Loader';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const MultiStepBooking = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [dayAvailable, setDayAvailable] = useState(true);
  const [slotMessage, setSlotMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Fetch Services & Staff on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [servicesRes, staffRes] = await Promise.all([getServices({ isActive: true }), getStaff({ isActive: true })]);
        if (servicesRes.success) setServices(servicesRes.data);
        if (staffRes.success) setStaffList(staffRes.data);
      } catch (error) {
        showToast('Failed to load initial booking data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Default selectedDate to tomorrow (YYYY-MM-DD format)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Fetch slots whenever staff, service, or date changes
  useEffect(() => {
    if (selectedStaff && selectedService && selectedDate) {
      const fetchSlots = async () => {
        setLoading(true);
        try {
          const res = await getStaffAvailableSlots(selectedStaff._id, selectedDate, selectedService._id);
          if (res.success) {
            setDayAvailable(res.dayAvailable);
            setSlotMessage(res.message || '');
            setAvailableSlots(res.slots || []);
            setSelectedSlot(null);
          }
        } catch (error) {
          setAvailableSlots([]);
          showToast(error.response?.data?.message || 'Error fetching available slots', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchSlots();
    }
  }, [selectedStaff, selectedService, selectedDate]);

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedSlot || !reason.trim()) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        service: selectedService._id,
        staff: selectedStaff._id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        reason: reason.trim(),
        notes: notes.trim(),
      };

      const response = await createAppointment(payload);
      if (response.success) {
        setBookingSuccess(response.data);
        showToast('Appointment booked successfully!', 'success');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to complete appointment booking';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && step === 1 && services.length === 0) {
    return <Loader message="Preparing appointment scheduler..." />;
  }

  if (bookingSuccess) {
    return (
      <div className="glass-panel rounded-3xl p-8 max-w-2xl mx-auto text-center border border-emerald-500/30 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-sm text-slate-300 mb-6">
          Your appointment request has been submitted and is pending staff confirmation.
        </p>

        <div className="bg-slate-900/80 rounded-2xl p-6 text-left border border-slate-800 space-y-3 mb-8">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400">Reference ID</span>
            <span className="text-xs font-mono font-bold text-brand-400">{bookingSuccess._id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Service</span>
            <span className="text-sm font-semibold text-white">{bookingSuccess.service?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Staff Member</span>
            <span className="text-sm font-semibold text-white">{bookingSuccess.staff?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Date & Time</span>
            <span className="text-sm font-semibold text-white">
              {formatDate(bookingSuccess.appointmentDate)} at {formatTime(bookingSuccess.startTime)}
            </span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/my-appointments')}
            className="px-6 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/20 transition-all"
          >
            View My Appointments
          </button>
          <button
            onClick={() => {
              setBookingSuccess(null);
              setStep(1);
              setSelectedService(null);
              setSelectedStaff(null);
              setSelectedSlot(null);
              setReason('');
              setNotes('');
            }}
            className="px-6 py-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'Service' },
    { num: 2, title: 'Staff' },
    { num: 3, title: 'Date & Time' },
    { num: 4, title: 'Details' },
    { num: 5, title: 'Review' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Multi-step Header Stepper */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center justify-between">
          {stepsList.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    step > s.num
                      ? 'bg-emerald-500 text-white'
                      : step === s.num
                      ? 'bg-brand-600 text-white ring-4 ring-brand-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-xs font-semibold hidden md:inline ${
                    step === s.num ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {idx < stepsList.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    step > s.num ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: SELECT SERVICE */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-white">Select Service</h2>
            <p className="text-xs text-slate-400 mt-1">Choose the service you wish to schedule</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => {
              const isSelected = selectedService?._id === srv._id;
              return (
                <div
                  key={srv._id}
                  onClick={() => setSelectedService(srv)}
                  className={`glass-card rounded-2xl p-5 cursor-pointer transition-all border relative ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/20 ring-2 ring-brand-500 shadow-xl shadow-brand-500/20 scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-brand-400 bg-brand-500/20 p-1 rounded-full border border-brand-500/40 animate-in zoom-in-95">
                      <CheckCircle2 className="w-5 h-5 text-brand-400 fill-brand-500/30" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2 pr-8">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-brand-400 border border-slate-700">
                      {srv.category}
                    </span>
                    <span className="text-sm font-extrabold text-white">{formatCurrency(srv.price)}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{srv.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{srv.description}</p>
                  <div className="flex items-center text-xs font-medium text-slate-400 pt-3 border-t border-slate-800/80">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                    <span>{srv.duration} Minutes Duration</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedService}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-all"
            >
              Continue to Staff Selection <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT STAFF */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-white">Select Staff Member</h2>
            <p className="text-xs text-slate-400 mt-1">Choose a specialist for {selectedService?.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {staffList.map((stf) => {
              const isSelected = selectedStaff?._id === stf._id;
              return (
                <div
                  key={stf._id}
                  onClick={() => setSelectedStaff(stf)}
                  className={`glass-card rounded-2xl p-5 cursor-pointer transition-all border text-center relative ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/20 ring-2 ring-brand-500 shadow-xl shadow-brand-500/20 scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-brand-400 bg-brand-500/20 p-1 rounded-full border border-brand-500/40 animate-in zoom-in-95">
                      <CheckCircle2 className="w-5 h-5 text-brand-400 fill-brand-500/30" />
                    </div>
                  )}
                  {stf.profileImage ? (
                    <img
                      src={stf.profileImage}
                      alt={stf.name}
                      className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 border border-slate-700 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-xl mx-auto mb-3">
                      {stf.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-white">{stf.name}</h3>
                  <p className="text-xs text-brand-400 font-semibold mb-1">{stf.specialization}</p>
                  <p className="text-[11px] text-slate-400 mb-3">{stf.department}</p>

                  <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span>Hours: {stf.workingHours?.start} - {stf.workingHours?.end}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedStaff}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-all"
            >
              Select Date & Time <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT DATE & TIME SLOT */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-white">Select Date & Time Slot</h2>
            <p className="text-xs text-slate-400 mt-1">Available time slots for {selectedStaff?.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Input */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-brand-400" /> Choose Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-3">
                Working Days: {selectedStaff?.workingDays?.join(', ')}
              </p>
            </div>

            {/* Time Slot Picker */}
            <div className="md:col-span-2 glass-card rounded-2xl p-5 border border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" /> Available Time Slots
              </label>

              {loading ? (
                <Loader message="Checking slot availability..." size="sm" />
              ) : !dayAvailable ? (
                <div className="p-6 text-center text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  {slotMessage || 'Staff member is not available on this date.'}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                  No open slots remaining for this date. Please choose another day.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-1">
                  {availableSlots.map((slot, i) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-500 ring-2 ring-brand-400 shadow-lg shadow-brand-600/30 scale-[1.05]'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-brand-500/50 hover:scale-[1.02]'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        {formatTime(slot.startTime)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!selectedSlot}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-all"
            >
              Provide Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REASON & NOTES */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-white">Reason & Notes</h2>
            <p className="text-xs text-slate-400 mt-1">Provide background information for your appointment</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Reason for Appointment *
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Annual physical exam / Architecture review session"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specify any relevant symptoms, pre-existing history, or special requests..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(5)}
              disabled={!reason.trim()}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-all"
            >
              Review Booking <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & CONFIRM */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-white">Review Appointment</h2>
            <p className="text-xs text-slate-400 mt-1">Confirm all details before submitting</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Selected Service
                </span>
                <p className="text-base font-bold text-white">{selectedService?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedService?.category} • {selectedService?.duration} mins</p>
                <p className="text-sm font-extrabold text-brand-400 mt-2">{formatCurrency(selectedService?.price)}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Assigned Staff Member
                </span>
                <p className="text-base font-bold text-white">{selectedStaff?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedStaff?.specialization} ({selectedStaff?.department})</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Scheduled Date & Time
                </span>
                <p className="text-base font-bold text-white">{formatDate(selectedDate)}</p>
                <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                  {formatTime(selectedSlot?.startTime)} - {formatTime(selectedSlot?.endTime)}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Reason for Visit
                </span>
                <p className="text-sm font-medium text-slate-200">{reason}</p>
                {notes && <p className="text-xs text-slate-400 mt-1 italic">"{notes}"</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleBookingSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              {submitting ? 'Submitting Request...' : 'Confirm & Schedule Appointment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
