'use client';

import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuizManagementPage() {
  const router = useRouter();

  // Placeholder data – replace with real quizzes from API later
  const quizzes = [
    { id: 1, title: 'JavaScript Basics', status: 'Published' },
    { id: 2, title: 'React Hooks', status: 'Draft' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-400" />
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Quiz Management
              </h1>
              <p className="text-sm text-slate-300">
                View and manage your existing quizzes.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-slate-200 hover:text-white"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white/95 rounded-lg shadow p-6 space-y-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between border border-slate-100 rounded-md px-4 py-3"
            >
              <div>
                <p className="font-semibold text-gray-800">{quiz.title}</p>
                <p className="text-xs text-gray-500">{quiz.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs px-3 py-1 rounded bg-slate-100 text-gray-800 hover:bg-slate-200">
                  Edit
                </button>
                <button className="text-xs px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {quizzes.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No quizzes yet. Create one from the dashboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


