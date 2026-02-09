'use client';
import { useState, useEffect } from 'react';
import { Brain, FileText, Users, Plus, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import useAuthStore from '../../store/authStore';
import { userAPI } from '../../utils/api';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [quizzes] = useState([
    {
      id: 1,
      title: 'JavaScript Basics',
      topic: 'Programming',
      difficulty: 'Easy',
      questions: 10,
      createdAt: '2025-12-20',
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

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {profile?.FirstName || user?.Username}!
              </h1>
              <p className="text-slate-300 text-sm">
                Manage your quizzes and generate new assessments.
              </p>
            </div>
            <button
              onClick={() => router.push('/teacher/profile')}
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
                  <p className="text-slate-400 text-sm">Total Quizzes</p>
                  <p className="text-3xl font-bold text-indigo-400">
                    {quizzes.length}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-indigo-400/30" />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-indigo-500/30 rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Questions</p>
                  <p className="text-3xl font-bold text-green-400">
                    {quizzes.reduce((sum, q) => sum + q.questions, 0)}
                  </p>
                </div>
                <Brain className="w-12 h-12 text-green-400/30" />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-indigo-500/30 rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Students</p>
                  <p className="text-3xl font-bold text-purple-400">24</p>
                </div>
                <Users className="w-12 h-12 text-purple-400/30" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/dashboard/generate-quiz')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50 text-white py-6 px-6 rounded-lg flex items-center justify-center gap-3 transform hover:-translate-y-0.5 transition"
            >
              <Plus className="w-6 h-6" /> Generate New Quiz
            </button>
            <button
              onClick={() => router.push('/dashboard/quiz-management')}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-lg hover:shadow-green-500/50 text-white py-6 px-6 rounded-lg flex items-center justify-center gap-3 transform hover:-translate-y-0.5 transition"
            >
              <FileText className="w-6 h-6" /> Manage Quizzes
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
