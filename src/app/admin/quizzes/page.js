'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../../utils/api';
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  FileQuestion,
  AlertCircle,
  TrendingUp,
  BarChart
} from 'lucide-react';

export default function QuizOversight() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Compute filtered quizzes on render
  const getFilteredQuizzes = () => {
    let filtered = [...quizzes];
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.Subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.Creator?.Username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(quiz => quiz.Difficulty === difficultyFilter);
    }
    if (statusFilter !== 'all') {
      const isPublished = statusFilter === 'published';
      filtered = filtered.filter(quiz => quiz.IsPublished === isPublished);
    }
    return filtered;
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllQuizzes();
      if (response.data.success) {
        setQuizzes(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError(error.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (quiz) => {
    setSelectedQuiz(quiz);
    setShowDetailsModal(true);
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      easy: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      medium: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      hard: { color: 'bg-red-100 text-red-700', icon: AlertCircle }
    };
    const badge = badges[difficulty] || badges.medium;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {difficulty}
      </span>
    );
  };

  const getStatusBadge = (isPublished) => {
    return isPublished ? (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        Published
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        <XCircle className="w-3 h-3" />
        Draft
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Quiz Oversight
            </h1>
            <p className="text-gray-600 mt-1">Monitor and review all quizzes in the system</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={fetchQuizzes}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Quizzes"
              value={quizzes.length}
              icon={BookOpen}
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <StatCard
              title="Published"
              value={quizzes.filter(q => q.IsPublished).length}
              icon={CheckCircle}
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <StatCard
              title="Drafts"
              value={quizzes.filter(q => !q.IsPublished).length}
              icon={XCircle}
              color="text-gray-600"
              bgColor="bg-gray-100"
            />
            <StatCard
              title="Total Responses"
              value={quizzes.reduce((sum, q) => sum + (q._count?.QuizResponses || 0), 0)}
              icon={FileQuestion}
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>Showing {getFilteredQuizzes().length} of {quizzes.length} quizzes</span>
            </div>
          </div>

          {/* Quizzes List */}
          <div className="grid grid-cols-1 gap-6">
            {getFilteredQuizzes().map((quiz) => (
              <div
                key={quiz.QuizID}
                className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{quiz.Title}</h3>
                        {getStatusBadge(quiz.IsPublished)}
                        {getDifficultyBadge(quiz.Difficulty)}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{quiz.Description}</p>
                    </div>
                    <button
                      onClick={() => openDetailsModal(quiz)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Creator</p>
                        <p className="text-gray-900 font-medium">
                          {quiz.Creator?.FirstName && quiz.Creator?.LastName 
                            ? `${quiz.Creator.FirstName} ${quiz.Creator.LastName}`
                            : quiz.Creator?.Username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FileQuestion className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Questions</p>
                        <p className="text-gray-900 font-medium">{quiz._count?.Questions || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <BarChart className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Responses</p>
                        <p className="text-gray-900 font-medium">{quiz._count?.QuizResponses || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Time Limit</p>
                        <p className="text-gray-900 font-medium">{quiz.TimeLimit} min</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Created</p>
                        <p className="text-gray-900 font-medium">{formatDate(quiz.CreatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {quiz.Subject && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-gray-500">Subject:</span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {quiz.Subject}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {getFilteredQuizzes().length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}
          </div>

          {/* Details Modal */}
          {showDetailsModal && selectedQuiz && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Quiz Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Title and Status */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{selectedQuiz.Title}</h4>
                      {getStatusBadge(selectedQuiz.IsPublished)}
                      {getDifficultyBadge(selectedQuiz.Difficulty)}
                    </div>
                    <p className="text-gray-600">{selectedQuiz.Description}</p>
                  </div>

                  {/* Creator Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Creator Information</h5>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedQuiz.Creator?.FirstName?.[0] || selectedQuiz.Creator?.Username?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedQuiz.Creator?.FirstName && selectedQuiz.Creator?.LastName
                            ? `${selectedQuiz.Creator.FirstName} ${selectedQuiz.Creator.LastName}`
                            : selectedQuiz.Creator?.Username}
                        </p>
                        <p className="text-sm text-gray-600">@{selectedQuiz.Creator?.Username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quiz Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Quiz ID" value={selectedQuiz.QuizID} />
                    <InfoItem label="Time Limit" value={`${selectedQuiz.TimeLimit} minutes`} />
                    <InfoItem label="Questions" value={selectedQuiz._count?.Questions || 0} />
                    <InfoItem label="Responses" value={selectedQuiz._count?.QuizResponses || 0} />
                    <InfoItem label="Subject" value={selectedQuiz.Subject || 'N/A'} />
                    <InfoItem label="Created" value={formatDate(selectedQuiz.CreatedAt)} />
                  </div>

                  {/* Updated Date */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-700">
                      <strong>Last Updated:</strong> {formatDate(selectedQuiz.UpdatedAt)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, bgColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
