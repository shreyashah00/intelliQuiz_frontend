'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { quizAPI } from '../../../utils/api';
import {
  BookOpen,
  Clock,
  Award,
  Brain,
  ArrowRight,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';

export default function StudentQuizzes() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [searchTerm, difficultyFilter, subjectFilter, quizzes]);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getPublishedQuizzesForUser();
      if (response.data.success) {
        // Get group-published quizzes
        const publishedQuizzes = response.data.data || [];
        setQuizzes(publishedQuizzes);
        setFilteredQuizzes(publishedQuizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.Subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(quiz =>
        quiz.Difficulty?.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(quiz =>
        quiz.Subject?.toLowerCase() === subjectFilter.toLowerCase()
      );
    }

    setFilteredQuizzes(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const uniqueSubjects = [...new Set(quizzes.map(q => q.Subject).filter(Boolean))];

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
              <BookOpen className="w-10 h-10" />
              <h1 className="text-3xl font-bold">Available Quizzes</h1>
            </div>
            <p className="text-blue-100">
              Choose from {filteredQuizzes.length} available quizzes and test your knowledge!
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quizzes Grid */}
          {filteredQuizzes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-md border border-blue-100">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new quizzes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.QuizID}
                  className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group"
                  onClick={() => router.push(`/quiz/${quiz.QuizID}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(quiz.Difficulty)}`}>
                      {quiz.Difficulty || 'Medium'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {quiz.Title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {quiz.Description || 'Test your knowledge with this comprehensive quiz.'}
                  </p>

                  <div className="space-y-2 mb-4">
                    {quiz.Subject && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>{quiz.Subject}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>{quiz.TotalQuestions || 0} Questions</span>
                    </div>
                    {quiz.TimeLimit && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{quiz.TimeLimit} minutes</span>
                      </div>
                    )}
                  </div>

                  <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105">
                    <span>Start Quiz</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
