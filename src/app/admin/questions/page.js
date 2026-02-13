'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../../utils/api';
import {
  FileQuestion,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  User,
  Hash
} from 'lucide-react';

export default function QuestionReview() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [searchTerm, typeFilter, questions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getAllQuestions();
      
      if (response.data.success) {
        setQuestions(response.data.data);
        setFilteredQuestions(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.QuestionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.Quiz?.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.Quiz?.Creator?.Username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(question => question.QuestionType === typeFilter);
    }

    setFilteredQuestions(filtered);
  };

  const openDetailsModal = (question) => {
    setSelectedQuestion(question);
    setShowDetailsModal(true);
  };

  const getTypeBadge = (type) => {
    const badges = {
      multiple_choice: { color: 'bg-blue-100 text-blue-700', label: 'Multiple Choice' },
      true_false: { color: 'bg-green-100 text-green-700', label: 'True/False' },
      short_answer: { color: 'bg-purple-100 text-purple-700', label: 'Short Answer' }
    };
    const badge = badges[type] || badges.multiple_choice;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
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
              <FileQuestion className="w-8 h-8 text-blue-600" />
              Question Review
            </h1>
            <p className="text-gray-600 mt-1">Review and monitor all questions in the system</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={fetchQuestions}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Questions"
              value={questions.length}
              icon={FileQuestion}
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <StatCard
              title="Multiple Choice"
              value={questions.filter(q => q.QuestionType === 'multiple_choice').length}
              icon={CheckCircle}
              color="text-indigo-600"
              bgColor="bg-indigo-100"
            />
            <StatCard
              title="True/False"
              value={questions.filter(q => q.QuestionType === 'true_false').length}
              icon={CheckCircle}
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <StatCard
              title="Short Answer"
              value={questions.filter(q => q.QuestionType === 'short_answer').length}
              icon={FileQuestion}
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>Showing {filteredQuestions.length} of {questions.length} questions</span>
            </div>
          </div>

          {/* Questions List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.QuestionID}
                className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-500">Q{question.OrderIndex}</span>
                        {getTypeBadge(question.QuestionType)}
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          {question.Points} {question.Points === 1 ? 'point' : 'points'}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium text-lg">{question.QuestionText}</p>
                    </div>
                    <button
                      onClick={() => openDetailsModal(question)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                  </div>

                  {/* Question Info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Quiz</p>
                        <p className="text-gray-900 font-medium">{question.Quiz?.Title || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Creator</p>
                        <p className="text-gray-900 font-medium">
                          {question.Quiz?.Creator?.FirstName && question.Quiz?.Creator?.LastName
                            ? `${question.Quiz.Creator.FirstName} ${question.Quiz.Creator.LastName}`
                            : question.Quiz?.Creator?.Username || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Question ID</p>
                        <p className="text-gray-900 font-medium">{question.QuestionID}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FileQuestion className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Answers</p>
                        <p className="text-gray-900 font-medium">{question._count?.Answers || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Options preview for multiple choice */}
                  {question.QuestionType === 'multiple_choice' && question.Options && question.Options.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Answer Options:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.Options.slice(0, 4).map((option) => (
                          <div
                            key={option.OptionID}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              option.IsCorrect
                                ? 'bg-green-50 border border-green-200 text-green-700'
                                : 'bg-gray-50 border border-gray-200 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {option.IsCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>{option.OptionText}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}
          </div>

          {/* Details Modal */}
          {showDetailsModal && selectedQuestion && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Question Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Question Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      {getTypeBadge(selectedQuestion.QuestionType)}
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                        {selectedQuestion.Points} {selectedQuestion.Points === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedQuestion.QuestionText}</h4>
                  </div>

                  {/* Quiz Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Quiz Information</h5>
                    <div className="space-y-2">
                      <InfoItem label="Quiz Title" value={selectedQuestion.Quiz?.Title || 'N/A'} />
                      <InfoItem 
                        label="Creator" 
                        value={
                          selectedQuestion.Quiz?.Creator?.FirstName && selectedQuestion.Quiz?.Creator?.LastName
                            ? `${selectedQuestion.Quiz.Creator.FirstName} ${selectedQuestion.Quiz.Creator.LastName}`
                            : selectedQuestion.Quiz?.Creator?.Username || 'N/A'
                        } 
                      />
                      <InfoItem 
                        label="Quiz Status" 
                        value={selectedQuestion.Quiz?.IsPublished ? 'Published' : 'Draft'}
                      />
                    </div>
                  </div>

                  {/* Question Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Question ID" value={selectedQuestion.QuestionID} />
                    <InfoItem label="Quiz ID" value={selectedQuestion.QuizID} />
                    <InfoItem label="Order Index" value={selectedQuestion.OrderIndex} />
                    <InfoItem label="Total Answers" value={selectedQuestion._count?.Answers || 0} />
                  </div>

                  {/* Answer Options */}
                  {selectedQuestion.Options && selectedQuestion.Options.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Answer Options</h5>
                      <div className="space-y-2">
                        {selectedQuestion.Options.map((option) => (
                          <div
                            key={option.OptionID}
                            className={`p-4 rounded-xl ${
                              option.IsCorrect
                                ? 'bg-green-50 border-2 border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 p-1 rounded-full ${
                                option.IsCorrect ? 'bg-green-200' : 'bg-gray-200'
                              }`}>
                                {option.IsCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-700" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  option.IsCorrect ? 'text-green-900' : 'text-gray-900'
                                }`}>
                                  {option.OptionText}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Option {option.OrderIndex} {option.IsCorrect && '• Correct Answer'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
