'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, UserPlus, Trash2, Search, Plus, X, Check,
  ChevronRight, Mail, Calendar, Shield, Eye, AlertTriangle,
  Layers, UserCheck, Clock
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { groupAPI } from '../../../utils/api';

/* ─── Keyframe Styles ─── */
const Styles = () => (
  <style>{`
    @keyframes floatA { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-26px) scale(1.03)} }
    @keyframes floatB { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(20px) scale(0.97)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes scaleIn { from{opacity:0;transform:scale(.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes rowIn  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    @keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.18)} 50%{box-shadow:0 0 0 8px rgba(99,102,241,0)} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes toastIn { from{opacity:0;transform:translateY(-10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

    .fu-1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .04s both}
    .fu-2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .11s both}
    .fu-3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .18s both}
    .fu-4{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .25s both}

    .stat-card{transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s ease}
    .stat-card:hover{transform:translateY(-5px)}

    .group-row{transition:background .16s ease,transform .16s ease}
    .group-row:hover{background:rgba(238,242,255,.55)!important}

    .action-btn{transition:all .2s cubic-bezier(.22,1,.36,1)}
    .action-btn:hover{transform:translateY(-2px)}

    .modal-overlay{animation:fadeIn .2s ease both}
    .modal-box{animation:scaleIn .28s cubic-bezier(.22,1,.36,1) both}

    .student-card{transition:all .2s cubic-bezier(.22,1,.36,1)}
    .student-card:hover{transform:translateY(-1px)}

    .shimmer-bar{
      background:linear-gradient(90deg,#e2e8f0 25%,#f8fafc 50%,#e2e8f0 75%);
      background-size:200% 100%;
      animation:shimmer 1.5s infinite;
    }

    .search-input:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important}
    .textarea-el:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important}
    .form-input:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important}
    .toast-anim{animation:toastIn .3s cubic-bezier(.22,1,.36,1) both}
  `}</style>
);

/* ─── Floating Orbs ─── */
const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
    <div style={{position:'absolute',top:'-8%',right:'-4%',width:460,height:460,background:'radial-gradient(circle,rgba(99,102,241,.11) 0%,transparent 70%)',borderRadius:'50%',animation:'floatA 15s ease-in-out infinite'}}/>
    <div style={{position:'absolute',bottom:'8%',left:'-6%',width:370,height:370,background:'radial-gradient(circle,rgba(59,130,246,.09) 0%,transparent 70%)',borderRadius:'50%',animation:'floatB 19s ease-in-out infinite'}}/>
    <div style={{position:'absolute',top:'42%',left:'36%',width:260,height:260,background:'radial-gradient(circle,rgba(168,85,247,.06) 0%,transparent 70%)',borderRadius:'50%',animation:'floatA 23s ease-in-out infinite reverse'}}/>
  </div>
);

/* ─── Glass Card ─── */
const GlassCard = ({ children, className = '', style = {} }) => (
  <div className={`bg-white/75 backdrop-blur-xl rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(99,102,241,.07)] ${className}`} style={style}>
    {children}
  </div>
);

/* ─── Toast ─── */
const Toast = ({ type, message, onClose }) => {
  const isErr = type === 'error';
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed top-5 right-5 z-[9999] toast-anim">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl ${isErr ? 'bg-red-50/95 border-red-200' : 'bg-emerald-50/95 border-emerald-200'}`}>
        <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 ${isErr ? 'bg-red-100' : 'bg-emerald-100'}`}>
          {isErr
            ? <X size={13} className="text-red-500" />
            : <Check size={13} className="text-emerald-600" />}
        </div>
        <p className={`text-sm font-700 ${isErr ? 'text-red-700' : 'text-emerald-700'}`}>{message}</p>
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600"><X size={13} /></button>
      </div>
    </div>
  );
};

/* ─── Confirm Dialog ─── */
const ConfirmDialog = ({ title, desc, onConfirm, onCancel }) => (
  <div className="modal-overlay fixed inset-0 z-[998] flex items-center justify-center p-4" style={{background:'rgba(15,23,42,.45)',backdropFilter:'blur(6px)'}}>
    <div className="modal-box bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200">
      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={22} className="text-red-500" />
      </div>
      <h3 className="text-base font-800 text-slate-900 text-center mb-1">{title}</h3>
      <p className="text-sm text-slate-500 text-center mb-6 font-500">{desc}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-700 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-700 text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all">Delete</button>
      </div>
    </div>
  </div>
);

/* ─── Avatar ─── */
const Avatar = ({ name, size = 10, gradient = 'from-indigo-500 to-purple-600' }) => (
  <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
    <span className="text-white font-800 text-sm">{(name || '?')[0].toUpperCase()}</span>
  </div>
);

/* ─── Member Status Badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    accepted: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    pending:  'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
  };
  return (
    <span className={`text-[10px] font-800 uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {status === 'accepted' ? <UserCheck size={9}/> : <Clock size={9}/>}
      {status}
    </span>
  );
};

/* ════════════════════════════════════════
   Main Component
════════════════════════════════════════ */
export default function GroupManagementPage() {
  const router = useRouter();
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);

  /* modals */
  const [createOpen, setCreateOpen]         = useState(false);
  const [addStudentsOpen, setAddStudentsOpen] = useState(false);
  const [membersOpen, setMembersOpen]       = useState(false);
  const [confirmOpen, setConfirmOpen]       = useState(null); // { title, desc, onConfirm }

  const [selectedGroup, setSelectedGroup]   = useState(null);
  const [searchTerm, setSearchTerm]         = useState('');
  const [searchResults, setSearchResults]   = useState([]);
  const [searching, setSearching]           = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData]             = useState({ Name: '', Description: '' });
  const [toast, setToast]                   = useState(null);

  const searchRef = useRef(null);

  const showToast = (type, message) => setToast({ type, message });

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try { setLoading(true); const r = await groupAPI.getGroups(); if (r.data.success) setGroups(r.data.data); }
    catch (e) { showToast('error', e.response?.data?.message || 'Failed to fetch groups'); }
    finally { setLoading(false); }
  };

  const handleCreateGroup = async () => {
    if (!formData.Name.trim()) { showToast('error', 'Group name is required'); return; }
    try {
      const r = await groupAPI.createGroup(formData);
      if (r.data.success) {
        showToast('success', 'Group created successfully');
        setCreateOpen(false); setFormData({ Name: '', Description: '' }); fetchGroups();
      }
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to create group'); }
  };

  const handleDeleteGroup = async (groupId) => {
    try { await groupAPI.deleteGroup(groupId); showToast('success', 'Group deleted'); fetchGroups(); }
    catch (e) { showToast('error', e.response?.data?.message || 'Failed to delete group'); }
    finally { setConfirmOpen(null); }
  };

  const handleSearchUsers = async (value) => {
    setSearchTerm(value);
    if (value.length < 2) { setSearchResults([]); return; }
    try {
      setSearching(true);
      const r = await groupAPI.searchUsers(value);
      if (r.data.success) setSearchResults(r.data.data);
    } catch (e) { showToast('error', e.response?.data?.message || 'Search failed'); }
    finally { setSearching(false); }
  };

  const handleAddStudents = async () => {
    if (!selectedStudents.length) { showToast('error', 'Select at least one student'); return; }
    try {
      const r = await groupAPI.addStudents({ GroupID: selectedGroup.GroupID, StudentIDs: selectedStudents });
      if (r.data.success) {
        showToast('success', `Added ${selectedStudents.length} student(s) to group`);
        setAddStudentsOpen(false); setSelectedStudents([]); setSearchTerm(''); setSearchResults([]); fetchGroups();
      }
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to add students'); }
  };

  const handleRemoveStudent = async (groupId, userId) => {
    try { await groupAPI.removeStudent(groupId, userId); showToast('success', 'Student removed'); fetchGroups(); }
    catch (e) { showToast('error', e.response?.data?.message || 'Failed to remove student'); }
    finally { setConfirmOpen(null); }
  };

  const toggleStudent = (id) =>
    setSelectedStudents(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const totalMembers = groups.reduce((a, g) => a + (g._count?.Members || 0), 0);
  const acceptedMembers = groups.reduce((a, g) => a + (g.Members?.filter(m => m.Status === 'accepted').length || 0), 0);

  /* ── Stat cards data ── */
  const statCards = [
    { label:'Total Groups',   value: groups.length, icon: Layers,    grad:'from-blue-500 to-indigo-600',   bar:'from-blue-400 to-indigo-500',   fill:70 },
    { label:'Total Members',  value: totalMembers,  icon: Users,     grad:'from-violet-500 to-purple-600', bar:'from-violet-400 to-purple-500', fill:55 },
    { label:'Active Members', value: acceptedMembers, icon: UserCheck,grad:'from-emerald-500 to-teal-600', bar:'from-emerald-400 to-teal-500',  fill:80 },
    { label:'Pending Invites',value: totalMembers - acceptedMembers, icon: Clock, grad:'from-amber-400 to-orange-500', bar:'from-amber-400 to-orange-400', fill:35 },
  ];

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <Styles />
        <Orbs />
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        {confirmOpen && <ConfirmDialog {...confirmOpen} onCancel={() => setConfirmOpen(null)} />}

        <div className="flex flex-col gap-6 py-1">

          {/* ── Header ── */}
          <div className="fu-1 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[13px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0" style={{animation:'pulse-ring 3s ease-in-out infinite'}}>
                <Users size={22} color="#fff" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Group Management</h1>
                <p className="text-sm text-slate-400 font-medium">Create and manage your student groups</p>
              </div>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="action-btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-700 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35"
            >
              <Plus size={16} />
              Create Group
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="fu-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <GlassCard key={i} className="stat-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] font-800 uppercase tracking-widest text-slate-400">{s.label}</p>
                    <div className={`w-8 h-8 rounded-[10px] bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon size={15} color="#fff" />
                    </div>
                  </div>
                  <p className="text-3xl font-900 text-slate-800 leading-none tracking-tight mb-3">{s.value}</p>
                  <div className="h-[3px] bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${s.bar} rounded-full`} style={{width:`${s.fill}%`,animation:'fadeUp 1.2s cubic-bezier(.22,1,.36,1) both'}}/>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* ── Groups Table ── */}
          <GlassCard className="fu-3 overflow-hidden">
            {/* Table head */}
            <div className="grid grid-cols-[1fr_1.4fr_120px_110px_150px] border-b border-slate-100/80">
              {['Group Name','Description','Members','Created','Actions'].map(h => (
                <div key={h} className="px-5 py-3 text-[10px] font-800 uppercase tracking-widest text-slate-400 bg-slate-50/60">{h}</div>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div style={{width:38,height:38,border:'3px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                <p className="text-sm text-slate-400 font-600">Loading groups…</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Users size={28} className="text-indigo-300" />
                </div>
                <h3 className="text-base font-800 text-slate-700 mb-1">No groups yet</h3>
                <p className="text-sm text-slate-400 font-500 mb-5">Create your first group to start organizing students</p>
                <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-700 rounded-xl shadow-md shadow-indigo-500/20">
                  <Plus size={14}/> Create First Group
                </button>
              </div>
            ) : (
              <div>
                {groups.map((g, idx) => (
                  <div
                    key={g.GroupID}
                    className="group-row grid grid-cols-[1fr_1.4fr_120px_110px_150px] items-center border-b border-slate-100/60 last:border-0"
                    style={{animation:`rowIn .38s cubic-bezier(.22,1,.36,1) ${idx * 0.04}s both`}}
                  >
                    {/* Name */}
                    <div className="px-5 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-white font-800 text-sm">{g.Name[0]}</span>
                      </div>
                      <span className="text-sm font-700 text-slate-800 leading-tight">{g.Name}</span>
                    </div>

                    {/* Description */}
                    <div className="px-4 py-4">
                      <p className="text-sm text-slate-500 font-500 line-clamp-1">{g.Description || <span className="text-slate-300 italic">No description</span>}</p>
                    </div>

                    {/* Members */}
                    <div className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-700 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full ring-1 ring-indigo-200">
                        <Users size={11}/> {g._count?.Members || 0} {g._count?.Members === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    {/* Created */}
                    <div className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-600 text-slate-400">
                        <Calendar size={11}/>{new Date(g.CreatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-4 flex items-center gap-2">
                      {/* Add students */}
                      <button
                        className="action-btn flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-700 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[9px] shadow-md shadow-indigo-500/20"
                        onClick={() => { setSelectedGroup(g); setAddStudentsOpen(true); }}
                        title="Add Students"
                      >
                        <UserPlus size={12}/> Add
                      </button>
                      {/* View members */}
                      <button
                        className="action-btn flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-700 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 ring-1 ring-indigo-200 rounded-[9px]"
                        onClick={() => { setSelectedGroup(g); setMembersOpen(true); }}
                        title="View Members"
                      >
                        <Eye size={12}/> View
                      </button>
                      {/* Delete */}
                      <button
                        className="action-btn flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-700 text-red-500 bg-red-50 hover:bg-red-100 ring-1 ring-red-200 rounded-[9px]"
                        onClick={() => setConfirmOpen({
                          title: 'Delete Group?',
                          desc: `"${g.Name}" and all its members will be permanently removed.`,
                          onConfirm: () => handleDeleteGroup(g.GroupID),
                        })}
                        title="Delete Group"
                      >
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ════ CREATE GROUP MODAL ════ */}
        {createOpen && (
          <div className="modal-overlay fixed inset-0 z-[997] flex items-center justify-center p-4" style={{background:'rgba(15,23,42,.45)',backdropFilter:'blur(7px)'}}>
            <div className="modal-box bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/70 overflow-hidden">
              {/* Header strip */}
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 px-6 pt-6 pb-10">
                <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 80% 20%,rgba(255,255,255,.12) 0%,transparent 60%)'}}/>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[11px] bg-white/20 flex items-center justify-center"><Users size={18} color="#fff"/></div>
                    <div>
                      <h2 className="text-lg font-800 text-white leading-tight">Create New Group</h2>
                      <p className="text-indigo-200 text-xs font-500">Organize your students</p>
                    </div>
                  </div>
                  <button onClick={() => { setCreateOpen(false); setFormData({ Name: '', Description: '' }); }} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                    <X size={15} color="#fff"/>
                  </button>
                </div>
              </div>

              {/* Form body (overlaps strip) */}
              <div className="-mt-5 mx-4 mb-5 bg-white rounded-2xl shadow-lg border border-slate-100 p-5 space-y-4">
                <div>
                  <label className="block text-xs font-800 text-slate-700 uppercase tracking-wider mb-1.5">
                    Group Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science 101"
                    value={formData.Name}
                    onChange={e => setFormData(p => ({ ...p, Name: e.target.value }))}
                    className="form-input w-full px-4 py-2.5 text-sm font-600 text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-slate-50/60 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-800 text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the group…"
                    value={formData.Description}
                    onChange={e => setFormData(p => ({ ...p, Description: e.target.value }))}
                    className="textarea-el w-full px-4 py-2.5 text-sm font-500 text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-slate-50/60 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 px-4 pb-5">
                <button onClick={() => { setCreateOpen(false); setFormData({ Name: '', Description: '' }); }} className="flex-1 py-2.5 text-sm font-700 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleCreateGroup} className="flex-1 py-2.5 text-sm font-700 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ ADD STUDENTS MODAL ════ */}
        {addStudentsOpen && (
          <div className="modal-overlay fixed inset-0 z-[997] flex items-center justify-center p-4" style={{background:'rgba(15,23,42,.45)',backdropFilter:'blur(7px)'}}>
            <div className="modal-box bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200/70 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 px-6 pt-6 pb-10">
                <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 80% 20%,rgba(255,255,255,.12) 0%,transparent 60%)'}}/>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[11px] bg-white/20 flex items-center justify-center"><UserPlus size={18} color="#fff"/></div>
                    <div>
                      <h2 className="text-lg font-800 text-white leading-tight">Add Students</h2>
                      <p className="text-blue-200 text-xs font-500">to {selectedGroup?.Name}</p>
                    </div>
                  </div>
                  <button onClick={() => { setAddStudentsOpen(false); setSelectedStudents([]); setSearchTerm(''); setSearchResults([]); }} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                    <X size={15} color="#fff"/>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="-mt-5 mx-4 mb-4 bg-white rounded-2xl shadow-lg border border-slate-100 p-5 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search by name, email or username…"
                    value={searchTerm}
                    onChange={e => handleSearchUsers(e.target.value)}
                    className="search-input w-full pl-9 pr-4 py-2.5 text-sm font-600 text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-slate-50 transition-all"
                  />
                  {searching && (
                    <div style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:16,height:16,border:'2px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                  )}
                </div>

                {/* Selected chips */}
                {selectedStudents.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudents.map(id => {
                      const u = searchResults.find(r => r.UserID === id);
                      return u ? (
                        <span key={id} className="flex items-center gap-1.5 text-xs font-700 text-indigo-600 bg-indigo-50 ring-1 ring-indigo-200 px-2.5 py-1 rounded-full">
                          {u.FirstName || u.Username}
                          <button onClick={() => toggleStudent(id)} className="text-indigo-400 hover:text-indigo-600"><X size={10}/></button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1" style={{scrollbarWidth:'thin',scrollbarColor:'#c7d2fe transparent'}}>
                    {searchResults.map(u => {
                      const sel = selectedStudents.includes(u.UserID);
                      return (
                        <div
                          key={u.UserID}
                          onClick={() => toggleStudent(u.UserID)}
                          className={`student-card flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${sel ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'}`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-800 text-sm shadow-md ${sel ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {(u.FirstName || u.Username)[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-700 text-slate-800 leading-tight truncate">
                              {u.FirstName && u.LastName ? `${u.FirstName} ${u.LastName}` : u.Username}
                            </p>
                            <p className="text-xs text-slate-400 font-500 flex items-center gap-1 mt-0.5 truncate">
                              <Mail size={9}/>{u.Email}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
                            {sel && <Check size={11} color="#fff"/>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {searchTerm.length >= 2 && !searching && searchResults.length === 0 && (
                  <div className="text-center py-6">
                    <Search size={20} className="text-slate-300 mx-auto mb-2"/>
                    <p className="text-sm text-slate-400 font-600">No students found</p>
                  </div>
                )}

                {searchTerm.length < 2 && !searching && searchResults.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-xs font-500">Type at least 2 characters to search</div>
                )}
              </div>

              <div className="flex gap-3 px-4 pb-5">
                <button onClick={() => { setAddStudentsOpen(false); setSelectedStudents([]); setSearchTerm(''); setSearchResults([]); }} className="flex-1 py-2.5 text-sm font-700 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button
                  onClick={handleAddStudents}
                  disabled={!selectedStudents.length}
                  className="flex-1 py-2.5 text-sm font-700 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add {selectedStudents.length > 0 ? `${selectedStudents.length} ` : ''}Student{selectedStudents.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ VIEW MEMBERS MODAL ════ */}
        {membersOpen && selectedGroup && (
          <div className="modal-overlay fixed inset-0 z-[997] flex items-center justify-center p-4" style={{background:'rgba(15,23,42,.45)',backdropFilter:'blur(7px)'}}>
            <div className="modal-box bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200/70 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-violet-500 to-purple-600 px-6 pt-6 pb-10">
                <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 80% 20%,rgba(255,255,255,.12) 0%,transparent 60%)'}}/>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[11px] bg-white/20 flex items-center justify-center"><Shield size={18} color="#fff"/></div>
                    <div>
                      <h2 className="text-lg font-800 text-white leading-tight">{selectedGroup.Name}</h2>
                      <p className="text-violet-200 text-xs font-500">{selectedGroup._count?.Members || 0} members</p>
                    </div>
                  </div>
                  <button onClick={() => setMembersOpen(false)} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                    <X size={15} color="#fff"/>
                  </button>
                </div>
              </div>

              {/* Members list */}
              <div className="-mt-5 mx-4 mb-4 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {selectedGroup.Members?.length ? (
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto" style={{scrollbarWidth:'thin',scrollbarColor:'#c7d2fe transparent'}}>
                    {selectedGroup.Members.map((m, i) => {
                      const name = m.User.FirstName && m.User.LastName
                        ? `${m.User.FirstName} ${m.User.LastName}`
                        : m.User.Username;
                      return (
                        <div key={m.GroupMemberID} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors" style={{animation:`rowIn .35s cubic-bezier(.22,1,.36,1) ${i*0.04}s both`}}>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white font-800 text-sm">{name[0].toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-700 text-slate-800 leading-tight truncate">{name}</p>
                            <p className="text-xs text-slate-400 font-500 flex items-center gap-1 mt-0.5 truncate"><Mail size={9}/>{m.User.Email}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <StatusBadge status={m.Status} />
                              <span className="text-[10px] text-slate-400 font-500">
                                {m.Status === 'accepted' && m.AcceptedAt ? `Joined ${new Date(m.AcceptedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : m.InvitedAt ? `Invited ${new Date(m.InvitedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : ''}
                              </span>
                            </div>
                          </div>
                          <button
                            className="action-btn w-8 h-8 rounded-[9px] bg-red-50 hover:bg-red-100 flex items-center justify-center ring-1 ring-red-200 flex-shrink-0"
                            onClick={() => setConfirmOpen({
                              title: 'Remove Student?',
                              desc: `Remove ${name} from ${selectedGroup.Name}?`,
                              onConfirm: () => handleRemoveStudent(selectedGroup.GroupID, m.UserID),
                            })}
                          >
                            <Trash2 size={13} className="text-red-500"/>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3"><Users size={24} className="text-slate-300"/></div>
                    <p className="text-sm font-700 text-slate-500 mb-1">No members yet</p>
                    <p className="text-xs text-slate-400 font-500">Add students to this group to get started</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-4 pb-5">
                <button onClick={() => setMembersOpen(false)} className="flex-1 py-2.5 text-sm font-700 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Close</button>
                <button onClick={() => { setMembersOpen(false); setAddStudentsOpen(true); }} className="flex-1 py-2.5 text-sm font-700 text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-md shadow-violet-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <UserPlus size={14}/> Add More
                </button>
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>
    </ProtectedRoute>
  );
}