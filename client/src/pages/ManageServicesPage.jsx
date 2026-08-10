import React, { useState, useEffect } from 'react';
import { getServices, createService, updateService, deleteService } from '../services/serviceService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Loader } from '../components/common/Loader';
import { formatCurrency } from '../utils/formatters';
import { Search, Plus, Edit2, Trash2, Clock, Layers, DollarSign } from 'lucide-react';

export const ManageServicesPage = () => {
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Service Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(100);
  const [isActive, setIsActive] = useState(true);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchServicesList = async () => {
    setLoading(true);
    try {
      const res = await getServices({ search, isActive: '' });
      if (res.success) {
        setServices(res.data);
      }
    } catch (error) {
      showToast('Error loading services catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesList();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchServicesList();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setDuration(30);
    setCategory('');
    setPrice(100);
    setIsActive(true);
    setSelectedService(null);
    setIsEditing(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setSelectedService(srv);
    setName(srv.name);
    setDescription(srv.description);
    setDuration(srv.duration);
    setCategory(srv.category);
    setPrice(srv.price || 0);
    setIsActive(srv.isActive);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!name || !description || !duration || !category) {
      showToast('Please fill out all required service fields', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      description,
      duration: Number(duration),
      category,
      price: Number(price),
      isActive,
    };

    try {
      if (isEditing && selectedService) {
        const res = await updateService(selectedService._id, payload);
        if (res.success) {
          showToast('Service updated successfully', 'success');
        }
      } else {
        const res = await createService(payload);
        if (res.success) {
          showToast('New service added to catalog', 'success');
        }
      }
      setModalOpen(false);
      fetchServicesList();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save service', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    setSubmitting(true);
    try {
      const res = await deleteService(selectedService._id);
      if (res.success) {
        showToast('Service deleted', 'success');
        setDeleteModalOpen(false);
        fetchServicesList();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete service', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Services</h1>
          <p className="text-xs text-slate-400 mt-1">Configure service offerings, durations, and pricing structure</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" /> Add Service
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
              placeholder="Search services by title, category, or description..."
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

      {/* Services Grid */}
      {loading ? (
        <Loader message="Loading service catalog..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-brand-400 border border-slate-700">
                    {srv.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      srv.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {srv.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{srv.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{srv.description}</p>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-400" /> {srv.duration} Minutes
                  </span>
                  <span className="font-extrabold text-emerald-400 text-sm">{formatCurrency(srv.price)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Edit Service
                </button>
                <button
                  onClick={() => {
                    setSelectedService(srv);
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

      {/* Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Service Title *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Medical / Wellness / Advisory"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Price ($USD)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration (Minutes) *</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="srvActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700"
            />
            <label htmlFor="srvActiveCheck" className="text-xs text-slate-300 font-semibold">
              Active Service Offering
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
              {isEditing ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Service Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteService}
        title="Delete Service"
        message={`Are you sure you want to remove '${selectedService?.name}' from the catalog?`}
        confirmText="Delete Service"
        isDanger={true}
        loading={submitting}
      />
    </div>
  );
};
