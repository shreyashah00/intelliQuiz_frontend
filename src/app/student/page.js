'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import { userAPI, quizResponseAPI, quizAPI, userGroupsAPI } from '../../utils/api';
import {
  BookOpen,
  TrendingUp,
  Clock,
  Trophy,
  Target,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
  Award,
  Brain,
  Sparkles,
  BarChart3,
  Mail,
  Users,
  UserCheck
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    quizzesCompleted: 0,
    averageScore: 0,
    totalQuizzes: 0,
    streak: 0,
    groupsCount: 0,
    pendingInvitations: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch profile
      const profileRes = await userAPI.getProfile();
      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }

      // Fetch user groups and pending invitations
      try {
        const groupsRes = await userGroupsAPI.getUserGroups();
        if (groupsRes.data.success) {
          const pendingInvs = groupsRes.data.data.pendingInvitations || [];
          setPendingInvitations(pendingInvs);
          setStats(prev => ({
            ...prev,
            groupsCount: (groupsRes.data.data.acceptedGroups || []).length,
            pendingInvitations: pendingInvs.length,
          }));
        }
      } catch (err) {
        console.log('Error fetching groups:', err);
      }

      // Fetch published quizzes for user (from groups)
      try {
        const quizzesRes = await quizAPI.getPublishedQuizzesForUser();
        if (quizzesRes.data.success) {
          const publishedQuizzes = quizzesRes.data.data || [];
          setStats(prev => ({ ...prev, totalQuizzes: publishedQuizzes.length }));
        }
      } catch (err) {
        console.log('Error fetching quizzes:', err);
      }

      // Fetch my quiz responses
      try {
        const responsesRes = await quizResponseAPI.getMyResponses({ page: 1, limit: 5 });
        if (responsesRes.data.success) {
          const responses = responsesRes.data.data.responses || responsesRes.data.data;
          const pagination = responsesRes.data.data.pagination;
          
          // Map responses to recent quizzes format
          const quizzes = responses.map(response => ({
            id: response.ResponseID,
            quizId: response.QuizID,
            title: response.Quiz?.Title || 'Quiz',
            score: response.TotalScore || 0,
            percentage: response.Percentage || 0,
            totalQuestions: response.Quiz?.TotalQuestions || 0,
            completedAt: response.CompletedAt || response.StartedAt,
            passed: (response.Percentage || 0) >= 60,
            hasInsights: response.AIInsightsGenerated
          }));
          
          setRecentQuizzes(quizzes);
          
          // Calculate basic stats from responses
          const totalCompleted = pagination?.total || responses.length;
          const avgScore = responses.length > 0 
            ? responses.reduce((sum, r) => sum + (r.Percentage || 0), 0) / responses.length 
            : 0;
          
          setStats(prev => ({
            ...prev,
            quizzesCompleted: totalCompleted,
            averageScore: Math.round(avgScore),
          }));
        }
      } catch (err) {
        console.log('No quiz responses yet');
      }

      // Fetch analytics
      try {
        const analyticsRes = await quizResponseAPI.getMyAnalytics();
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
          
          // Update stats from analytics
          const analyticsData = analyticsRes.data.data;
          setStats(prev => ({
            ...prev,
            quizzesCompleted: analyticsData.totalQuizzes || prev.quizzesCompleted,
            averageScore: Math.round(parseFloat(analyticsData.averagePercentage || analyticsData.averageScore || prev.averageScore)),
          }));
        }
      } catch (err) {
        console.log('Analytics not available');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout role="student">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout role="student">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.FirstName || profile?.Username}! 🎓
            </h1>
            <p className="text-blue-100">
              Keep up the great work! Ready to learn something new today?
            </p>
          </div>

          {/* Pending Invitations Alert */}
          {pendingInvitations.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {pendingInvitations.length} Pending Group {pendingInvitations.length === 1 ? 'Invitation' : 'Invitations'}!
                    </h3>
                    <p className="text-amber-100">Click to review and join groups</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/student/groups')}
                  className="px-6 py-3 bg-white text-orange-600 rounded-xl hover:bg-amber-50 transition-all font-semibold flex items-center gap-2 shadow-lg"
                >
                  View Invitations
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Completed</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.quizzesCompleted}</h3>
              <p className="text-gray-600 text-sm">Quizzes Done</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalQuizzes > 0 ? (stats.quizzesCompleted / stats.totalQuizzes) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{stats.totalQuizzes}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Average</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.averageScore}%</h3>
              <p className="text-gray-600 text-sm">Score</p>
              <div className="mt-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(stats.averageScore / 20)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">My Groups</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.groupsCount}</h3>
              <p className="text-gray-600 text-sm">Joined Groups</p>
              {stats.pendingInvitations > 0 && (
                <div className="mt-3">
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                    {stats.pendingInvitations} pending
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Trophy className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Streak</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.streak}</h3>
              <p className="text-gray-600 text-sm">Days</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/student/quizzes')}
              className="bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl p-6 flex items-center justify-between group transition-all shadow-lg hover:shadow-blue-500/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">Take a Quiz</h3>
                  <p className="text-blue-100 text-sm">Start learning now</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => router.push('/student/results')}
              className="bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl p-6 flex items-center justify-between group transition-all shadow-lg hover:shadow-purple-500/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">View Results</h3>
                  <p className="text-purple-100 text-sm">Track your progress</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Quizzes</h2>
              <button
                onClick={() => router.push('/student/results')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {recentQuizzes.length > 0 ? (
              <div className="space-y-3">
                {recentQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => router.push(`/quiz/${quiz.quizId}/result?responseId=${quiz.id}`)}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all cursor-pointer border border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        quiz.passed ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {quiz.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-gray-900 font-medium">{quiz.title}</h3>
                          {quiz.hasInsights && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full flex items-center gap-1 border border-purple-200">
                              <Sparkles className="w-3 h-3" />
                              AI Insights
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          Score: {quiz.percentage?.toFixed(0) || quiz.score}% • {quiz.totalQuestions} questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-lg font-bold ${quiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {quiz.percentage?.toFixed(0) || quiz.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock className="w-4 h-4" />
                        {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No quizzes taken yet</p>
                <button
                  onClick={() => router.push('/student/quizzes')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
                >
                  Take Your First Quiz
                </button>
              </div>
            )}
          </div>

          {/* Performance Insights */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Performance Insights</h2>
            </div>
            {analytics ? (
              <div className="space-y-6">
                {/* Top row stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <p className="text-gray-600 text-sm">Total Quizzes</p>
                    </div>
                    <p className="text-gray-900 text-2xl font-bold">{analytics.totalQuizzes || 0}</p>
                    <p className="text-blue-600 text-sm">Completed</p>
                  </div>
                  <div className="bg-white rounded- lg p-4 shadow-sm border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <p className="text-gray-600 text-sm">Average Score</p>
                    </div>
                    <p className="text-gray-900 text-2xl font-bold">{Math.round(parseFloat(analytics.averagePercentage || analytics.averageScore || 0))}%</p>
                    <p className="text-green-600 text-sm">Overall</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <p className="text-gray-600 text-sm">Best Grade</p>
                    </div>
                    <p className="text-gray-900 text-2xl font-bold">
                      {stats.averageScore >= 90 ? 'A' : stats.averageScore >= 80 ? 'B' : stats.averageScore >= 70 ? 'C' : stats.averageScore >= 60 ? 'D' : 'F'}
                    </p>
                    <p className="text-purple-600 text-sm">Average</p>
                  </div>
                </div>

                {/* Strong & Weak Subjects */}
                {(analytics.strongSubjects?.length > 0 || analytics.weakSubjects?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analytics.strongSubjects?.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-green-700 font-semibold text-sm mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Strong Areas
                        </h4>
                        <div className="space-y-2">
                          {analytics.strongSubjects.slice(0, 3).map((subject, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-gray-700 text-sm">{subject.subject || subject.topic || subject}</span>
                              {subject.averagePercentage && (
                                <span className="text-green-700 text-sm font-medium">{Math.round(subject.averagePercentage)}%</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {analytics.weakSubjects?.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="text-orange-700 font-semibold text-sm mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Areas to Improve
                        </h4>
                        <div className="space-y-2">
                          {analytics.weakSubjects.slice(0, 3).map((subject, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-gray-700 text-sm">{subject.subject || subject.topic || subject}</span>
                              {subject.averagePercentage && (
                                <span className="text-orange-700 text-sm font-medium">{Math.round(subject.averagePercentage)}%</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <p className="text-gray-600 text-sm mb-1">Strongest Topic</p>
                  <p className="text-gray-900 font-semibold">--</p>
                  <p className="text-gray-500 text-sm">Take quizzes to see</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <p className="text-gray-600 text-sm mb-1">Focus Area</p>
                  <p className="text-gray-900 font-semibold">--</p>
                  <p className="text-gray-500 text-sm">Take quizzes to see</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <p className="text-gray-600 text-sm mb-1">Total Points</p>
                  <p className="text-gray-900 font-semibold">0</p>
                  <p className="text-gray-500 text-sm">Earned</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
