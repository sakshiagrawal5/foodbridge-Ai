import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import api from '../../services/api';
import {
  ShieldCheck,
  Users,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  X,
  Building2,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add NGO Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);
  const [ngoForm, setNgoForm] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
    registrationNumber: '',
    collectionCapacity: '150',
    mealDemand: '100',
    serviceRadiusKm: '15',
    city: 'Kanpur',
    address: '',
    verificationStatus: 'VERIFIED',
  });

  const fetchData = async () => {
    try {
      const [overviewRes, verifRes, auditRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/verifications'),
        api.get('/admin/audit-logs'),
      ]);

      if (overviewRes.data.success) setOverview(overviewRes.data.data);
      if (verifRes.data.success) setVerifications(verifRes.data.data);
      if (auditRes.data.success) setAuditLogs(auditRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (ngoId, status) => {
    try {
      await api.patch(`/admin/ngos/${ngoId}/verify`, {
        status,
        notes: `Admin manual review completed: ${status}`,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed.');
    }
  };

  const handleAddNgoSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAdd(true);
    setModalFeedback(null);

    try {
      const res = await api.post('/admin/ngos', ngoForm);
      if (res.data.success) {
        setModalFeedback({ type: 'success', text: 'NGO added successfully!' });
        setNgoForm({
          organizationName: '',
          contactName: '',
          email: '',
          phone: '',
          password: '',
          registrationNumber: '',
          collectionCapacity: '150',
          mealDemand: '100',
          serviceRadiusKm: '15',
          city: 'Kanpur',
          address: '',
          verificationStatus: 'VERIFIED',
        });
        setTimeout(() => {
          setShowAddModal(false);
          setModalFeedback(null);
        }, 1200);
        fetchData();
      }
    } catch (err) {
      setModalFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add NGO. Please verify details.',
      });
    } finally {
      setSubmittingAdd(false);
    }
  };

  return (
    <DashboardLayout
      title="Platform Governance & Security"
      subtitle="Oversee NGO accreditation, audit trails, and platform integrity"
    >
      {/* Top Action Bar with Add NGO Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">System Operations</h2>
          <p className="text-xs text-slate-500 font-medium">
            Manage verifications, onboard verified partners, and audit live logs
          </p>
        </div>
        <button
          onClick={() => {
            setModalFeedback(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 bg-[#0B3B24] hover:bg-[#114A2D] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>Add New NGO Partner</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Pending Verifications
          </span>
          <div className="text-2xl font-black text-amber-600">{overview?.pendingVerifications || 0}</div>
          <span className="text-[11px] text-gray-400">NGO applicants</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Registered Users
          </span>
          <div className="text-2xl font-black text-gray-900">{overview?.totalUsers || 0}</div>
          <span className="text-[11px] text-gray-400">Donors, NGOs, Staff</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Completed Rescues
          </span>
          <div className="text-2xl font-black text-[#0B3B24]">{overview?.completedRescues || 0}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Successfully delivered</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Active Rescues
          </span>
          <div className="text-2xl font-black text-blue-600">{overview?.activeRescues || 0}</div>
          <span className="text-[11px] text-gray-400">Underway</span>
        </div>
      </div>

      {/* NGO Accreditation Management Queue */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0B3B24]" />
            NGO Network & Verification Queue
          </h3>
          <span className="text-xs text-gray-500 font-semibold">
            Total {verifications.length} NGOs registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">NGO Name</th>
                <th className="pb-3 font-semibold">Contact Email</th>
                <th className="pb-3 font-semibold">Reg Number</th>
                <th className="pb-3 font-semibold">Capacity</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {verifications.map((ngo) => (
                <tr key={ngo._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 font-bold text-gray-900">{ngo.organizationName}</td>
                  <td className="py-3 text-gray-600">{ngo.userId?.email || ngo.contactDetails?.email || 'N/A'}</td>
                  <td className="py-3 font-mono text-gray-500">{ngo.registrationNumber || 'PENDING_DOCS'}</td>
                  <td className="py-3 text-gray-700">{ngo.collectionCapacity} portions</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ngo.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                      ngo.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {ngo.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {ngo.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerify(ngo._id, 'VERIFIED')}
                        className="px-3 py-1 bg-[#0B3B24] hover:bg-[#114A2D] text-white rounded-lg font-bold text-[11px] mr-2 transition"
                      >
                        Approve
                      </button>
                    )}
                    {ngo.verificationStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleVerify(ngo._id, 'REJECTED')}
                        className="px-3 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold text-[11px] transition"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-gray-700" />
          Immutable Audit Log Stream
        </h3>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 mr-2">{log.action}</span>
                <span className="text-gray-500">[{log.entityType}] {log.reason}</span>
              </div>
              <span className="text-[11px] font-mono text-gray-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: ADD NGO PARTNER                                         */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0B3B24] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Add NGO Partner
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Register and onboard an authorized food relief organization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification alert if any */}
            {modalFeedback && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
                  modalFeedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {modalFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{modalFeedback.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddNgoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annapurna Food Relief"
                    value={ngoForm.organizationName}
                    onChange={(e) => setNgoForm({ ...ngoForm, organizationName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={ngoForm.contactName}
                    onChange={(e) => setNgoForm({ ...ngoForm, contactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@annapurnatrust.org"
                    value={ngoForm.email}
                    onChange={(e) => setNgoForm({ ...ngoForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={ngoForm.phone}
                    onChange={(e) => setNgoForm({ ...ngoForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Registration No.
                  </label>
                  <input
                    type="text"
                    placeholder="NGO-UP-8921"
                    value={ngoForm.registrationNumber}
                    onChange={(e) => setNgoForm({ ...ngoForm, registrationNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Capacity (Portions)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={ngoForm.collectionCapacity}
                    onChange={(e) => setNgoForm({ ...ngoForm, collectionCapacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Service Radius (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ngoForm.serviceRadiusKm}
                    onChange={(e) => setNgoForm({ ...ngoForm, serviceRadiusKm: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="Civil Lines / Kalyanpur"
                    value={ngoForm.address}
                    onChange={(e) => setNgoForm({ ...ngoForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={ngoForm.city}
                    onChange={(e) => setNgoForm({ ...ngoForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave empty for default"
                    value={ngoForm.password}
                    onChange={(e) => setNgoForm({ ...ngoForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Verification Status
                  </label>
                  <select
                    value={ngoForm.verificationStatus}
                    onChange={(e) => setNgoForm({ ...ngoForm, verificationStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="VERIFIED">VERIFIED (Immediate Active)</option>
                    <option value="PENDING">PENDING (Requires review)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-5 py-2.5 rounded-xl bg-[#0B3B24] hover:bg-[#114A2D] text-white font-bold text-xs shadow-sm hover:shadow transition disabled:opacity-50"
                >
                  {submittingAdd ? 'Adding NGO...' : 'Save & Onboard NGO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
