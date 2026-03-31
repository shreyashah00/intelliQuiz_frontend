'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, BookOpen, CheckCircle, FileText, Filter, Search, X, ChevronDown, ChevronUp, ExternalLink, Hash, Layers } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { quizAPI } from '../../../utils/api';

/* ─── Animations injected once ─── */
const Styles = () => (
  <style>{`
    @keyframes floatA { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-26px) scale(1.03)} }
    @keyframes floatB { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(20px) scale(0.97)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    @keyframes barIn  { from{width:0} }
    @keyframes rowIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes expandIn { from{opacity:0;transform:scaleY(0.96)} to{opacity:1;transform:scaleY(1)} }

    .fu-1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .04s both}
    .fu-2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .10s both}
    .fu-3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .17s both}
    .fu-4{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .24s both}
    .fu-5{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .31s both}

    .stat-card{transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s ease}
    .stat-card:hover{transform:translateY(-5px)}

    .q-row{transition:background .16s ease}
    .q-row:hover{background:rgba(238,242,255,.55)!important}

    .filter-chip{transition:all .18s cubic-bezier(.22,1,.36,1)}
    .filter-chip:hover{transform:translateY(-1px)}

    .expand-btn{transition:all .2s ease}
    .expand-btn:hover{background:rgba(99,102,241,.12)!important}

    .view-btn{transition:all .2s ease}
    .view-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(99,102,241,.28)!important}

    .search-wrap input:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important}
    .select-el:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important}
    .expanded-body{animation:expandIn .25s cubic-bezier(.22,1,.36,1) both;transform-origin:top}
  `}</style>
);

/* ─── Floating orbs ─── */
const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
    <div style={{position:'absolute',top:'-8%',right:'-4%',width:460,height:460,background:'radial-gradient(circle,rgba(99,102,241,.11) 0%,transparent 70%)',borderRadius:'50%',animation:'floatA 15s ease-in-out infinite'}}/>
    <div style={{position:'absolute',bottom:'8%',left:'-6%',width:370,height:370,background:'radial-gradient(circle,rgba(59,130,246,.09) 0%,transparent 70%)',borderRadius:'50%',animation:'floatB 19s ease-in-out infinite'}}/>
    <div style={{position:'absolute',top:'42%',left:'36%',width:270,height:270,background:'radial-gradient(circle,rgba(168,85,247,.06) 0%,transparent 70%)',borderRadius:'50%',animation:'floatA 23s ease-in-out infinite reverse'}}/>
  </div>
);

/* ─── Glass card shell ─── */
const GlassCard = ({ children, className = '', style = {} }) => (
  <div
    className={`bg-white/75 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_4px_24px_rgba(99,102,241,.07)] ${className}`}
    style={{ borderColor: 'rgba(226,232,240,.7)', ...style }}
  >
    {children}
  </div>
);

/* ─── Difficulty badge ─── */
const DiffBadge = ({ diff }) => {
  const map = {
    easy:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    medium: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
    hard:   'bg-red-50     text-red-700     ring-1 ring-red-200',
  };
  return (
    <span className={`text-[10px] font-800 uppercase tracking-wider px-2 py-0.5 rounded-full ${map[diff] || 'bg-slate-100 text-slate-600'}`}>
      {diff}
    </span>
  );
};

/* ─── Type badge ─── */
const TypeBadge = ({ type }) => (
  <span className="text-[10px] font-700 uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
    {type?.replace('_', ' ')}
  </span>
);

/* ─── Select wrapper (native, styled) ─── */
const NativeSelect = ({ value, onChange, placeholder, children }) => (
  <div className="relative">
    <select
      className="select-el w-full appearance-none bg-white/80 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 pr-9 cursor-pointer transition-all"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

/* ─── Expanded answer options ─── */
const AnswerOptions = ({ options }) => {
  if (!options?.length) return <p className="text-slate-400 text-sm">No options available.</p>;
  return (
    <div className="expanded-body grid gap-2">
      {options.map((opt, i) => (
        <div
          key={opt.optionId}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            opt.isCorrect
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-800 flex-shrink-0 ${
            opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {String.fromCharCode(65 + i)}
          </div>
          <span className="text-sm text-slate-800 flex-1">{opt.text}</span>
          {opt.isCorrect && (
            <span className="flex items-center gap-1 text-[10px] font-700 text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
              <CheckCircle size={10} /> Correct
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════
   Main Component
════════════════════════════════════════ */
export default function QuestionBankPage() {
  const router = useRouter();
  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [stats, setStats]           = useState({ questionTypes: [], subjects: [] });
  const [filters, setFilters]       = useState({ search: '', subject: '', difficulty: '', questionType: '' });
  const [expanded, setExpanded]     = useState({});

  useEffect(() => { fetchQuestions(); }, [pagination.page, pagination.limit, filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page, limit: pagination.limit,
        ...(filters.search       && { search: filters.search }),
        ...(filters.subject      && { subject: filters.subject }),
        ...(filters.difficulty   && { difficulty: filters.difficulty }),
        ...(filters.questionType && { questionType: filters.questionType }),
      };
      const res = await quizAPI.getQuestionBank(params);
      if (res.data.success) {
        setQuestions(res.data.data.questions || []);
        setPagination(p => ({
          ...p,
          total:      res.data.data.pagination?.total || 0,
          totalPages: res.data.data.pagination?.totalPages || 0,
        }));
        setStats(res.data.data.stats || { questionTypes: [], subjects: [] });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFilter = (key, value) => {
    setFilters(p => ({ ...p, [key]: value }));
    setPagination(p => ({ ...p, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', subject: '', difficulty: '', questionType: '' });
    setPagination(p => ({ ...p, page: 1 }));
  };

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const hasFilters = filters.search || filters.subject || filters.difficulty || filters.questionType;

  const totalQuestions    = pagination.total;
  const uniqueSubjects    = stats.subjects?.length || 0;
  const mcCount           = stats.questionTypes?.find(t => t.QuestionType === 'multiple_choice')?._count?.QuestionID || 0;
  const typeCount         = stats.questionTypes?.length || 0;

  const statCards = [
    { label: 'Total Questions', value: totalQuestions, icon: Hash,       grad: 'from-blue-500 to-indigo-600',   text: 'text-blue-600',   bar: 'from-blue-400 to-indigo-500',   fill: 70 },
    { label: 'Subjects',        value: uniqueSubjects,  icon: BookOpen,   grad: 'from-violet-500 to-purple-600', text: 'text-violet-600', bar: 'from-violet-400 to-purple-500', fill: 55 },
    { label: 'Multiple Choice', value: mcCount,         icon: CheckCircle,grad: 'from-emerald-500 to-teal-600', text: 'text-emerald-600',bar: 'from-emerald-400 to-teal-500',  fill: 80 },
    { label: 'Question Types',  value: typeCount,       icon: Layers,     grad: 'from-orange-400 to-rose-500',  text: 'text-orange-600', bar: 'from-orange-400 to-rose-400',   fill: 45 },
  ];

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <Styles />
        <Orbs />

        <div className="flex flex-col gap-6 py-1">

          {/* ── Page Header ── */}
          <div className="fu-1 flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[13px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
                <Brain size={22} color="#fff" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Question Bank</h1>
                <p className="text-sm text-slate-400 font-medium">Browse and manage all your quiz questions</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-700 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full ring-1 ring-indigo-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"/>
              {totalQuestions} questions total
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="fu-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <GlassCard key={i} className="stat-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] font-800 uppercase tracking-widest text-slate-400">{s.label}</p>
                    <div className={`w-8 h-8 rounded-[10px] bg-gradient-to-br ${s.grad} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon size={15} color="#fff" />
                    </div>
                  </div>
                  <p className={`text-3xl font-900 ${s.text} leading-none tracking-tight mb-3`}>{s.value}</p>
                  <div className="h-[3px] bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${s.bar} rounded-full`} style={{ width: `${s.fill}%`, animation: 'barIn 1.2s cubic-bezier(.22,1,.36,1) both' }} />
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* ── Filters ── */}
          <GlassCard className="fu-3 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Filter size={13} color="#fff" />
              </div>
              <h3 className="text-sm font-800 text-slate-800">Filters</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-1.5 text-xs font-700 text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full ring-1 ring-red-200 transition-colors"
                >
                  <X size={11} /> Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 search-wrap relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search questions…"
                  value={filters.search}
                  onChange={e => handleFilter('search', e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 transition-all"
                  style={{ backdropFilter: 'blur(10px)' }}
                />
                {filters.search && (
                  <button onClick={() => handleFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Subject */}
              <NativeSelect value={filters.subject} onChange={v => handleFilter('subject', v)} placeholder="All Subjects">
                {stats.subjects?.map(s => (
                  <option key={s.Subject} value={s.Subject}>{s.Subject} ({s._count?.QuizID || 0})</option>
                ))}
              </NativeSelect>

              {/* Difficulty */}
              <NativeSelect value={filters.difficulty} onChange={v => handleFilter('difficulty', v)} placeholder="Difficulty">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </NativeSelect>

              {/* Type */}
              <NativeSelect value={filters.questionType} onChange={v => handleFilter('questionType', v)} placeholder="Question Type">
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
              </NativeSelect>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
                  <span
                    key={k}
                    className="filter-chip flex items-center gap-1.5 text-[11px] font-700 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full ring-1 ring-indigo-200"
                  >
                    {v}
                    <button onClick={() => handleFilter(k, '')} className="text-indigo-400 hover:text-indigo-600">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </GlassCard>

          {/* ── Questions Table ── */}
          <GlassCard className="fu-4 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_220px_100px_90px] gap-0 border-b border-slate-100/80">
              {['Question', 'Quiz Details', 'Created', 'Action'].map(h => (
                <div key={h} className="px-5 py-3 text-[10px] font-800 uppercase tracking-widest text-slate-400 bg-slate-50/60">
                  {h}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div style={{ width:40,height:40,border:'3px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin .7s linear infinite' }} />
                <p className="text-sm text-slate-400 font-600">Loading questions…</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Brain size={28} className="text-indigo-300" />
                </div>
                <h3 className="text-base font-800 text-slate-700 mb-1">No questions found</h3>
                <p className="text-sm text-slate-400 font-500">
                  {hasFilters ? 'Try adjusting your filters.' : 'Create quizzes to build your question bank.'}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-4 text-sm font-700 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl ring-1 ring-indigo-200 transition-colors">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div>
                {questions.map((q, idx) => (
                  <div
                    key={q.questionId}
                    className="q-row border-b border-slate-100/70 last:border-0"
                    style={{ animation: `rowIn .38s cubic-bezier(.22,1,.36,1) ${idx * 0.03}s both` }}
                  >
                    {/* Main row */}
                    <div className="grid grid-cols-[1fr_220px_100px_90px] gap-0 items-start">

                      {/* Question text */}
                      <div className="px-5 py-4">
                        <p className="text-sm font-700 text-slate-800 leading-snug mb-2 line-clamp-2">{q.questionText}</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <TypeBadge type={q.questionType} />
                          <span className="text-[10px] font-700 text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full ring-1 ring-indigo-200">
                            {q.points} {q.points === 1 ? 'pt' : 'pts'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-500">· Used {q.usageCount}×</span>
                          {q.options?.length > 0 && (
                            <button
                              className="expand-btn ml-1 flex items-center gap-1 text-[10px] font-700 text-slate-500 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 px-2 py-0.5 rounded-full transition-all"
                              onClick={() => toggleExpand(q.questionId)}
                            >
                              {expanded[q.questionId] ? <><ChevronUp size={10}/> Hide</> : <><ChevronDown size={10}/> Answers</>}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quiz details */}
                      <div className="px-4 py-4">
                        <p className="text-sm font-700 text-slate-800 leading-snug mb-1.5 line-clamp-1">{q.quiz.title}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <DiffBadge diff={q.quiz.difficulty} />
                          {q.quiz.subject && (
                            <span className="text-[10px] text-slate-500 font-600">{q.quiz.subject}</span>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="px-4 py-4">
                        <p className="text-xs font-600 text-slate-500">
                          {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="px-4 py-4">
                        <button
                          className="view-btn flex items-center gap-1.5 text-xs font-700 text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 rounded-lg shadow-md shadow-indigo-500/20"
                          onClick={() => router.push(`/teacher/quiz-management/edit/${q.quiz.QuizID || q.quiz.quizId || q.quiz.id || q.quizId}`)}
                        >
                          <ExternalLink size={11} /> View
                        </button>
                      </div>
                    </div>

                    {/* Expanded answer options */}
                    {expanded[q.questionId] && (
                      <div className="px-5 pb-5 pt-1 bg-slate-50/60 border-t border-slate-100">
                        <p className="text-[11px] font-800 uppercase tracking-widest text-slate-400 mb-2.5">Answer Options</p>
                        <AnswerOptions options={q.options} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Pagination ── */}
            {pagination.totalPages > 1 && (
              <div className="fu-5 flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/40">
                <p className="text-xs font-600 text-slate-500">
                  Page <strong className="text-indigo-600">{pagination.page}</strong> of {pagination.totalPages}
                  <span className="text-slate-300 mx-1">·</span>{pagination.total} questions
                </p>
                <div className="flex items-center gap-2">
                  {/* Prev */}
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    className="px-3 py-1.5 text-xs font-700 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    ← Prev
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                        className={`w-8 h-8 text-xs font-700 rounded-lg border transition-all ${
                          p === pagination.page
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/25'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    className="px-3 py-1.5 text-xs font-700 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}