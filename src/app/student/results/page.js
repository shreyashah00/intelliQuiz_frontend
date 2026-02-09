'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { quizResponseAPI } from '../../../utils/api';
import {
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Brain,
  BarChart3,
  Eye,
  Sparkles
} from 'lucide-react';

export default function StudentResults() {
  const router = useRouter();
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results'); // 'results' or 'analytics'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch quiz responses
      const responsesRes = await quizResponseAPI.getMyResponses({ page: 1, limit: 50 });
      if (responsesRes.data.success) {
        const responsesData = responsesRes.data.data.responses || responsesRes.data.data;
        setResponses(responsesData);
      }

      // Fetch analytics
      try {
        const analyticsRes = await quizResponseAPI.getMyAnalytics();
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
      } catch (err) {
        console.log('Analytics not available:', err);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
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
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-10 h-10" />
              <h1 className="text-3xl font-bold">My Results & Analytics</h1>
            </div>
            <p className="text-blue-100">
              Track your progress and view detailed performance analytics
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-1 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              Quiz Results
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Analytics View */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{analytics.totalQuizzes || 0}</h3>
                  <p className="text-gray-600 text-sm">Total Quizzes</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {Math.round(parseFloat(analytics.averagePercentage || analytics.averageScore || 0))}%
                  </h3>
                  <p className="text-gray-600 text-sm">Average Score</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {getGrade(parseFloat(analytics.averagePercentage || analytics.averageScore || 0))}
                  </h3>
                  <p className="text-gray-600 text-sm">Average Grade</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-yellow-100">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {analytics.totalQuizzesTaken || analytics.totalQuizzes || 0}
                  </h3>
                  <p className="text-gray-600 text-sm">Completed</p>
                </div>
              </div>

              {/* Performance by Difficulty */}
              {analytics.performanceByDifficulty && (
                <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    Performance by Difficulty
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(analytics.performanceByDifficulty).map(([difficulty, data]) => (
                      <div key={difficulty}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-medium capitalize">{difficulty}</span>
                          <span className="text-gray-900 font-semibold">
                            {Math.round(data.averagePercentage || 0)}% ({data.count} quizzes)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all"
                            style={{ width: `${data.averagePercentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strong & Weak Subjects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.strongSubjects && analytics.strongSubjects.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-6 h-6 text-green-600" />
                      Strong Subjects
                    </h3>
                    <div className="space-y-3">
                      {analytics.strongSubjects.map((subject, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="font-medium text-gray-900">{subject.subject}</span>
                          <span className="text-green-600 font-semibold">
                            {Math.round(subject.averagePercentage)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.weakSubjects && analytics.weakSubjects.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-6 h-6 text-orange-600" />
                      Areas for Improvement
                    </h3>
                    <div className="space-y-3">
                      {analytics.weakSubjects.map((subject, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <span className="font-medium text-gray-900">{subject.subject}</span>
                          <span className="text-orange-600 font-semibold">
                            {Math.round(subject.averagePercentage)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results View */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              {responses.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md border border-blue-100">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No quiz results yet</h3>
                  <p className="text-gray-600 mb-6">Start taking quizzes to see your results here!</p>
                  <button
                    onClick={() => router.push('/student/quizzes')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Browse Quizzes
                  </button>
                </div>
              ) : (
                responses.map((response) => (
                  <div
                    key={response.ResponseID}
                    className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer"
                    onClick={() => router.push(`/quiz/${response.QuizID}/result?responseId=${response.ResponseID}`)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {response.Quiz?.Title || 'Quiz'}
                          </h3>
                          {response.AIInsightsGenerated && (
                            <span className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs font-semibold text-purple-600 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI Insights
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {response.Quiz?.Description || ''}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Brain className="w-4 h-4 text-blue-500" />
                            {response.Quiz?.TotalQuestions || 0} Questions
                          </span>
                          {response.TimeSpent && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-blue-500" />
                              {Math.round(response.TimeSpent / 60)} min
                            </span>
                          )}
                          <span className="text-gray-400">
                            {new Date(response.CompletedAt || response.StartedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-4xl font-bold px-6 py-3 rounded-xl border ${getGradeColor(response.Percentage)}`}>
                            {getGrade(response.Percentage)}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {response.Score}/{response.TotalScore} ({Math.round(response.Percentage)}%)
                          </p>
                        </div>

                        <button className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
