'use client';

import { useState, useEffect } from 'react';
import { fileAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';

/* ─── Keyframes & Global Styles ─── */
const GlobalStyles = () => (
  <style>{`
    @keyframes floatA {
      0%,100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-28px) scale(1.03); }
    }
    @keyframes floatB {
      0%,100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(20px) scale(0.97); }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes progressFill {
      from { width: 0%; }
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(-12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-soft {
      0%,100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .fade-up-1 { animation: fadeSlideUp 0.5s cubic-bezier(.22,1,.36,1) 0.05s both; }
    .fade-up-2 { animation: fadeSlideUp 0.5s cubic-bezier(.22,1,.36,1) 0.12s both; }
    .fade-up-3 { animation: fadeSlideUp 0.5s cubic-bezier(.22,1,.36,1) 0.19s both; }
    .fade-up-4 { animation: fadeSlideUp 0.5s cubic-bezier(.22,1,.36,1) 0.26s both; }
    .fade-up-5 { animation: fadeSlideUp 0.5s cubic-bezier(.22,1,.36,1) 0.33s both; }
    .fade-up-6 { animation: fadeSlideUp 0.5s cubic-bezier(.22,1,.36,1) 0.40s both; }
  `}</style>
);

/* ─── Background Orbs ─── */
const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
    <div className="absolute top-[-8%] right-[-4%] w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.11)_0%,transparent_70%)] animate-[floatA_15s_ease-in-out_infinite]" />
    <div className="absolute bottom-[8%] left-[-6%] w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.09)_0%,transparent_70%)] animate-[floatB_19s_ease-in-out_infinite]" />
    <div className="absolute top-[45%] left-[38%] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%)] animate-[floatA_24s_ease-in-out_infinite_reverse]" />
  </div>
);

/* ─── Card Shell ─── */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white/78 backdrop-blur-[18px] rounded-[22px] border border-[rgba(226,232,240,0.7)] shadow-[0_4px_24px_rgba(99,102,241,0.06),0_1px_4px_rgba(0,0,0,0.03)] ${className}`}>
    {children}
  </div>
);

/* ─── Section Heading ─── */
const SectionHeading = ({ icon, label, color = '#6366f1' }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-[34px] h-[34px] rounded-xl flex-shrink-0 bg-gradient-to-br from-[#6366f1] to-[#6366f1cc] flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.3)]">
      {icon}
    </div>
    <h2 className="text-base font-extrabold text-slate-800 m-0 tracking-[-0.01em]">{label}</h2>
  </div>
);

/* ─── Status Badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    completed: { bg: 'bg-[rgba(16,185,129,0.10)]', color: 'text-[#059669]', dot: 'bg-[#10b981]', label: 'Completed' },
    processing: { bg: 'bg-[rgba(245,158,11,0.10)]', color: 'text-[#b45309]', dot: 'bg-[#f59e0b]', label: 'Processing', animate: true },
    failed:     { bg: 'bg-[rgba(239,68,68,0.10)]',  color: 'text-[#dc2626]', dot: 'bg-[#ef4444]', label: 'Failed' },
  };
  const s = map[status] || { bg: 'bg-[rgba(148,163,184,0.12)]', color: 'text-[#64748b]', dot: 'bg-[#94a3b8]', label: status };
  return (
    <span className={`inline-flex items-center gap-1.25 px-2.5 py-1 rounded-full ${s.bg} ${s.color} text-[11px] font-bold tracking-[0.04em] uppercase`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0 ${s.animate ? 'animate-[pulse-soft_1.4s_ease-in-out_infinite]' : ''}`} />
      {s.label}
    </span>
  );
};

/* ─── Toast ─── */
const Toast = ({ type, message, onClose }) => {
  const isError = type === 'error';
  return (
    <div className={`flex items-center justify-between gap-3 p-[14px_18px] ${isError ? 'bg-[rgba(254,242,242,0.95)] border-[rgba(252,165,165,0.6)]' : 'bg-[rgba(240,253,244,0.95)] border-[rgba(134,239,172,0.6)]'} backdrop-blur-[12px] border rounded-[14px] shadow-[0_6px_24px_rgba(0,0,0,0.1)] animate-[toastIn_0.35s_cubic-bezier(.22,1,.36,1)_both]`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-[30px] h-[30px] rounded-[9px] flex-shrink-0 ${isError ? 'bg-[rgba(239,68,68,0.12)]' : 'bg-[rgba(16,185,129,0.12)]'} flex items-center justify-center`}>
          {isError
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          }
        </div>
        <div>
          <p className={`text-[13px] font-bold m-0 ${isError ? 'text-[#b91c1c]' : 'text-[#065f46]'}`}>{isError ? 'Error' : 'Success'}</p>
          <p className={`text-[12px] m-[1px_0_0] font-medium ${isError ? 'text-[#dc2626]' : 'text-[#059669]'}`}>{message}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {isError && (
          <button onClick={onClose} className="px-3 py-1.25 bg-[rgba(239,68,68,0.12)] text-[#dc2626] border-none rounded-lg text-xs font-bold cursor-pointer hover:bg-[rgba(239,68,68,0.18)] transition-colors">Retry</button>
        )}
        <button onClick={onClose} className="w-[26px] h-[26px] border-none rounded-lg cursor-pointer bg-black/6 text-slate-500 flex items-center justify-center text-lg hover:bg-black/10 transition-colors">×</button>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export default function FileManagement() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchFiles(); fetchStats(); }, [page, filter]);

  const fetchFiles = async () => {
    try {
      setLoading(true); setError('');
      const params = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;
      const response = await fileAPI.getUserFiles(params);
      if (response.data.success) {
        setFiles(response.data.data?.files || []);
        setPagination(response.data.data?.pagination);
      } else { setError('Failed to load files'); setFiles([]); }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch files. Please try again.');
      setFiles([]);
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const response = await fileAPI.getFileStats();
      if (response.data.success) setStats(response.data.data);
    } catch { setStats({ totalFiles: 0, completedFiles: 0, processingFiles: 0, totalSize: 0 }); }
  };

  const processFile = (file) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { setError('Only PDF and DOCX files are allowed'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return; }
    setSelectedFile(file); setError('');
  };

  const handleFileSelect = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) { setError('Please select a file to upload'); return; }
    try {
      setUploading(true); setError(''); setSuccess(''); setUploadProgress(0);
      await fileAPI.uploadFile(selectedFile, (e) => {
        setUploadProgress(Math.round((e.loaded * 100) / e.total));
      });
      setSuccess('File uploaded and processed successfully!');
      setSelectedFile(null); setUploadProgress(0);
      const fi = document.getElementById('file-input');
      if (fi) fi.value = '';
      fetchFiles(); fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally { setUploading(false); }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await fileAPI.deleteFile(fileId);
      setSuccess('File deleted successfully');
      fetchFiles(); fetchStats();
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete file'); }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + s[i];
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const getFileIcon = (type) => type?.includes('pdf') ? '📄' : '📝';

  const statItems = stats ? [
    { label: 'Total Files', value: stats.totalFiles, color: '#3b82f6', bg: 'bg-gradient-to-br from-[#3b82f6] to-[#6366f1]', bar: 70, barColor: 'bg-gradient-to-r from-[#3b82f6] to-[#6366f1]' },
    { label: 'Completed', value: stats.completedFiles, color: '#059669', bg: 'bg-gradient-to-br from-[#10b981] to-[#059669]', bar: 85, barColor: 'bg-gradient-to-r from-[#10b981] to-[#059669]' },
    { label: 'Processing', value: stats.processingFiles, color: '#b45309', bg: 'bg-gradient-to-br from-[#f59e0b] to-[#ea580c]', bar: 40, barColor: 'bg-gradient-to-r from-[#f59e0b] to-[#ea580c]' },
    { label: 'Total Size', value: formatFileSize(stats.totalSize), color: '#7c3aed', bg: 'bg-gradient-to-br from-[#a855f7] to-[#7c3aed]', bar: 55, barColor: 'bg-gradient-to-r from-[#a855f7] to-[#7c3aed]' },
  ] : [];

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <GlobalStyles />
        <Orbs />

        <div className="flex flex-col gap-6 px-8 pb-10 max-w-[1200px] mx-auto">

          {/* ── Page Header ── */}
          <div className="fade-up-1 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-[42px] h-[42px] rounded-[13px] bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center shadow-[0_6px_20px_rgba(99,102,241,0.28)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 m-0 tracking-[-0.02em]">File Management</h1>
                  <p className="text-xs text-slate-400 m-0 font-medium">Upload and manage your educational documents</p>
                </div>
              </div>
            </div>
            <label htmlFor="file-input" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-xl cursor-pointer text-xs font-bold shadow-[0_4px_18px_rgba(99,102,241,0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(99,102,241,0.4)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Upload
            </label>
          </div>

          {/* ── Toasts ── */}
          {(error || success) && (
            <div className="fade-up-1">
              {error && <Toast type="error" message={error} onClose={() => { setError(''); fetchFiles(); }} />}
              {success && <Toast type="success" message={success} onClose={() => setSuccess('')} />}
            </div>
          )}

          {/* ── Stats ── */}
          {stats && (
            <div className="fade-up-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {statItems.map((s, i) => (
                <div key={i} className="stat-card bg-white/75 backdrop-blur-[16px] rounded-[18px] p-[18px_20px] border border-[rgba(226,232,240,0.7)] shadow-[0_3px_18px_rgba(99,102,241,0.06)] hover:-translate-y-1.25 hover:shadow-[0_8px_28px_rgba(99,102,241,0.12)] transition-all duration-[280ms]">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] font-bold text-slate-400 tracking-[0.07em] uppercase m-0">{s.label}</p>
                    <div className={`w-[30px] h-[30px] rounded-lg ${s.bg} flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.15)]`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                  </div>
                  <p className={`text-[28px] font-black m-0 mb-2.5 tracking-[-0.03em] leading-none ${s.color}`}>{s.value}</p>
                  <div className="h-0.75 bg-slate-100 rounded-xl overflow-hidden">
                    <div className={`h-full ${s.barColor} rounded-xl animate-[progressFill_1.2s_cubic-bezier(.22,1,.36,1)_both]`} style={{ width: `${s.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Upload Zone ── */}
          <Card className="fade-up-3 p-7">
            <SectionHeading
              label="Upload New File"
              color="#3b82f6"
              icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>}
            />

            {/* Drop Zone */}
            <div
              className={`upload-zone border-2 border-dashed rounded-xl p-9 text-center cursor-pointer mb-4.5 transition-all ${isDragging ? 'border-[#6366f1] bg-[rgba(238,242,255,0.6)]' : selectedFile ? 'border-[#6366f1] bg-[rgba(238,242,255,0.35)]' : 'border-slate-300 bg-[rgba(248,250,252,0.6)] hover:border-[#6366f1] hover:bg-[rgba(238,242,255,0.5)]'}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input id="file-input" type="file" accept=".pdf,.docx" onChange={handleFileSelect} disabled={uploading} className="hidden" />

              {selectedFile ? (
                <div>
                  <div className="w-[52px] h-[52px] rounded-xl mx-auto mb-3 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-[0_6px_20px_rgba(99,102,241,0.28)]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <p className="text-sm font-bold text-[#4338ca] m-0 mb-1">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 m-0 font-medium">{formatFileSize(selectedFile.size)}</p>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedFile(null); const fi = document.getElementById('file-input'); if (fi) fi.value = ''; }}
                    className="mt-2.5 text-xs text-rose-500 bg-none border-none cursor-pointer font-semibold hover:text-rose-600 transition-colors"
                  >
                    × Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-[52px] h-[52px] rounded-xl mx-auto mb-3 bg-[rgba(99,102,241,0.08)] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-600 m-0 mb-1">Drag & drop your file here</p>
                  <p className="text-xs text-slate-400 m-0 font-medium">PDF or DOCX · Max 10 MB · <span className="text-[#6366f1] font-semibold">Browse files</span></p>
                </div>
              )}
            </div>

            {/* Progress */}
            {uploading && (
              <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#6366f1]">Uploading & processing…</span>
                  <span className="text-xs font-bold text-[#6366f1]">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-xl overflow-hidden">
                  <div className="h-full rounded-xl bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] transition-[width] duration-300 shadow-[0_0_10px_rgba(99,102,241,0.4)]" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <button
              className="upload-btn px-7 py-2.75 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white border-none rounded-xl text-sm font-bold cursor-pointer shadow-[0_6px_20px_rgba(99,102,241,0.28)] flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(99,102,241,0.38)]"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-[spin_0.7s_linear_infinite] flex-shrink-0" />
                  Processing…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                  Upload & Process
                </>
              )}
            </button>
          </Card>

          {/* ── Filter Bar ── */}
          <Card className="fade-up-4 px-4.5 py-3.5">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs font-bold text-slate-400 tracking-[0.06em] uppercase mr-1">Filter</span>
              {[
                { key: 'all', label: 'All Files' },
                { key: 'completed', label: 'Completed' },
                { key: 'processing', label: 'Processing' },
                { key: 'failed', label: 'Failed' },
              ].map(f => (
                <button
                  key={f.key}
                  className="filter-btn px-4 py-1.75 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200"
                  onClick={() => setFilter(f.key)}
                  style={{
                    background: filter === f.key ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(248,250,252,0.9)',
                    color: filter === f.key ? '#fff' : '#64748b',
                    border: filter === f.key ? 'none' : '1px solid rgba(226,232,240,0.8)',
                    boxShadow: filter === f.key ? '0 4px 14px rgba(99,102,241,0.25)' : 'none',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Card>

          {/* ── Files Table ── */}
          <Card className="fade-up-5 p-6">
            <SectionHeading
              label="Your Files"
              color="#6366f1"
              icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>}
            />

            {loading ? (
              <div className="text-center py-15">
                <div className="w-11 h-11 border-3 border-slate-200 border-t-[#6366f1] rounded-full animate-[spin_0.75s_linear_infinite] mx-auto mb-3.5" />
                <p className="text-slate-400 text-sm font-semibold">Loading files…</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-15 h-15 rounded-xl mx-auto mb-4 bg-[rgba(99,102,241,0.07)] flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <h3 className="text-base font-extrabold text-slate-800 m-0 mb-1.5">No Files Found</h3>
                <p className="text-xs text-slate-400 font-medium m-0 mb-5">{filter === 'all' ? 'Upload your first file to start generating quizzes!' : `No ${filter} files found.`}</p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="px-5 py-2.25 bg-[rgba(99,102,241,0.09)] text-[#6366f1] border-none rounded-xl text-xs font-bold cursor-pointer hover:bg-[rgba(99,102,241,0.14)] transition-colors"
                  >
                    View All Files
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[rgba(226,232,240,0.8)]">
                        {['File Name', 'Type', 'Size', 'Chunks', 'Status', 'Uploaded', 'Actions'].map(h => (
                          <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-extrabold text-slate-400 tracking-[0.07em] uppercase bg-[rgba(248,250,252,0.7)] whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file, idx) => (
                        <tr
                          key={file.FileID}
                          className="file-row border-b border-[rgba(226,232,240,0.5)] hover:bg-[rgba(238,242,255,0.6)] transition-colors"
                          style={{ animation: `fadeSlideUp 0.4s cubic-bezier(.22,1,.36,1) ${idx * 0.04}s both` }}
                        >
                          {/* File Name */}
                          <td className="px-3.5 py-3.25 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-base">
                                {getFileIcon(file.FileType)}
                              </div>
                              <span className="text-xs font-bold text-slate-800 max-w-[180px] overflow-hidden text-ellipsis">{file.FileName}</span>
                            </div>
                          </td>
                          {/* Type */}
                          <td className="px-3.5 py-3.25 whitespace-nowrap">
                            <span className={`px-2.25 py-1 rounded-lg text-[11px] font-extrabold tracking-[0.04em] ${file.FileType?.includes('pdf') ? 'bg-[rgba(239,68,68,0.09)] text-[#dc2626]' : 'bg-[rgba(59,130,246,0.09)] text-[#3b82f6]'}`}>
                              {file.FileType?.includes('pdf') ? 'PDF' : 'DOCX'}
                            </span>
                          </td>
                          {/* Size */}
                          <td className="px-3.5 py-3.25 text-xs text-slate-500 font-semibold whitespace-nowrap">
                            {formatFileSize(file.FileSize)}
                          </td>
                          {/* Chunks */}
                          <td className="px-3.5 py-3.25 whitespace-nowrap">
                            <span className="px-2.25 py-1 rounded-lg bg-[rgba(99,102,241,0.08)] text-[#6366f1] text-xs font-bold">
                              {file.TotalChunks}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-3.5 py-3.25 whitespace-nowrap">
                            <StatusBadge status={file.Status} />
                          </td>
                          {/* Date */}
                          <td className="px-3.5 py-3.25 text-xs text-slate-400 font-medium whitespace-nowrap">
                            {formatDate(file.UploadedAt)}
                          </td>
                          {/* Actions */}
                          <td className="px-3.5 py-3.25 whitespace-nowrap">
                            <div className="flex gap-1.5">
                              <button
                                className="action-link px-3 py-1.25 rounded-lg border-none cursor-pointer bg-[rgba(99,102,241,0.09)] text-[#6366f1] text-xs font-bold flex items-center gap-1 hover:bg-[rgba(99,102,241,0.16)] transition-colors"
                                onClick={() => router.push(`/file-details/${file.FileID}`)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                View
                              </button>
                              <button
                                className="action-link px-3 py-1.25 rounded-lg border-none cursor-pointer bg-[rgba(239,68,68,0.08)] text-[#ef4444] text-xs font-bold flex items-center gap-1 hover:bg-[rgba(239,68,68,0.15)] transition-colors"
                                onClick={() => handleDelete(file.FileID)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="fade-up-6 mt-5 flex justify-between items-center">
                    <p className="text-xs text-slate-400 font-semibold">
                      Page <strong className="text-[#6366f1]">{pagination.page}</strong> of {pagination.totalPages}
                      <span className="text-slate-300"> · </span>{pagination.total} total files
                    </p>
                    <div className="flex gap-2">
                      {[
                        { label: '← Prev', action: () => setPage(page - 1), disabled: page === 1 },
                        { label: 'Next →', action: () => setPage(page + 1), disabled: page === pagination.totalPages },
                      ].map(btn => (
                        <button
                          key={btn.label}
                          onClick={btn.action}
                          disabled={btn.disabled}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${btn.disabled ? 'bg-[rgba(248,250,252,0.6)] text-slate-300 border border-[rgba(226,232,240,0.5)] cursor-not-allowed' : 'bg-white/90 text-[#6366f1] border border-[rgba(199,210,254,0.8)] cursor-pointer hover:bg-[rgba(238,242,255,0.9)] hover:border-[#a5b4fc]'}`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}