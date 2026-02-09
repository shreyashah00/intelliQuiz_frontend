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
  AlertCircle,
  ArrowRight,
  Brain,
  Zap,
  Trophy
} from 'lucide-react';

export default function TeacherDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalStudents: 0,
  });
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, filesRes] = await Promise.all([
        userAPI.getProfile(),
        fileAPI.getUserFiles().catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }

      if (filesRes.data.success) {
        const filesData = filesRes.data.data?.files || [];
        setRecentFiles(filesData?.slice(0, 5));
        setStats(prev => ({ ...prev, totalFiles: filesData.length }));
      }

      // Fetch quizzes
      try {
        const quizzesRes = await quizAPI.getAllQuizzes();
        if (quizzesRes.data.success) {
          const quizzes = quizzesRes.data.data || [];
          const activeQuizzes = quizzes.filter(q => q.IsPublished).length;
          setStats(prev => ({ 
            ...prev, 
            totalQuizzes: quizzes.length,
            activeQuizzes: activeQuizzes
          }));
        }
      } catch (err) {
        console.log('Error fetching quizzes:', err);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRecentFiles([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <DashboardLayout role="teacher">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl -top-32 -right-32"></div>
              <div className="absolute w-48 h-48 bg-white rounded-full blur-3xl -bottom-24 -left-24"></div>
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Welcome back, {profile?.FirstName || profile?.Username}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Ready to create engaging quizzes and manage your educational content?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'Total Files', 
                value: stats.totalFiles, 
                icon: FileText, 
                color: 'from-blue-500 to-blue-600',
                bgColor: 'from-blue-50 to-blue-100',
                textColor: 'text-blue-700'
              },
              { 
                title: 'Total Quizzes', 
                value: stats.totalQuizzes, 
                icon: BookOpen, 
                color: 'from-indigo-500 to-indigo-600',
                bgColor: 'from-indigo-50 to-indigo-100',
                textColor: 'text-indigo-700'
              },
              { 
                title: 'Active Quizzes', 
                value: stats.activeQuizzes, 
                icon: CheckCircle, 
                color: 'from-green-500 to-green-600',
                bgColor: 'from-green-50 to-green-100',
                textColor: 'text-green-700'
              },
              { 
                title: 'Students Reached', 
                value: stats.totalStudents || '50+', 
                icon: Users, 
                color: 'from-purple-500 to-purple-600',
                bgColor: 'from-purple-50 to-purple-100',
                textColor: 'text-purple-700'
              }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.title}</p>
                      <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg shadow-${stat.color.split('-')[1]}-500/25`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-600" />
                Quick Actions
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Upload New Document',
                    description: 'Upload PDFs, Word docs, or text files to create quizzes',
                    href: '/file-management',
                    icon: FileText,
                    gradient: 'from-blue-500 to-blue-600'
                  },
                  {
                    title: 'Generate Quiz',
                    description: 'Create AI-powered quizzes from your documents',
                    href: '/teacher/generate-quiz',
                    icon: PlusCircle,
                    gradient: 'from-indigo-500 to-indigo-600'
                  },
                  {
                    title: 'Manage Quizzes',
                    description: 'Edit, publish, or archive your existing quizzes',
                    href: '/teacher/quiz-management',
                    icon: ClipboardList,
                    gradient: 'from-purple-500 to-purple-600'
                  },
                  {
                    title: 'View Leaderboards',
                    description: 'Track student performance with real-time rankings',
                    href: '/teacher/leaderboard',
                    icon: Trophy,
                    gradient: 'from-amber-500 to-orange-600'
                  }
                ].map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => router.push(action.href)}
                      className="w-full p-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{action.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Files */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-indigo-600" />
                  Recent Files
                </h2>
                <button
                  onClick={() => router.push('/file-management')}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {recentFiles.length > 0 ? (
                <div className="space-y-3">
                  {recentFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{file.FileName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(file.UploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/file-details/${file.FileID}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No files uploaded yet</p>
                  <button
                    onClick={() => router.push('/file-management')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    Upload Your First File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Performance Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-700 mb-2">95%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
                <div className="text-sm text-gray-500 mt-1">AI Quiz Generation</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-700 mb-2">5 min</div>
                <div className="text-gray-600 font-medium">Avg. Creation Time</div>
                <div className="text-sm text-gray-500 mt-1">Per Quiz</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-700 mb-2">85%</div>
                <div className="text-gray-600 font-medium">Student Engagement</div>
                <div className="text-sm text-gray-500 mt-1">Average Score</div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
