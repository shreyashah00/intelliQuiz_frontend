'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import { userAPI, fileAPI, quizAPI } from '../../utils/api';
import {
  FileText,
  PlusCircle,
  ClipboardList,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  ArrowRight,
  Brain,
  Zap,
  Trophy
} from 'lucide-react';

/* ─── Floating orb background ─── */
const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
    <div
      style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 520, height: 520,
        background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'floatA 14s ease-in-out infinite',
      }}
    />
    <div
      style={{
        position: 'absolute', bottom: '5%', left: '-8%',
        width: 420, height: 420,
        background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'floatB 18s ease-in-out infinite',
      }}
    />
    <div
      style={{
        position: 'absolute', top: '40%', left: '40%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'floatA 22s ease-in-out infinite reverse',
      }}
    />
    <style>{`
      @keyframes floatA {
        0%,100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-30px) scale(1.04); }
      }
      @keyframes floatB {
        0%,100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(24px) scale(0.97); }
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(22px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes pulse-ring {
        0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.18); }
        50%      { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
      }
      .anim-1 { animation: fadeSlideUp 0.55s cubic-bezier(.22,1,.36,1) both; }
      .anim-2 { animation: fadeSlideUp 0.55s cubic-bezier(.22,1,.36,1) 0.08s both; }
      .anim-3 { animation: fadeSlideUp 0.55s cubic-bezier(.22,1,.36,1) 0.16s both; }
      .anim-4 { animation: fadeSlideUp 0.55s cubic-bezier(.22,1,.36,1) 0.24s both; }
      .anim-5 { animation: fadeSlideUp 0.55s cubic-bezier(.22,1,.36,1) 0.32s both; }
      .anim-6 { animation: fadeSlideUp 0.55s cubic-bezier(.22,1,.36,1) 0.40s both; }
      .stat-card:hover { transform: translateY(-6px); }
      .action-btn:hover .arrow-icon { transform: translateX(4px); }
      .action-btn:hover .btn-icon { transform: scale(1.12); }
    `}</style>
  </div>
);

/* ─── Stat Card ─── */
const StatCard = ({ stat, delay }) => {
  const IconComponent = stat.icon;
  return (
    <div
      className="stat-card"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(16px)',
        borderRadius: 20,
        padding: '24px',
        border: '1px solid rgba(226,232,240,0.7)',
        boxShadow: '0 4px 24px rgba(99,102,241,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        transition: 'transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease',
        animation: `fadeSlideUp 0.55s cubic-bezier(.22,1,.36,1) ${delay}s both`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>
            {stat.title}
          </p>
          <p style={{ fontSize: 36, fontWeight: 800, color: stat.valueColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {stat.value}
          </p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{stat.sub}</p>
        </div>
        <div style={{
          width: 48, height: 48,
          background: stat.iconBg,
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 20px ${stat.shadowColor}`,
          flexShrink: 0,
          animation: 'pulse-ring 3s ease-in-out infinite',
        }}>
          <IconComponent size={22} color="#fff" />
        </div>
      </div>
      {/* mini progress bar */}
      <div style={{ marginTop: 18, height: 3, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${stat.bar}%`,
          background: stat.barColor,
          borderRadius: 10,
          transition: 'width 1.2s cubic-bezier(.22,1,.36,1)',
        }} />
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export default function TeacherDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalFiles: 0, totalQuizzes: 0, activeQuizzes: 0, totalStudents: 0 });
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good day');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, filesRes] = await Promise.all([
        userAPI.getProfile(),
        fileAPI.getUserFiles().catch(() => ({ data: { success: false, data: [] } }))
      ]);
      if (profileRes.data.success) setProfile(profileRes.data.data);
      if (filesRes.data.success) {
        const filesData = filesRes.data.data?.files || [];
        setRecentFiles(filesData.slice(0, 5));
        setStats(prev => ({ ...prev, totalFiles: filesData.length }));
      }
      try {
        const quizzesRes = await quizAPI.getAllQuizzes();
        if (quizzesRes.data.success) {
          const quizzes = quizzesRes.data.data || [];
          setStats(prev => ({ ...prev, totalQuizzes: quizzes.length, activeQuizzes: quizzes.filter(q => q.IsPublished).length }));
        }
      } catch {}
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRecentFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Files', value: stats.totalFiles, sub: 'Documents uploaded',
      icon: FileText, iconBg: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      valueColor: '#3b82f6', shadowColor: 'rgba(99,102,241,0.25)',
      barColor: 'linear-gradient(90deg,#3b82f6,#6366f1)', bar: 65,
    },
    {
      title: 'Total Quizzes', value: stats.totalQuizzes, sub: 'All time created',
      icon: BookOpen, iconBg: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      valueColor: '#6366f1', shadowColor: 'rgba(99,102,241,0.25)',
      barColor: 'linear-gradient(90deg,#6366f1,#8b5cf6)', bar: 50,
    },
    {
      title: 'Active Quizzes', value: stats.activeQuizzes, sub: 'Currently published',
      icon: CheckCircle, iconBg: 'linear-gradient(135deg,#10b981,#059669)',
      valueColor: '#059669', shadowColor: 'rgba(16,185,129,0.25)',
      barColor: 'linear-gradient(90deg,#10b981,#059669)', bar: 80,
    },
    {
      title: 'Students Reached', value: stats.totalStudents || '50+', sub: 'Across all quizzes',
      icon: Users, iconBg: 'linear-gradient(135deg,#a855f7,#7c3aed)',
      valueColor: '#7c3aed', shadowColor: 'rgba(168,85,247,0.25)',
      barColor: 'linear-gradient(90deg,#a855f7,#7c3aed)', bar: 70,
    },
  ];

  const quickActions = [
    {
      title: 'Upload Document', description: 'PDFs, Word docs, text files',
      href: '/file-management', icon: FileText,
      accent: '#3b82f6', iconBg: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      tag: 'Files',
    },
    {
      title: 'Generate Quiz', description: 'AI-powered quiz creation',
      href: '/teacher/generate-quiz', icon: PlusCircle,
      accent: '#6366f1', iconBg: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      tag: 'AI',
    },
    {
      title: 'Manage Quizzes', description: 'Edit, publish, or archive',
      href: '/teacher/quiz-management', icon: ClipboardList,
      accent: '#8b5cf6', iconBg: 'linear-gradient(135deg,#8b5cf6,#a855f7)',
      tag: 'Manage',
    },
    {
      title: 'Leaderboards', description: 'Real-time student rankings',
      href: '/teacher/leaderboard', icon: Trophy,
      accent: '#f59e0b', iconBg: 'linear-gradient(135deg,#f59e0b,#ef4444)',
      tag: 'Live',
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <DashboardLayout role="teacher">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              border: '3px solid #e2e8f0',
              borderTopColor: '#6366f1',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <Orbs />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '4px 0' }}>

          {/* ── Hero Banner ── */}
          <div
            className="anim-1"
            style={{
              position: 'relative', overflow: 'hidden',
              borderRadius: 26,
              background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 45%, #7c3aed 100%)',
              padding: '36px 40px',
              boxShadow: '0 20px 60px rgba(79,70,229,0.30)',
            }}
          >
            {/* decorative circles */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 240, height: 240,
              background: 'rgba(255,255,255,0.07)', borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute', bottom: -80, left: 120,
              width: 200, height: 200,
              background: 'rgba(255,255,255,0.05)', borderRadius: '50%',
            }} />
            {/* shimmer stripe */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 4s linear infinite',
            }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 60, height: 60,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Brain size={28} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'rgba(199,210,254,0.9)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 4 }}>
                  {greeting} ✦
                </p>
                <h1 style={{
                  fontSize: 28, fontWeight: 800, color: '#fff',
                  letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0,
                }}>
                  {profile?.FirstName || profile?.Username || 'Teacher'}!
                </h1>
                <p style={{ fontSize: 15, color: 'rgba(199,210,254,0.85)', marginTop: 6, fontWeight: 500 }}>
                  Ready to inspire? Your students are waiting. 🚀
                </p>
              </div>

              {/* Right pill badges */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexShrink: 0 }}>
                {[
                  { label: `${stats.totalQuizzes} Quizzes`, color: 'rgba(255,255,255,0.15)' },
                  { label: `${stats.activeQuizzes} Active`, color: 'rgba(16,185,129,0.35)' },
                ].map((badge, i) => (
                  <div key={i} style={{
                    padding: '8px 16px',
                    background: badge.color,
                    backdropFilter: 'blur(8px)',
                    borderRadius: 50,
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                    whiteSpace: 'nowrap',
                  }}>
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stats Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18 }}>
            {statCards.map((stat, i) => (
              <StatCard key={i} stat={stat} delay={0.08 * i} />
            ))}
          </div>

          {/* ── Two-col section ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Quick Actions */}
            <div
              className="anim-4"
              style={{
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                padding: '28px 28px',
                border: '1px solid rgba(226,232,240,0.7)',
                boxShadow: '0 4px 24px rgba(99,102,241,0.07)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <div style={{
                  width: 34, height: 34,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={17} color="#fff" />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.01em' }}>
                  Quick Actions
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quickActions.map((action, i) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={i}
                      className="action-btn"
                      onClick={() => router.push(action.href)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px',
                        background: 'rgba(248,250,252,0.8)',
                        border: '1px solid rgba(226,232,240,0.8)',
                        borderRadius: 14,
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(.22,1,.36,1)',
                        textAlign: 'left',
                        width: '100%',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `rgba(${action.accent === '#3b82f6' ? '59,130,246' : action.accent === '#6366f1' ? '99,102,241' : action.accent === '#8b5cf6' ? '139,92,246' : '245,158,11'},0.07)`;
                        e.currentTarget.style.borderColor = action.accent + '55';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(248,250,252,0.8)';
                        e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div
                        className="btn-icon"
                        style={{
                          width: 38, height: 38, flexShrink: 0,
                          background: action.iconBg,
                          borderRadius: 11,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: `0 4px 14px ${action.accent}30`,
                          transition: 'transform 0.25s ease',
                        }}
                      >
                        <IconComponent size={18} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>{action.title}</p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>{action.description}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: action.accent,
                          background: action.accent + '15',
                          padding: '3px 8px', borderRadius: 20,
                          letterSpacing: '0.03em',
                        }}>
                          {action.tag}
                        </span>
                        <ArrowRight
                          className="arrow-icon"
                          size={15}
                          color="#cbd5e1"
                          style={{ transition: 'transform 0.25s ease, color 0.25s ease', flexShrink: 0 }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Files */}
            <div
              className="anim-5"
              style={{
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                padding: '28px 28px',
                border: '1px solid rgba(226,232,240,0.7)',
                boxShadow: '0 4px 24px rgba(99,102,241,0.07)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34,
                    background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Clock size={17} color="#fff" />
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: 0 }}>Recent Files</h2>
                </div>
                <button
                  onClick={() => router.push('/file-management')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 13, fontWeight: 700, color: '#6366f1',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                    borderRadius: 8, transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  View all <ArrowRight size={13} />
                </button>
              </div>

              {recentFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentFiles.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px',
                        background: 'rgba(248,250,252,0.8)',
                        border: '1px solid rgba(226,232,240,0.7)',
                        borderRadius: 13,
                        animation: `fadeSlideUp 0.5s cubic-bezier(.22,1,.36,1) ${0.35 + i * 0.07}s both`,
                        transition: 'border-color 0.2s, background 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = 'rgba(238,242,255,0.7)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(226,232,240,0.7)'; e.currentTarget.style.background = 'rgba(248,250,252,0.8)'; }}
                    >
                      <div style={{
                        width: 36, height: 36, flexShrink: 0,
                        background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FileText size={16} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.FileName}
                        </p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                          {new Date(file.UploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/file-details/${file.FileID}`)}
                        style={{
                          width: 28, height: 28, flexShrink: 0,
                          background: 'rgba(99,102,241,0.1)',
                          border: 'none', borderRadius: 8, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                      >
                        <ArrowRight size={13} color="#6366f1" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{
                    width: 56, height: 56, margin: '0 auto 14px',
                    background: 'rgba(99,102,241,0.08)',
                    borderRadius: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={24} color="#a5b4fc" />
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600, marginBottom: 16 }}>No files uploaded yet</p>
                  <button
                    onClick={() => router.push('/file-management')}
                    style={{
                      padding: '10px 22px',
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      color: '#fff', border: 'none', borderRadius: 12,
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.3)'; }}
                  >
                    Upload Your First File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Performance Overview ── */}
          <div
            className="anim-6"
            style={{
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(20px)',
              borderRadius: 24,
              padding: '28px 32px',
              border: '1px solid rgba(226,232,240,0.7)',
              boxShadow: '0 4px 24px rgba(99,102,241,0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{
                width: 34, height: 34,
                background: 'linear-gradient(135deg,#10b981,#059669)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp size={17} color="#fff" />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: 0 }}>Performance Overview</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                {
                  value: '95%', label: 'Success Rate', sub: 'AI Quiz Generation',
                  icon: CheckCircle, bg: 'linear-gradient(135deg,#10b981,#059669)',
                  shadow: 'rgba(16,185,129,0.22)', color: '#059669',
                  fillColor: '#10b981', fill: 95,
                },
                {
                  value: '5 min', label: 'Avg. Creation Time', sub: 'Per Quiz',
                  icon: Clock, bg: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  shadow: 'rgba(59,130,246,0.22)', color: '#3b82f6',
                  fillColor: '#3b82f6', fill: 60,
                },
                {
                  value: '85%', label: 'Engagement', sub: 'Average Score',
                  icon: Users, bg: 'linear-gradient(135deg,#a855f7,#7c3aed)',
                  shadow: 'rgba(168,85,247,0.22)', color: '#7c3aed',
                  fillColor: '#a855f7', fill: 85,
                },
              ].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={i}
                    style={{
                      padding: '22px 20px',
                      background: 'rgba(248,250,252,0.8)',
                      border: '1px solid rgba(226,232,240,0.7)',
                      borderRadius: 18,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${item.shadow}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{
                        width: 42, height: 42,
                        background: item.bg,
                        borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 6px 18px ${item.shadow}`,
                      }}>
                        <IconComponent size={20} color="#fff" />
                      </div>
                      <span style={{
                        fontSize: 28, fontWeight: 900, color: item.color,
                        letterSpacing: '-0.03em', lineHeight: 1,
                      }}>
                        {item.value}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 14px', fontWeight: 500 }}>{item.sub}</p>
                    {/* Progress track */}
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${item.fill}%`,
                        background: `linear-gradient(90deg, ${item.fillColor}, ${item.color})`,
                        borderRadius: 10,
                        transition: 'width 1.4s cubic-bezier(.22,1,.36,1)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}