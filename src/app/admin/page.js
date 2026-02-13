'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import { adminAPI } from '../../utils/api';
import {
  Users,
  BookOpen,
  FileQuestion,
  Activity,
  TrendingUp,
  UserCheck,
  AlertCircle,
  BarChart3,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getSystemStats();
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch system stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout role="admin">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout role="admin">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl -top-32 -right-32"></div>
              <div className="absolute w-48 h-48 bg-white rounded-full blur-3xl -bottom-24 -left-24"></div>
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Admin Control Center 🛡️
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Monitor and manage your IntelliQuiz platform
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value={stats?.overview?.totalUsers || 0}
              icon={Users}
              color="from-blue-500 to-blue-600"
              bgColor="from-blue-50 to-blue-100"
              textColor="text-blue-700"
              subtitle={`${stats?.overview?.activeUsers || 0} active`}
            />
            <StatCard
              title="Total Quizzes"
              value={stats?.overview?.totalQuizzes || 0}
              icon={BookOpen}
              color="from-indigo-500 to-indigo-600"
              bgColor="from-indigo-50 to-indigo-100"
              textColor="text-indigo-700"
              subtitle={`${stats?.overview?.publishedQuizzes || 0} published`}
            />
            <StatCard
              title="Quiz Responses"
              value={stats?.overview?.totalQuizResponses || 0}
              icon={FileQuestion}
              color="from-purple-500 to-purple-600"
              bgColor="from-purple-50 to-purple-100"
              textColor="text-purple-700"
              subtitle="Total submissions"
            />
            <StatCard
              title="Students"
              value={stats?.userRoles?.student || 0}
              icon={UserCheck}
              color="from-green-500 to-green-600"
              bgColor="from-green-50 to-green-100"
              textColor="text-green-700"
              subtitle="Student accounts"
            />
            <StatCard
              title="Teachers"
              value={stats?.userRoles?.teacher || 0}
              icon={Users}
              color="from-orange-500 to-orange-600"
              bgColor="from-orange-50 to-orange-100"
              textColor="text-orange-700"
              subtitle="Teacher accounts"
            />
            <StatCard
              title="Total Files"
              value={stats?.overview?.totalFiles || 0}
              icon={Activity}
              color="from-pink-500 to-pink-600"
              bgColor="from-pink-50 to-pink-100"
              textColor="text-pink-700"
              subtitle="Uploaded documents"
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity Stats */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                <ActivityItem
                  label="New Users (Last 30 days)"
                  value={stats?.recentActivity?.newUsers || 0}
                  icon={Users}
                  color="text-blue-600"
                  bgColor="bg-blue-100"
                />
                <ActivityItem
                  label="New Quizzes (Last 30 days)"
                  value={stats?.recentActivity?.newQuizzes || 0}
                  icon={BookOpen}
                  color="text-indigo-600"
                  bgColor="bg-indigo-100"
                />
                <ActivityItem
                  label="Quiz Responses (Last 30 days)"
                  value={stats?.recentActivity?.quizResponses || 0}
                  icon={CheckCircle}
                  color="text-green-600"
                  bgColor="bg-green-100"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <QuickActionButton
                  title="Manage Users"
                  description="View and manage user accounts"
                  icon={Users}
                  onClick={() => router.push('/admin/users')}
                  gradient="from-blue-500 to-blue-600"
                />
                <QuickActionButton
                  title="View System Stats"
                  description="Detailed analytics and reports"
                  icon={BarChart3}
                  onClick={() => router.push('/admin/stats')}
                  gradient="from-indigo-500 to-indigo-600"
                />
                <QuickActionButton
                  title="Quiz Oversight"
                  description="Monitor and manage all quizzes"
                  icon={BookOpen}
                  onClick={() => router.push('/admin/quizzes')}
                  gradient="from-purple-500 to-purple-600"
                />
                <QuickActionButton
                  title="Question Review"
                  description="Review all quiz questions"
                  icon={FileQuestion}
                  onClick={() => router.push('/admin/questions')}
                  gradient="from-green-500 to-green-600"
                />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, bgColor, textColor, subtitle }) {
  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

// Activity Item Component
function ActivityItem({ label, value, icon: Icon, color, bgColor }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ title, description, icon: Icon, onClick, gradient }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 rounded-xl transition-all border border-gray-200 hover:border-blue-200 group"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-left flex-1">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </button>
  );
}
