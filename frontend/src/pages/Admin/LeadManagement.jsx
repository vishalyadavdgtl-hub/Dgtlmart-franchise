import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/Admin/Sidebar';
import { leadAPI, adminAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';


const STATUSES = [
  'new',
  'assigned',
  'in-progress',
  'approved',
  'converted',      // ✅ add
  'not-converted',  // ✅ add
  'closed',
  'lost'
];
const PRIORITIES = ['low', 'medium', 'high'];

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  closed: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
};

const emptyForm = { name: '', email: '', phone: '', requirement: '', priority: 'medium', notes: '', source: 'admin' };

export default function LeadManagement() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [total, setTotal] = useState(0);
  const [assignModal, setAssignModal] = useState(null);
  const [assignUsers, setAssignUsers] = useState([]);
  const [assignTarget, setAssignTarget] = useState({ id: '', model: '' });
  const [assignLoading, setAssignLoading] = useState(false);
  const [sharing, setSharing] = useState('');
  // 🔥 CONVERT STATES
const [convertModal, setConvertModal] = useState(null);
const [amount, setAmount] = useState('');
const [service, setService] = useState('');
const [commission, setCommission] = useState(20);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      const res = await leadAPI.getAll(params);
      setLeads(res.data.leads || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      showToast('Failed to load leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterPriority]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const fetchAssignUsers = async () => {
    try {
      const [refRes, frRes] = await Promise.all([
        adminAPI.getReferrals({ limit: 200 }),
        adminAPI.getFranchiseBuyers({ limit: 200 })
      ]);
      const refs = (refRes.data.referrals || []).map(u => ({ ...u, _modelType: 'ReferralPartner', label: `${u.fullName} (Referral)` }));
      const buyers = (frRes.data.buyers || []).map(u => ({ ...u, _modelType: 'ReferralPartner', label: `${u.fullName} (${u.role || 'Franchise'})` }));
      setAssignUsers([...refs, ...buyers]);
    } catch { /* ignore */ }
  };

  const openAssignModal = async (lead) => {
    setAssignModal(lead);
    setAssignTarget({ id: '', model: '' });
    await fetchAssignUsers();
  };

  const handleAssign = async () => {
    if (!assignTarget.id || !assignTarget.model) return showToast('Please select a user', 'error');
    setAssignLoading(true);
    try {
      await leadAPI.assign(assignModal._id, { assignedToId: assignTarget.id, assignedToModel: assignTarget.model });
      showToast('Lead assigned successfully', 'success');
      setAssignModal(null);
      fetchLeads();
    } catch (err) {
      showToast(err.response?.data?.error || 'Assignment failed', 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleFormChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openCreate = () => { setEditLead(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (lead) => {
    setEditLead(lead);
    setForm({ name: lead.name, email: lead.email, phone: lead.phone, requirement: lead.requirement, priority: lead.priority, notes: lead.notes || '', source: lead.source || 'admin' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.requirement) return showToast('All required fields must be filled', 'error');
    setSubmitting(true);
    try {
      if (editLead) {
        await leadAPI.update(editLead._id, form);
        showToast('Lead updated', 'success');
      } else {
        await leadAPI.create(form);
        showToast('Lead created', 'success');
      }
      setShowForm(false);
      fetchLeads();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error saving lead', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await leadAPI.delete(id);
      showToast('Lead deleted', 'success');
      fetchLeads();
    } catch { showToast('Delete failed', 'error'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await leadAPI.updateStatus(id, { status });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      showToast('Status updated', 'success');
    } catch { showToast('Update failed', 'error'); }
  };

  const approveLead = async (id) => {
  await leadAPI.approve(id, {
    sharingPercentage: sharing,
  });

  alert("Approved");
};

// convert model
const openConvertModal = (lead) => {
  setConvertModal(lead);
  setAmount('');
  setService('');
  setCommission(20); // ✅ default set
};

const handleConvert = async () => {
  await leadAPI.convert(convertModal._id, {
    amount,
    service
  });

  showToast("Lead Converted", "success");
  setConvertModal(null);
  fetchLeads();
};

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
              <p className="text-gray-500 mt-1">{total} total leads</p>
            </div>
            <button
              id="create-lead-btn"
              onClick={openCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Lead
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1 min-w-[180px]"
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {loading ? (
              <div className="text-center py-20 text-gray-400">Loading leads...</div>
            ) : leads.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 font-medium">No leads found</p>
                <p className="text-gray-400 text-sm">Create your first lead to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b text-left">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-gray-600">Contact</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">Requirement</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">Priority</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">Source</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">Status</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">Assigned To</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">Date</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map(lead => (
                      <tr key={lead._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{lead.name}</p>
                          <p className="text-gray-500 text-xs">{lead.email}</p>
                          <p className="text-gray-400 text-xs">{lead.phone}</p>
                        </td>
                        <td className="px-5 py-4 max-w-[200px]">
                          <p className="text-gray-700 truncate">{lead.requirement}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${priorityColors[lead.priority]}`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {lead.source === 'referral' ? (
                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap">Referral</span>
                          ) : lead.source === 'franchise' ? (
                            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap">Franchise</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap">{lead.source}</span>
                          )}
                          {lead.createdByName && (
                            <div className="text-[10px] text-gray-500 mt-1.5 font-medium whitespace-nowrap">By: {lead.createdByName}</div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={lead.status}
                            onChange={e => handleStatusChange(lead._id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:ring-1 focus:ring-indigo-400 cursor-pointer ${statusColors[lead.status]}`}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          {lead.assignedToName ? (
                            <span className="text-indigo-700 font-medium">{lead.assignedToName}</span>
                          ) : (
                            <button onClick={() => openAssignModal(lead)} className="text-xs text-indigo-600 hover:underline font-medium">
                              Assign →
                            </button>
                          )}
                          {lead.assignedToName && (
                            <button onClick={() => openAssignModal(lead)} className="ml-2 text-xs text-slate-400 hover:text-indigo-600">
                              (reassign)
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                        </td>
                       <td className="px-5 py-4">
  <div className="flex gap-2">

    <button
      onClick={() => openEdit(lead)}
      className="text-xs bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 px-2.5 py-1.5 rounded-lg font-medium transition"
    >
      Edit
    </button>

    <button
      onClick={() => handleDelete(lead._id)}
      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg font-medium transition"
    >
      Del
    </button>

    {/* 🔥 YEH ADD KARO */}
    {lead.status === "approved" && (
      <button
        onClick={() => openConvertModal(lead)}
        className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2.5 py-1.5 rounded-lg font-medium transition"
      >
        Convert
      </button>
    )}

  </div>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editLead ? 'Edit Lead' : 'Create New Lead'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full Name *', name: 'name', type: 'text', placeholder: 'Lead name' },
                { label: 'Email *', name: 'email', type: 'email', placeholder: 'email@example.com' },
                { label: 'Phone *', name: 'phone', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.type} name={f.name} value={form[f.name]}
                    onChange={handleFormChange} placeholder={f.placeholder} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirement *</label>
                <textarea name="requirement" value={form.requirement} onChange={handleFormChange} rows={3} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  placeholder="Describe the lead's requirements..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" value={form.priority} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input type="text" name="source" value={form.source} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="admin / website / referral" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleFormChange} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  placeholder="Additional notes about this lead..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-60">
                  {submitting ? 'Saving...' : (editLead ? 'Update Lead' : 'Create Lead')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">Assign Lead</h2>
              <button onClick={() => setAssignModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Assigning: <span className="font-semibold text-gray-800">{assignModal.name}</span></p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
            <select
              value={`${assignTarget.id}:${assignTarget.model}`}
              onChange={e => {
                const [id, model] = e.target.value.split(':');
                setAssignTarget({ id, model });
              }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value=":">-- Select a user --</option>
              {assignUsers.map(u => (
                <option key={u._id} value={`${u._id}:${u._modelType}`}>{u.label}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleAssign} disabled={assignLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-60">
                {assignLoading ? 'Assigning...' : 'Assign Lead'}
              </button>

          <div className="w-full mt-4 p-4 bg-gray-50 rounded-xl border">

  {/* Title */}
  <h3 className="text-sm font-semibold text-gray-700 mb-3">
    Approve Lead
  </h3>

  {/* Input */}
  <div className="mb-4">
    <label className="block text-xs font-medium text-gray-500 mb-1">
      Sharing Percentage
    </label>

    <div className="relative">
      <input
        type="number"
        placeholder="Enter %"
        value={sharing}
        onChange={(e) => setSharing(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 pr-8"
      />

      {/* % symbol */}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
        %
      </span>
    </div>
  </div>

  {/* Buttons */}
  <div className="flex gap-3">
    
    {/* Cancel */}
    <button
      onClick={() => setAssignModal(null)}
      className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
    >
      Cancel
    </button>

    {/* Approve */}
    <button
      onClick={() => approveLead(assignModal._id)}
      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold shadow-sm transition"
    >
      Approve Lead
    </button>

  </div>
</div>
            </div>
          </div>
        </div>
      )}

      {convertModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-full max-w-md">

      <h2 className="text-lg font-bold mb-4">Convert Lead</h2>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-3"
      />

     <input
  type="number"
  placeholder="Amount"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  className="w-full border px-3 py-2 rounded mb-2"
/>

<div className="mb-2">
  <label className="text-sm text-gray-500">Commission (%)</label>

  <input
    type="number"
    value={commission}
    onChange={(e) => setCommission(Number(e.target.value) || 20)}
    className="w-full border px-3 py-2 rounded mt-1"
  />
</div>

<p className="text-sm text-gray-700 mb-3">
  Earn: <span className="font-semibold text-green-700">
    ₹{amount ? (amount * commission) / 100 : 0}
  </span>
</p>

      <div className="flex gap-3">
        <button
          onClick={() => setConvertModal(null)}
          className="flex-1 border py-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleConvert}
          className="flex-1 bg-green-600 text-white py-2 rounded"
        >
          Convert
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}
