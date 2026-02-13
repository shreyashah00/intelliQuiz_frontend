'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../../utils/api';
import {
  BarChart3,
  Users,
  BookOpen,
  FileQuestion,
  TrendingUp,
  Activity,
  UserCheck,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw,
  Download,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function SystemStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await adminAPI.getSystemStats();
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch system stats');
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
      setError(error.response?.data?.message || 'Failed to load system statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStats(true);
  };

  const exportStats = () => {
    if (!stats) return;

    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Statistics</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchStats()}
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                System Statistics
              </h1>
              <p className="text-gray-600 mt-1">Detailed analytics and system performance</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportStats}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>

          {/* Overview Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={stats?.overview?.totalUsers || 0}
                icon={Users}
                color="from-blue-500 to-blue-600"
                bgColor="from-blue-50 to-blue-100"
                textColor="text-blue-700"
              />
              <StatCard
                title="Active Users"
                value={stats?.overview?.activeUsers || 0}
                icon={UserCheck}
                color="from-green-500 to-green-600"
                bgColor="from-green-50 to-green-100"
                textColor="text-green-700"
                subtitle={`${((stats?.overview?.activeUsers / stats?.overview?.totalUsers) * 100 || 0).toFixed(1)}% of total`}
              />
              <StatCard
                title="Total Quizzes"
                value={stats?.overview?.totalQuizzes || 0}
                icon={BookOpen}
                color="from-indigo-500 to-indigo-600"
                bgColor="from-indigo-50 to-indigo-100"
                textColor="text-indigo-700"
              />
              <StatCard
                title="Published Quizzes"
                value={stats?.overview?.publishedQuizzes || 0}
                icon={CheckCircle}
                color="from-purple-500 to-purple-600"
                bgColor="from-purple-50 to-purple-100"
                textColor="text-purple-700"
                subtitle={`${((stats?.overview?.publishedQuizzes / stats?.overview?.totalQuizzes) * 100 || 0).toFixed(1)}% published`}
              />
              <StatCard
                title="Quiz Responses"
                value={stats?.overview?.totalQuizResponses || 0}
                icon={FileQuestion}
                color="from-pink-500 to-pink-600"
                bgColor="from-pink-50 to-pink-100"
                textColor="text-pink-700"
              />
              <StatCard
                title="Total Files"
                value={stats?.overview?.totalFiles || 0}
                icon={FileText}
                color="from-orange-500 to-orange-600"
                bgColor="from-orange-50 to-orange-100"
                textColor="text-orange-700"
              />
            </div>
          </div>

          {/* User Roles Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              User Role Distribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RoleCard
                role="Students"
                count={stats?.userRoles?.student || 0}
                total={stats?.overview?.totalUsers || 1}
                color="bg-indigo-500"
                icon={UserCheck}
              />
              <RoleCard
                role="Teachers"
                count={stats?.userRoles?.teacher || 0}
                total={stats?.overview?.totalUsers || 1}
                color="bg-blue-500"
                icon={Users}
              />
              <RoleCard
                role="Admins"
                count={stats?.userRoles?.admin || 0}
                total={stats?.overview?.totalUsers || 1}
                color="bg-purple-500"
                icon={UserCheck}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-600" />
              Recent Activity (Last 30 Days)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ActivityCard
                label="New Users"
                value={stats?.recentActivity?.newUsers || 0}
                icon={Users}
                color="text-blue-600"
                bgColor="bg-blue-100"
              />
              <ActivityCard
                label="New Quizzes"
                value={stats?.recentActivity?.newQuizzes || 0}
                icon={BookOpen}
                color="text-indigo-600"
                bgColor="bg-indigo-100"
              />
              <ActivityCard
                label="Quiz Responses"
                value={stats?.recentActivity?.quizResponses || 0}
                icon={FileQuestion}
                color="text-green-600"
                bgColor="bg-green-100"
              />
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Quiz Engagement
              </h2>
              <div className="space-y-4">
                <MetricRow
                  label="Average Responses per Quiz"
                  value={(stats?.overview?.totalQuizResponses / stats?.overview?.totalQuizzes || 0).toFixed(1)}
                />
                <MetricRow
                  label="Quiz Publication Rate"
                  value={`${((stats?.overview?.publishedQuizzes / stats?.overview?.totalQuizzes) * 100 || 0).toFixed(1)}%`}
                />
                <MetricRow
                  label="Active User Rate"
                  value={`${((stats?.overview?.activeUsers / stats?.overview?.totalUsers) * 100 || 0).toFixed(1)}%`}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                Content Metrics
              </h2>
              <div className="space-y-4">
                <MetricRow
                  label="Files per User"
                  value={(stats?.overview?.totalFiles / stats?.overview?.totalUsers || 0).toFixed(1)}
                />
                <MetricRow
                  label="Quizzes per Teacher"
                  value={(stats?.overview?.totalQuizzes / stats?.userRoles?.teacher || 0).toFixed(1)}
                />
                <MetricRow
                  label="Responses per Student"
                  value={(stats?.overview?.totalQuizResponses / stats?.userRoles?.student || 0).toFixed(1)}
                />
              </div>
            </div>
          </div>

          {/* Growth Trends */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Growth Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GrowthCard
                label="User Growth"
                value={stats?.recentActivity?.newUsers || 0}
                percentage={((stats?.recentActivity?.newUsers / stats?.overview?.totalUsers) * 100 || 0).toFixed(1)}
                trend="up"
              />
              <GrowthCard
                label="Quiz Creation"
                value={stats?.recentActivity?.newQuizzes || 0}
                percentage={((stats?.recentActivity?.newQuizzes / stats?.overview?.totalQuizzes) * 100 || 0).toFixed(1)}
                trend="up"
              />
              <GrowthCard
                label="Quiz Activity"
                value={stats?.recentActivity?.quizResponses || 0}
                percentage={((stats?.recentActivity?.quizResponses / stats?.overview?.totalQuizResponses) * 100 || 0).toFixed(1)}
                trend="up"
              />
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
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

// Role Card Component
function RoleCard({ role, count, total, color, icon: Icon }) {
  const percentage = ((count / total) * 100).toFixed(1);
  
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{count}</h3>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">{percentage}% of total users</p>
    </div>
  );
}

// Activity Card Component
function ActivityCard({ label, value, icon: Icon, color, bgColor }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}

// Metric Row Component
function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-lg font-bold text-blue-600">{value}</span>
    </div>
  );
}

// Growth Card Component
function GrowthCard({ label, value, percentage, trend }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-blue-200/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          +{percentage}%
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">in last 30 days</p>
    </div>
  );
}
