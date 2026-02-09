'use client';
import { useState } from 'react';
import { Brain, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GenerateQuizPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title:'', topic:'', difficulty:'Medium', numQuestions:5 });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating,setIsGenerating] = useState(false);

  const generateQuiz = async () => {
    setIsGenerating(true);
    await new Promise(r=>setTimeout(r,1000));
    const questions = Array.from({length:formData.numQuestions}, (_,i)=>({
      id:i+1, question:`Sample question ${i+1} about ${formData.topic}`, options:['A','B','C','D'], correctAnswer:0
    }));
    setGeneratedQuestions(questions);
    setIsGenerating(false);
  };

  const saveQuiz = () => router.push('/teacher');

  return (
    <div className="min-h-screen p-6">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2"><Brain className="w-6 h-6"/>Generate Quiz</h1>
        <button onClick={()=>router.push('/teacher')} className="flex items-center gap-2 bg-indigo-700 px-4 py-2 rounded-lg"><Home className="w-4 h-4"/>Dashboard</button>
      </nav>

      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto space-y-4">
        <input type="text" placeholder="Quiz Title" className="border p-2 w-full" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})}/>
        <input type="text" placeholder="Topic" className="border p-2 w-full" value={formData.topic} onChange={e=>setFormData({...formData,topic:e.target.value})}/>
        <select value={formData.difficulty} onChange={e=>setFormData({...formData,difficulty:e.target.value})} className="border p-2 w-full">
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <input type="number" value={formData.numQuestions} onChange={e=>setFormData({...formData,numQuestions:e.target.value})} min={1} max={20} className="border p-2 w-full"/>
        <button onClick={generateQuiz} className="bg-indigo-600 text-white py-2 px-4 rounded">{isGenerating?'Generating...':'Generate Quiz'}</button>

        {generatedQuestions.length>0 && <button onClick={saveQuiz} className="bg-green-600 text-white py-2 px-4 rounded w-full mt-4">Save Quiz</button>}
      </div>
    </div>
  );
}
