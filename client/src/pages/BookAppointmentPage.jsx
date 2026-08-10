import React from 'react';
import { MultiStepBooking } from '../components/booking/MultiStepBooking';

export const BookAppointmentPage = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white">Book an Appointment</h1>
        <p className="text-xs text-slate-400 mt-1">Schedule a visit with our team of specialists</p>
      </div>

      <MultiStepBooking />
    </div>
  );
};
