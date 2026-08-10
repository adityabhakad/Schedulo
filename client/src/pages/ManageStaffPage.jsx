import React, { useState, useEffect } from 'react';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../services/staffService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Loader } from '../components/common/Loader';
import { Search, Plus, Edit2, Trash2, Clock, Calendar, UserCheck } from 'lucide-react';

export const ManageStaffPage = () => {
  const { showToast } = useToast();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Staff Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [isActive, setIsActive] = useState(true);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStaffList = async () => {
    setLoading(true);
    try {
      const res = await getStaff({ search, isActive: '' });
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (error) {
      showToast('Error loading staff roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStaffList();
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDepartment('');
    setSpecialization('');
    setBio('');
    setWorkStart('09:00');
    setWorkEnd('17:00');
    setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setIsActive(true);
    setSelectedStaff(null);
    setIsEditing(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (stf) => {
    setSelectedStaff(stf);
    setName(stf.name);
    setEmail(stf.email);
    setPhone(stf.phone);
    setDepartment(stf.department);
    setSpecialization(stf.specialization);
    setBio(stf.bio || '');
    setWorkStart(stf.workingHours?.start || '09:00');
    setWorkEnd(stf.workingHours?.end || '17:00');
    setWorkingDays(stf.workingDays || []);
    setIsActive(stf.isActive);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !department || !specialization) {
      showToast('Please fill out all required staff fields', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      email,
      phone,
      department,
      specialization,
      bio,
      workingHours: { start: workStart, end: workEnd },
      workingDays,
      isActive,
    };

    try {
      if (isEditing && selectedStaff) {
        const res = await updateStaff(selectedStaff._id, payload);
        if (res.success) {
          showToast('Staff member updated successfully', 'success');
        }
      } else {
        const res = await createStaff(payload);
        if (res.success) {
          showToast('Staff member created successfully', 'success');
        }
      }
      setModalOpen(false);
      fetchStaffList();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save staff record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    setSubmitting(true);
    try {
      const res = await deleteStaff(selectedStaff._id);
      if (res.success) {
        showToast('Staff member removed', 'success');
        setDeleteModalOpen(false);
        fetchStaffList();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete staff record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Staff</h1>
          <p className="text-xs text-slate-400 mt-1">Configure specialists, working hours, and availability</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by name, department, or specialization..."
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
      </div>

      {/* Staff Grid */}
      {loading ? (
        <Loader message="Loading staff details..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {staffList.map((stf) => (
            <div
              key={stf._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {stf.profileImage ? (
                      <img
                        src={stf.profileImage}
                        alt={stf.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-sm">
                        {stf.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white">{stf.name}</h3>
                      <p className="text-[11px] text-brand-400 font-semibold">{stf.specialization}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      stf.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {stf.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <p><strong>Department:</strong> {stf.department}</p>
                  <p><strong>Contact:</strong> {stf.email} | {stf.phone}</p>
                  <p><strong>Hours:</strong> {stf.workingHours?.start} - {stf.workingHours?.end}</p>
                  <p className="truncate"><strong>Days:</strong> {stf.workingDays?.join(', ')}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEdit(stf)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setSelectedStaff(stf);
                    setDeleteModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Edit/Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Staff Member' : 'Add Staff Member'}
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Phone *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Department *</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Specialization *</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Work Start</label>
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Work End</label>
              <input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {allDays.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    workingDays.includes(day)
                      ? 'bg-brand-600 text-white border-brand-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="staffActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700"
            />
            <label htmlFor="staffActiveCheck" className="text-xs text-slate-300 font-semibold">
              Active Specialist Profile
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl"
            >
              {isEditing ? 'Update Staff' : 'Create Staff'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Staff Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStaff}
        title="Delete Staff Member"
        message={`Are you sure you want to remove staff member '${selectedStaff?.name}'?`}
        confirmText="Delete Staff"
        isDanger={true}
        loading={submitting}
      />
    </div>
  );
};
