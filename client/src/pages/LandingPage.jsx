import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck2,
  Clock,
  ShieldCheck,
  BarChart3,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="space-y-24 py-12 px-6 max-w-7xl mx-auto">
      {/* HERO SECTION */}
      <section className="text-center space-y-8 pt-8 pb-12 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-brand-500/30 text-brand-300 text-xs font-semibold tracking-wide mb-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Next-Generation Enterprise Appointment Scheduling</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Smart Appointments.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Simple Management.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Empower your organization with automated staff scheduling, zero double-booking conflict resolution, real-time status tracking, and role-based operational insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-2xl shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            Book an Appointment <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 text-sm font-semibold text-slate-300 hover:text-white glass-panel hover:bg-slate-800 rounded-2xl transition-all"
          >
            Explore Platform Demo
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Precision</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            All-in-one architecture supporting seamless client bookings, staff agendas, and admin reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-8 space-y-4 border border-slate-800 hover:border-brand-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Conflict Prevention</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time backend validation algorithm prevents overlapping slots across staff schedules and user calendars.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 space-y-4 border border-slate-800 hover:border-brand-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Role-Based Authorization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated dashboards for Clients, Staff Members, and Administrators with strict server-side middleware access control.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 space-y-4 border border-slate-800 hover:border-brand-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Operational Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprehensive MongoDB aggregation pipelines rendering service utilization, workload balance, and revenue performance charts.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="glass-panel rounded-3xl p-8 md:p-12 border border-slate-800 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How Schedulo Works</h2>
          <p className="text-sm text-slate-400">Streamlined 4-step workflow from selection to completion.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Choose Service', desc: 'Browse active services by duration, category, and pricing.' },
            { step: '02', title: 'Select Staff & Time', desc: 'Pick your preferred staff member and verified open slot.' },
            { step: '03', title: 'Instant Booking', desc: 'Submit appointment details with automated conflict checking.' },
            { step: '04', title: 'Track Status', desc: 'Receive status updates as staff approve or complete your visit.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 relative">
              <span className="text-2xl font-extrabold text-brand-400/30 block mb-2">{item.step}</span>
              <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
