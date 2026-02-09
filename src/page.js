import { Brain, BookOpen, Users, Sparkles, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-indigo-700">
              IntelliQuiz
            </h1>
          </div>

          <div className="flex gap-4">
            <button className="text-gray-700 hover:text-indigo-600 font-medium">
              Features
            </button>
            <button className="text-gray-700 hover:text-indigo-600 font-medium">
              About
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-full mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
          Smarter Quizzes with <span className="text-indigo-600">AI</span>
        </h2>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          IntelliQuiz is an AI-powered quiz generation platform designed to help
          teachers create quizzes effortlessly and students to learn effectively.
        </p>

        <div className="flex justify-center gap-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition">
            Start as Teacher <ArrowRight className="w-5 h-5" />
          </button>

          <button className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg text-lg font-semibold transition">
            Start as Student
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 pb-20">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Why IntelliQuiz?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              AI Quiz Generation
            </h4>
            <p className="text-gray-600">
              Automatically generate quizzes based on topic, difficulty, and
              number of questions using AI.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              Easy for Students
            </h4>
            <p className="text-gray-600">
              Students can attempt quizzes online, receive instant feedback,
              and review correct answers.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              Teacher-Friendly
            </h4>
            <p className="text-gray-600">
              Teachers can manage quizzes, export question sets, and track
              student performance easily.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-6 py-6 text-center">
          <p className="text-gray-600 text-sm">
            © 2025 IntelliQuiz | Final Year Project
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Developed by Shreya Shah (23050326)
          </p>
        </div>
      </footer>

    </div>
  );
}
