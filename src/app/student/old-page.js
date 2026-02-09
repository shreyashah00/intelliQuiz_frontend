'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Trophy, Clock, CheckCircle, Play, FileText, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import useAuthStore from '../../store/authStore';
import { userAPI } from '../../utils/api';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [quizzes] = useState([
    {
      id: 1,
      title: 'JavaScript Basics',
      topic: 'Programming',
      difficulty: 'Easy',
      status: 'Completed',
      score: 85,
      completedAt: '2025-12-20',
    },
    {
      id: 2,
      title: 'React Hooks',
      topic: 'Frontend',
      difficulty: 'Medium',
      status: 'Pending',
      dueDate: '2025-12-25',
    },
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const completedQuizzes = quizzes.filter((q) => q.status === 'Completed');
  const averageScore = completedQuizzes.length > 0
    ? Math.round(completedQuizzes.reduce((sum, q) => sum + q.score, 0) / completedQuizzes.length)
    : 0;
  const pendingQuizzes = quizzes.filter((q) => q.status === 'Pending');

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {profile?.FirstName || user?.Username}!
              </h1>
              <p className="text-slate-300 text-sm">
                Track your progress and access available quizzes.
              </p>
            </div>
            <button
              onClick={() => router.push('/student/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg text-sm font-medium border border-indigo-500/20"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-indigo-500/30 rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Quizzes Completed</p>
                  <p className="text-3xl font-bold text-indigo-400">
                    {completedQuizzes.length}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-indigo-400/30" />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-indigo-500/30 rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Average Score</p>
                  <p className="text-3xl font-bold text-green-400">
                    {averageScore}%
                  </p>
                </div>
                <Trophy className="w-12 h-12 text-green-400/30" />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-indigo-500/30 rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Quizzes</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {pendingQuizzes.length}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-purple-400/30" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-indigo-500/30 rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Available Quizzes</h2>
            </div>

            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-indigo-400" />
                    <div>
                      <h3 className="font-semibold text-white">{quiz.title}</h3>
                      <p className="text-sm text-slate-400">
                        {quiz.topic} • {quiz.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {quiz.status === 'Completed' ? (
                      <span className="text-green-400 font-medium">
                        Score: {quiz.score}%
                      </span>
                    ) : (
                      <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition">
                        Start Quiz
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

