'use client';
import { useState } from 'react';
import { Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardGenerateQuizPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    difficulty: 'Medium',
    numQuestions: 5,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1000));
    const questions = Array.from({ length: formData.numQuestions }, (_, i) => ({
      id: i + 1,
      question: `Sample question ${i + 1} about ${formData.topic}`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
    }));
    setGeneratedQuestions(questions);
    setIsGenerating(false);
  };

  const saveQuiz = () => router.push('/dashboard');

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-7 h-7 text-indigo-400" />
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Generate Quiz
              </h1>
              <p className="text-sm text-slate-300">
                Create a new AI-powered quiz from your topic.
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

        <div className="bg-white/95 rounded-lg shadow-lg p-6 space-y-4">
          <input
            type="text"
            placeholder="Quiz Title"
            className="border border-slate-200 rounded-md p-2 w-full text-sm"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Topic"
            className="border border-slate-200 rounded-md p-2 w-full text-sm"
            value={formData.topic}
            onChange={(e) =>
              setFormData({ ...formData, topic: e.target.value })
            }
          />
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="border border-slate-200 rounded-md p-2 w-full text-sm"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <input
            type="number"
            value={formData.numQuestions}
            onChange={(e) =>
              setFormData({
                ...formData,
                numQuestions: Number(e.target.value || 0),
              })
            }
            min={1}
            max={20}
            className="border border-slate-200 rounded-md p-2 w-full text-sm"
          />
          <button
            onClick={generateQuiz}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm"
          >
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </button>

          {generatedQuestions.length > 0 && (
            <div className="space-y-3 mt-4">
              <h2 className="font-semibold text-gray-800 text-sm">
                Generated Questions
              </h2>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-md p-3 space-y-2">
                {generatedQuestions.map((q) => (
                  <div key={q.id} className="text-sm text-gray-700">
                    {q.id}. {q.question}
                  </div>
                ))}
              </div>
              <button
                onClick={saveQuiz}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full text-sm"
              >
                Save Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


