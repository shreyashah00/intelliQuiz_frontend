'use client'; 
import { FileText, Brain, Users, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const quizzes = [
    {
      id: 1,
      title: "JavaScript Basics",
      topic: "Programming",
      difficulty: "Easy",
      questions: 10,
      createdAt: "2025-12-20",
    },
    {
      id: 2,
      title: "React Hooks",
      topic: "Frontend",
      difficulty: "Medium",
      questions: 8,
      createdAt: "2025-12-21",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-transparent">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-300 text-sm">
              Overview of your quizzes and recent activity.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/generate-quiz")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Generate Quiz
          </button>
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 rounded-lg shadow p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Total Quizzes</p>
              <p className="text-3xl font-bold text-indigo-600">
                {quizzes.length}
              </p>
            </div>
            <FileText className="w-12 h-12 text-indigo-200" />
          </div>

          <div className="bg-white/90 rounded-lg shadow p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Total Questions</p>
              <p className="text-3xl font-bold text-green-600">
                {quizzes.reduce((sum, q) => sum + q.questions, 0)}
              </p>
            </div>
            <Brain className="w-12 h-12 text-green-200" />
          </div>

          <div className="bg-white/90 rounded-lg shadow p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Active Students</p>
              <p className="text-3xl font-bold text-purple-600">24</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white/95 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Quizzes</h2>
            <button
              onClick={() => router.push("/dashboard/generate-quiz")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Quiz
            </button>
          </div>

          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {quiz.topic} • {quiz.difficulty} • {quiz.questions} questions
                  </p>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
                  {quiz.createdAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
