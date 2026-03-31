'use client';
import { useEffect, useRef, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import QuizLeaderboard from '../../components/leaderboard/QuizLeaderboard';
import GroupLeaderboard from '../../components/leaderboard/GroupLeaderboard';
import { leaderboardAPI, quizAPI, groupAPI } from '../../../utils/api';
import {
  initializeSocket, subscribeLiveActivities, unsubscribeLiveActivities,
  subscribeToSocketEvent, disconnectSocket, authenticateSocket,
} from '../../../utils/socket';
import { Trophy, Users, RefreshCw, Filter, TrendingUp, AlertCircle, Wifi, WifiOff, ChevronDown, Zap, BarChart3 } from 'lucide-react';

/* ─── Keyframe Styles ─── */
const Styles = () => (
  <style>{`
    @keyframes floatA  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-26px) scale(1.03)} }
    @keyframes floatB  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(20px) scale(0.97)} }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn { from{opacity:0;transform:scale(.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes spinSlow{ to{transform:rotate(360deg)} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.35)} 50%{box-shadow:0 0 0 7px rgba(16,185,129,0)} }
    @keyframes barIn   { from{width:0} }
    @keyframes ticker  {
      0%  { transform:translateX(0) }
      100%{ transform:translateX(-50%) }
    }

    .fu-1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .04s both}
    .fu-2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .11s both}
    .fu-3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .18s both}
    .fu-4{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .25s both}

    .tab-btn { transition: all .22s cubic-bezier(.22,1,.36,1); }
    .refresh-btn { transition: all .2s cubic-bezier(.22,1,.36,1); }
    .refresh-btn:hover:not(:disabled) { transform: translateY(-2px); }
    .refresh-btn:disabled { opacity:.5; cursor:not-allowed; }

    .select-el:focus { outline:none; border-color:#6366f1!important; box-shadow:0 0 0 3px rgba(99,102,241,.12)!important; }

    .live-dot { animation: livePulse 2s ease-in-out infinite; }

    .shimmer-card {
      background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .empty-card { animation: scaleIn .35s cubic-bezier(.22,1,.36,1) both; }

    .ticker-inner { animation: ticker 22s linear infinite; }
    .ticker-inner:hover { animation-play-state: paused; }
  `}</style>
);

/* ─── Floating Orbs ─── */
const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
    <div style={{position:'absolute',top:'-8%',right:'-4%',width:500,height:500,background:'radial-gradient(circle,rgba(99,102,241,.11) 0%,transparent 70%)',borderRadius:'50%',animation:'floatA 15s ease-in-out infinite'}}/>
    <div style={{position:'absolute',bottom:'5%',left:'-6%',width:400,height:400,background:'radial-gradient(circle,rgba(59,130,246,.09) 0%,transparent 70%)',borderRadius:'50%',animation:'floatB 20s ease-in-out infinite'}}/>
    <div style={{position:'absolute',top:'40%',left:'35%',width:300,height:300,background:'radial-gradient(circle,rgba(245,158,11,.06) 0%,transparent 70%)',borderRadius:'50%',animation:'floatA 25s ease-in-out infinite reverse'}}/>
  </div>
);

/* ─── Glass Card ─── */
const GlassCard = ({ children, className = '', style = {} }) => (
  <div className={`bg-white/75 backdrop-blur-xl rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(99,102,241,.07)] ${className}`} style={style}>
    {children}
  </div>
);

/* ─── Native Select ─── */
const StyledSelect = ({ value, onChange, children, placeholder }) => (
  <div className="relative flex-1">
    <select
      className="select-el w-full appearance-none bg-white/80 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-600 text-slate-700 pr-9 cursor-pointer transition-all"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{backdropFilter:'blur(10px)'}}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
  </div>
);

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon: Icon, grad, barGrad, fill, delay }) => (
  <GlassCard className="p-5" style={{animation:`fadeUp .5s cubic-bezier(.22,1,.36,1) ${delay}s both`,transition:'transform .28s cubic-bezier(.22,1,.36,1)',cursor:'default'}}
    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-5px)'}
    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
  >
    <div className="flex items-start justify-between mb-3">
      <p className="text-[10px] font-800 uppercase tracking-widest text-slate-400">{label}</p>
      <div className={`w-8 h-8 rounded-[10px] bg-gradient-to-br ${grad} flex items-center justify-center shadow-md flex-shrink-0`}>
        <Icon size={15} color="#fff"/>
      </div>
    </div>
    <p className="text-3xl font-900 text-slate-800 leading-none tracking-tight mb-3">{value}</p>
    <div className="h-[3px] bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full bg-gradient-to-r ${barGrad} rounded-full`} style={{width:`${fill}%`,animation:'barIn 1.2s cubic-bezier(.22,1,.36,1) both'}}/>
    </div>
  </GlassCard>
);

/* ─── Live Ticker ─── */
const LiveTicker = ({ quizzes, groups }) => {
  const items = [
    ...quizzes.slice(0,5).map(q => `🏆 ${q.Title}`),
    ...groups.slice(0,5).map(g => `👥 ${g.Name || g.GroupName}`),
  ];
  if (!items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden bg-gradient-to-r from-indigo-500/8 via-purple-500/8 to-blue-500/8 border border-indigo-200/50 rounded-xl px-0 py-2.5 mb-1">
      <div className="flex gap-8 ticker-inner whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-xs font-700 text-indigo-600 px-4">{item}</span>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   Main Component
════════════════════════════════════════ */
export default function TeacherLeaderboard() {
  const [activeTab, setActiveTab]       = useState('quiz');
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [quizLeaderboards, setQuizLeaderboards] = useState([]);
  const [groupLeaderboards, setGroupLeaderboards] = useState([]);
  const [quizzes, setQuizzes]           = useState([]);
  const [groups, setGroups]             = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [socketConnected, setSocketConnected]       = useState(false);
  const [socketAuthenticated, setSocketAuthenticated] = useState(false);

  const quizCursorRef         = useRef(null);
  const groupCursorRef        = useRef(null);
  const activeSubscriptionRef = useRef(null);
  const socketUnsubscribersRef = useRef([]);
  const selectedQuizRef       = useRef('');
  const selectedGroupRef      = useRef('');

  useEffect(() => { selectedQuizRef.current  = selectedQuiz;  }, [selectedQuiz]);
  useEffect(() => { selectedGroupRef.current = selectedGroup; }, [selectedGroup]);

  useEffect(() => {
    fetchInitialData();
    const cleanup = setupRealtimeUpdates();
    return () => {
      if (typeof cleanup === 'function') cleanup();
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (!socketConnected || !socketAuthenticated) return;
    if (activeSubscriptionRef.current) {
      unsubscribeLiveActivities(activeSubscriptionRef.current);
      activeSubscriptionRef.current = null;
    }
    if (activeTab === 'quiz' && selectedQuiz) {
      const payload = { connectionType:'quiz_leaderboard', quizId:Number(selectedQuiz), intervalSeconds:10, cursorAt:quizCursorRef.current||undefined };
      subscribeLiveActivities(payload);
      activeSubscriptionRef.current = { connectionType:'quiz_leaderboard', quizId:Number(selectedQuiz) };
    }
    if (activeTab === 'group' && selectedGroup) {
      const payload = { connectionType:'group_leaderboard', groupId:Number(selectedGroup), intervalSeconds:15, cursorAt:groupCursorRef.current||undefined };
      subscribeLiveActivities(payload);
      activeSubscriptionRef.current = { connectionType:'group_leaderboard', groupId:Number(selectedGroup) };
    }
    return () => {
      if (activeSubscriptionRef.current) { unsubscribeLiveActivities(activeSubscriptionRef.current); activeSubscriptionRef.current = null; }
    };
  }, [activeTab, selectedQuiz, selectedGroup, socketConnected, socketAuthenticated]);

  const setupRealtimeUpdates = () => {
    try {
      const socket = initializeSocket();
      socket.on('connect',    () => { setSocketConnected(true);  setSocketAuthenticated(false); authenticateSocket(); });
      socket.on('disconnect', () => { setSocketConnected(false); setSocketAuthenticated(false); });

      const u1 = subscribeToSocketEvent('socketAuthenticated',       p => setSocketAuthenticated(Boolean(p?.success)));
      const u2 = subscribeToSocketEvent('socketAuthenticationError', () => setSocketAuthenticated(false));
      const u3 = subscribeToSocketEvent('liveActivitySubscribed',    p => {
        if (p?.data?.connectionType==='quiz_leaderboard'  && p?.data?.cursorAt) quizCursorRef.current  = p.data.cursorAt;
        if (p?.data?.connectionType==='group_leaderboard' && p?.data?.cursorAt) groupCursorRef.current = p.data.cursorAt;
      });
      const u4 = subscribeToSocketEvent('quizLeaderboardActivity', p => {
        if (!p?.success || p?.connectionType!=='quiz_leaderboard') return;
        if (p?.cursorAt) quizCursorRef.current = p.cursorAt;
        const curId   = Number(selectedQuizRef.current);
        const actId   = Number(p?.data?.submissions?.[0]?.quizId || p?.quizId || 0);
        const subs    = Array.isArray(p?.data?.submissions) ? p.data.submissions : [];
        if (curId && actId && curId===actId && subs.length>0) {
          setQuizLeaderboards(prev => {
            const map = new Map((Array.isArray(prev)?prev:[]).map(i=>[Number(i?.userId||i?.UserID||0),i]));
            for (const s of subs) {
              const uid=Number(s?.userId||0); if(!uid) continue;
              map.set(uid,{...map.get(uid),...s,timeSpent:s.timeSpentSeconds??s.timeSpent,timeSpentSeconds:s.timeSpentSeconds??s.timeSpent,timeSpentFormatted:s.timeSpentFormatted});
            }
            return Array.from(map.values());
          });
          return;
        }
        if (curId && p?.hasUpdates) fetchQuizLeaderboard(curId, {skipSubscribe:true});
      });
      const u5 = subscribeToSocketEvent('quizLeaderboardNoResponse', p => { if(p?.cursorAt) quizCursorRef.current=p.cursorAt; });
      const u6 = subscribeToSocketEvent('groupLeaderboardActivity',  p => {
        if (!p?.success || p?.connectionType!=='group_leaderboard') return;
        if (p?.cursorAt) groupCursorRef.current=p.cursorAt;
        if (Number(selectedGroupRef.current) && p?.hasUpdates) fetchGroupLeaderboard(Number(selectedGroupRef.current),{skipSubscribe:true});
      });

      socketUnsubscribersRef.current = [u1,u2,u3,u4,u5,u6];
      if (socket.connected) { setSocketConnected(true); authenticateSocket(); }

      return () => {
        socket.off('connect'); socket.off('disconnect');
        socketUnsubscribersRef.current.forEach(u=>u());
        socketUnsubscribersRef.current=[];
      };
    } catch(e) { console.error('Error setting up real-time updates:',e); }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [qRes, gRes] = await Promise.all([
        quizAPI.getAllQuizzes().catch(()=>({data:{success:false,data:[]}})),
        groupAPI.getGroups().catch(()=>({data:{success:false,data:[]}})),
      ]);
      if (qRes.data.success) setQuizzes(qRes.data.data.filter(q=>q.IsPublished));
      if (gRes.data.success) setGroups(gRes.data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchQuizLeaderboard = async (quizId, opts={}) => {
    if (!quizId) return;
    try {
      setRefreshing(true);
      const r = await leaderboardAPI.getQuizLeaderboard(quizId);
      if (r.data.success) {
        setQuizLeaderboards(r.data.data?.leaderboard||[]);
        setSelectedQuiz(Number(quizId)); setActiveTab('quiz');
        if (!opts.skipSubscribe && socketConnected && socketAuthenticated) {
          if (activeSubscriptionRef.current) unsubscribeLiveActivities(activeSubscriptionRef.current);
          subscribeLiveActivities({connectionType:'quiz_leaderboard',quizId:Number(quizId),intervalSeconds:10,cursorAt:quizCursorRef.current||undefined});
          activeSubscriptionRef.current={connectionType:'quiz_leaderboard',quizId:Number(quizId)};
        }
      } else { setQuizLeaderboards([]); }
    } catch(e) { console.error(e); setQuizLeaderboards([]); }
    finally { setRefreshing(false); }
  };

  const fetchGroupLeaderboard = async (groupId, opts={}) => {
    if (!groupId) return;
    try {
      setRefreshing(true);
      const r = await leaderboardAPI.getGroupLeaderboard(groupId);
      if (r.data.success) {
        setGroupLeaderboards(r.data.data?.leaderboard||[]);
        setSelectedGroup(Number(groupId)); setActiveTab('group');
        if (!opts.skipSubscribe && socketConnected && socketAuthenticated) {
          if (activeSubscriptionRef.current) unsubscribeLiveActivities(activeSubscriptionRef.current);
          subscribeLiveActivities({connectionType:'group_leaderboard',groupId:Number(groupId),intervalSeconds:15,cursorAt:groupCursorRef.current||undefined});
          activeSubscriptionRef.current={connectionType:'group_leaderboard',groupId:Number(groupId)};
        }
      } else { setGroupLeaderboards([]); }
    } catch(e) { console.error(e); setGroupLeaderboards([]); }
    finally { setRefreshing(false); }
  };

  const handleRefresh = () => {
    if (activeTab==='quiz'  && selectedQuiz)  fetchQuizLeaderboard(selectedQuiz);
    if (activeTab==='group' && selectedGroup) fetchGroupLeaderboard(selectedGroup);
  };

  const isLive = socketConnected && socketAuthenticated;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <DashboardLayout role="teacher">
          <Styles/><Orbs/>
          <div className="flex flex-col gap-6 py-1">
            <div className="h-28 shimmer-card rounded-2xl"/>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-28 shimmer-card rounded-2xl"/>)}</div>
            <div className="h-20 shimmer-card rounded-2xl"/>
            <div className="h-64 shimmer-card rounded-2xl"/>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <Styles/><Orbs/>

        <div className="flex flex-col gap-5 py-1">

          {/* ── Hero Banner ── */}
          <div className="fu-1 relative overflow-hidden rounded-2xl p-7"
            style={{background:'linear-gradient(135deg,#1e40af 0%,#4f46e5 45%,#7c3aed 100%)',boxShadow:'0 20px 60px rgba(79,70,229,.30)'}}>
            {/* deco circles */}
            <div style={{position:'absolute',top:-60,right:-60,width:220,height:220,background:'rgba(255,255,255,.07)',borderRadius:'50%'}}/>
            <div style={{position:'absolute',bottom:-80,left:100,width:180,height:180,background:'rgba(255,255,255,.05)',borderRadius:'50%'}}/>
            {/* shimmer sweep */}
            <div style={{position:'absolute',inset:0,background:'linear-gradient(105deg,transparent 40%,rgba(255,255,255,.06) 50%,transparent 60%)',backgroundSize:'200% 100%',animation:'shimmer 4s linear infinite'}}/>

            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[18px] bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={26} color="#fff"/>
                </div>
                <div>
                  <p className="text-indigo-200 text-xs font-700 uppercase tracking-widest mb-1">Performance Hub</p>
                  <h1 className="text-2xl font-900 text-white tracking-tight leading-tight">Leaderboards</h1>
                  <p className="text-indigo-200/85 text-sm font-500 mt-0.5">Track student rankings in real‑time</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Live indicator */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-700 border backdrop-blur-sm ${isLive ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' : 'bg-white/10 border-white/20 text-white/60'}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLive ? 'bg-emerald-400 live-dot' : 'bg-white/40'}`}/>
                  {isLive ? (
                    <span className="flex items-center gap-1"><Zap size={12}/> Live</span>
                  ) : (
                    <span className="flex items-center gap-1"><WifiOff size={12}/> Offline</span>
                  )}
                </div>

                {/* Refresh */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing || (!selectedQuiz && !selectedGroup)}
                  className="refresh-btn flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white rounded-xl text-sm font-700 backdrop-blur-sm"
                >
                  <RefreshCw size={14} style={refreshing?{animation:'spin .7s linear infinite'}:{}}/>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Published Quizzes" value={quizzes.length}  icon={Trophy}   grad="from-blue-500 to-indigo-600"   barGrad="from-blue-400 to-indigo-500"   fill={70} delay={.08}/>
            <StatCard label="Groups"            value={groups.length}  icon={Users}    grad="from-violet-500 to-purple-600" barGrad="from-violet-400 to-purple-500" fill={55} delay={.13}/>
            <StatCard label="Rankings Shown"    value={quizLeaderboards.length || groupLeaderboards.length} icon={BarChart3} grad="from-emerald-500 to-teal-600" barGrad="from-emerald-400 to-teal-500" fill={80} delay={.18}/>
            <StatCard label="Connection" value={isLive?'Live':'Offline'} icon={isLive?Wifi:WifiOff} grad={isLive?"from-emerald-500 to-teal-600":"from-slate-400 to-slate-500"} barGrad={isLive?"from-emerald-400 to-teal-500":"from-slate-300 to-slate-400"} fill={isLive?100:30} delay={.23}/>
          </div>

          {/* ── Live ticker ── */}
          {(quizzes.length > 0 || groups.length > 0) && <LiveTicker quizzes={quizzes} groups={groups}/>}

          {/* ── Tab + Filter card ── */}
          <GlassCard className="fu-3 overflow-hidden">
            {/* Tab strip */}
            <div className="flex border-b border-slate-100/80 px-2 pt-2 gap-1">
              {[
                { id:'quiz',  label:'Quiz Leaderboard',  icon:Trophy },
                { id:'group', label:'Group Leaderboard', icon:Users  },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn flex items-center gap-2 px-5 py-3 text-sm font-700 rounded-t-xl border-b-2 ${
                      active
                        ? 'text-indigo-600 border-indigo-500 bg-indigo-50/60'
                        : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50/60'
                    }`}
                  >
                    <Icon size={16}/>
                    {tab.label}
                    {active && (
                      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"/>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filter row */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Filter size={15} color="#fff"/>
              </div>
              <span className="text-xs font-800 uppercase tracking-widest text-slate-500 whitespace-nowrap">
                Select {activeTab === 'quiz' ? 'Quiz' : 'Group'}
              </span>

              {activeTab === 'quiz' ? (
                <StyledSelect value={selectedQuiz} onChange={v => v && fetchQuizLeaderboard(Number(v))} placeholder="Choose a quiz…">
                  {quizzes.map(q => <option key={q.QuizID} value={q.QuizID}>{q.Title}</option>)}
                </StyledSelect>
              ) : (
                <StyledSelect value={selectedGroup} onChange={v => v && fetchGroupLeaderboard(Number(v))} placeholder="Choose a group…">
                  {groups.map(g => <option key={g.GroupID} value={g.GroupID}>{g.GroupName || g.Name}</option>)}
                </StyledSelect>
              )}

              {/* Mini live badge inline */}
              {isLive && (selectedQuiz || selectedGroup) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                  <span className="text-[11px] font-700 text-emerald-600">Auto‑updating</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* ── Content ── */}
          <div className="fu-4">
            {activeTab === 'quiz' && (
              selectedQuiz ? (
                <GlassCard className="overflow-hidden">
                  {refreshing ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div style={{width:40,height:40,border:'3px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                      <p className="text-sm text-slate-400 font-600">Loading leaderboard…</p>
                    </div>
                  ) : (
                    <QuizLeaderboard
                      data={quizLeaderboards}
                      quizTitle={quizzes.find(q=>Number(q.QuizID)===Number(selectedQuiz))?.Title}
                    />
                  )}
                </GlassCard>
              ) : (
                <EmptyState
                  icon={Trophy}
                  title="Select a Quiz"
                  desc="Choose a published quiz from the dropdown above to view its live leaderboard"
                  grad="from-blue-500 to-indigo-600"
                />
              )
            )}

            {activeTab === 'group' && (
              selectedGroup ? (
                <GlassCard className="overflow-hidden">
                  {refreshing ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div style={{width:40,height:40,border:'3px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                      <p className="text-sm text-slate-400 font-600">Loading leaderboard…</p>
                    </div>
                  ) : (
                    <GroupLeaderboard
                      data={groupLeaderboards}
                      groupName={groups.find(g=>Number(g.GroupID)===Number(selectedGroup))?.GroupName || groups.find(g=>Number(g.GroupID)===Number(selectedGroup))?.Name}
                    />
                  )}
                </GlassCard>
              ) : (
                <EmptyState
                  icon={Users}
                  title="Select a Group"
                  desc="Choose a group from the dropdown above to view the group leaderboard"
                  grad="from-violet-500 to-purple-600"
                />
              )
            )}
          </div>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

/* ─── Empty State ─── */
function EmptyState({ icon: Icon, title, desc, grad }) {
  return (
    <div className="empty-card">
      <GlassCard className="p-16 text-center">
        {/* Decorative rings */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-200 animate-spin" style={{animationDuration:'12s'}}/>
          <div className="absolute inset-3 rounded-full border border-slate-100"/>
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center shadow-xl`}>
            <Icon size={22} color="#fff"/>
          </div>
        </div>

        <h3 className="text-lg font-800 text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-400 font-500 max-w-xs mx-auto leading-relaxed">{desc}</p>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(3)].map((_,i)=>(
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" style={{animation:`fadeUp .5s cubic-bezier(.22,1,.36,1) ${.1+i*.1}s both`}}/>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}