'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Input,
  Select,
  Checkbox,
  Modal,
  message,
  Steps,
  Empty,
  Spin,
  Tag,
  ConfigProvider,
  Space,
  Form,
  Radio
} from 'antd';
import {
  RobotOutlined,
  FileTextOutlined,
  SettingOutlined,
  EyeOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  BookOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons';
import { Brain, FileText, Sparkles, Wand2, Settings, CheckCircle, Upload, Trash2, Edit3 } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { fileAPI, quizAPI } from '../../../utils/api';

const { TextArea } = Input;
const { Option } = Select;

export default function GenerateQuizPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [questionForm, setQuestionForm] = useState(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [quizConfig, setQuizConfig] = useState({
    title: '',
    description: '',
    numberOfQuestions: 10,
    difficulty: 'medium',
    subject: '',
    timeLimit: 20,
  });

  useEffect(() => {
    setMounted(true);
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fileAPI.getUserFiles();
      if (response.data.success) {
        const processedFiles = response?.data?.data?.files?.filter(f => f.Status === 'completed');
        setFiles(processedFiles || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      message.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setQuizConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleGenerateQuiz = async () => {
    if (selectedFiles.length === 0) { message.warning('Please select at least one file'); return; }
    if (!quizConfig.title.trim()) { message.warning('Please enter a quiz title'); return; }
    setGenerating(true);
    try {
      const response = await quizAPI.generateQuizAI({
        fileIds: selectedFiles,
        title: quizConfig.title,
        description: quizConfig.description,
        difficulty: quizConfig.difficulty,
        subject: quizConfig.subject,
        timeLimit: quizConfig.timeLimit,
        numQuestions: quizConfig.numberOfQuestions
      });
      if (response.data.success) {
        setGeneratedQuiz(response.data.data);
        setCurrentStep(2);
        message.success('Quiz generated successfully!');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to generate quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveQuiz = async () => {
    setSaving(true);
    try {
      const response = await quizAPI.saveGeneratedQuiz(generatedQuiz);
      if (response.data.success) {
        message.success('Quiz saved successfully!');
        router.push('/teacher/quiz-management');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setIsAddingQuestion(true);
    setQuestionForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
  };

  const handleEditQuestion = (index) => {
    const question = generatedQuiz.questions[index];
    setEditingQuestionIndex(index);
    setQuestionForm({ question: question.question, options: [...question.options], correctAnswer: question.correctAnswer, explanation: question.explanation || '' });
  };

  const handleDeleteQuestion = (index) => {
    Modal.confirm({
      title: 'Delete Question',
      content: 'Are you sure you want to delete this question?',
      okText: 'Delete', okType: 'danger',
      onOk: () => {
        setGeneratedQuiz({ ...generatedQuiz, questions: generatedQuiz.questions.filter((_, i) => i !== index) });
        message.success('Question deleted');
      }
    });
  };

  const handleSaveQuestion = () => {
    if (!questionForm.question.trim()) { message.error('Please enter a question'); return; }
    if (questionForm.options.some(opt => !opt.trim())) { message.error('Please fill in all options'); return; }
    const updatedQuestions = [...generatedQuiz.questions];
    if (isAddingQuestion) { updatedQuestions.push(questionForm); message.success('Question added'); }
    else { updatedQuestions[editingQuestionIndex] = questionForm; message.success('Question updated'); }
    setGeneratedQuiz({ ...generatedQuiz, questions: updatedQuestions });
    setEditingQuestionIndex(null); setIsAddingQuestion(false); setQuestionForm(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestionIndex(null); setIsAddingQuestion(false); setQuestionForm(null);
  };

  const updateQuestionFormField = (field, value) => setQuestionForm({ ...questionForm, [field]: value });
  const updateQuestionOption = (index, value) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index] = value;
    setQuestionForm({ ...questionForm, options: updatedOptions });
  };

  const canProceed = () => {
    if (currentStep === 0) return selectedFiles.length > 0;
    if (currentStep === 1) return quizConfig.title.trim() !== '';
    return true;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <DashboardLayout role="teacher">
          <div className="flex items-center justify-center h-[400px]">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white animate-pulse shadow-[0_0_0_0_rgba(99,102,241,0.4)] hover:shadow-[0_0_0_12px_rgba(99,102,241,0)] transition-shadow">
              <Brain size={32} />
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const difficultyConfig = {
    easy: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Easy', dot: '#10b981' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Medium', dot: '#f59e0b' },
    hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Hard', dot: '#ef4444' },
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <div className={`font-['DM_Sans',sans-serif] max-w-[1100px] mx-auto px-6 pb-10 flex flex-col gap-5 opacity-0 translate-y-3 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : ''}`}>

          {/* ── Top action cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manual */}
            <div className="relative overflow-hidden rounded-2xl p-6 flex items-center bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 shadow-[0_8px_32px_rgba(16,185,129,0.25)] animate-[slide-up_0.6s_ease_both]">
              <div className="absolute w-30 h-30 rounded-full bg-white/15 blur-xl top-[-40px] right-[-30px]" />
              <div className="absolute w-20 h-20 rounded-full bg-white/15 blur-xl bottom-[-25px] left-5" />
              <div className="relative z-10 flex items-center gap-3.5 w-full">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0">
                  <Edit3 size={22} />
                </div>
                <div className="flex-1">
                  <h2 className="font-['Sora',sans-serif] text-base font-bold text-white m-0 mb-0.5">Manual Quiz</h2>
                  <p className="text-xs text-white/75 m-0">Craft your own questions from scratch</p>
                </div>
                <button 
                  className="flex-shrink-0 px-4.5 py-2 rounded-xl font-['DM_Sans',sans-serif] text-sm font-semibold bg-white text-emerald-700 border-none cursor-pointer transition-transform hover:scale-103 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                  onClick={() => router.push('/teacher/create-quiz')}
                >
                  <PlusOutlined /> Create
                </button>
              </div>
            </div>
            {/* AI */}
            <div className="relative overflow-hidden rounded-2xl p-6 flex items-center bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-500 shadow-[0_8px_32px_rgba(79,70,229,0.25)] animate-[slide-up_0.6s_0.1s_ease_both]">
              <div className="absolute w-35 h-35 rounded-full bg-white/15 blur-xl top-[-50px] right-[-40px]" />
              <div className="absolute w-22.5 h-22.5 rounded-full bg-white/15 blur-xl bottom-[-30px] left-2.5" />
              <div className="relative z-10 flex items-center gap-3.5 w-full">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0">
                  <Brain size={22} />
                </div>
                <div className="flex-1">
                  <h2 className="font-['Sora',sans-serif] text-base font-bold text-white m-0 mb-0.5">AI Quiz Generator</h2>
                  <p className="text-xs text-white/75 m-0">Turn documents into smart quizzes instantly</p>
                </div>
                <span className="inline-flex items-center gap-1.25 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
                  <Sparkles size={14} /> AI Powered
                </span>
              </div>
            </div>
          </div>

          {/* ── Stepper ── */}
          <div className="flex items-center justify-center bg-white rounded-xl px-7 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] border border-[#f0f0f5] gap-0 animate-[slide-up_0.6s_0.15s_ease_both]">
            {['Select Files', 'Configure', 'Review'].map((label, i) => (
              <div key={i} className={`flex items-center gap-2.5 transition-all duration-300 ${i === currentStep ? 'gqp-step-active' : ''} ${i < currentStep ? 'gqp-step-done' : ''}`}>
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-['Sora',sans-serif] text-xs font-bold bg-slate-200 text-slate-400 border-2 border-slate-300 transition-all flex-shrink-0 ${i === currentStep ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-transparent shadow-[0_4px_14px_rgba(99,102,241,0.4)]' : ''} ${i < currentStep ? 'bg-emerald-50 text-emerald-500 border-emerald-500' : ''}`}>
                  {i < currentStep ? <CheckCircle size={16} className="text-emerald-500" /> : <span>{i + 1}</span>}
                </div>
                <span className={`text-xs font-medium text-slate-400 whitespace-nowrap transition-colors ${i === currentStep ? 'text-slate-800 font-semibold' : ''} ${i < currentStep ? 'text-emerald-500' : ''}`}>{label}</span>
                {i < 2 && <div className="w-12 h-0.5 bg-slate-200 mx-1.5 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* ── Step 0: Select Files ── */}
          {currentStep === 0 && (
            <div className="bg-white rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.05)] border border-[#f0f0f5] animate-[slide-up_0.5s_ease_both]">
              <div className="flex items-center gap-3.5 mb-6 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 m-0 mb-0.5">Select Source Documents</h3>
                  <p className="text-xs text-slate-500 m-0">Choose files to generate questions from</p>
                </div>
                {selectedFiles.length > 0 && (
                  <span className="ml-auto bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full">
                    {selectedFiles.length} selected
                  </span>
                )}
              </div>

              {files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {files.map((file, idx) => {
                    const selected = selectedFiles.includes(file.FileID);
                    return (
                      <div
                        key={file.FileID}
                        className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border-2 border-slate-200 bg-slate-50 transition-all hover:border-blue-200 hover:bg-blue-50 hover:-translate-y-0.5 animate-[fade-in_0.4s_ease_both] ${selected ? '!border-blue-500 !bg-blue-50 shadow-[0_4px_16px_rgba(59,130,246,0.12)]' : ''}`}
                        onClick={() => toggleFileSelection(file.FileID)}
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="w-9.5 h-9.5 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-base">
                          <FileTextOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{file.FileName}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{file.FileType?.toUpperCase()}</span>
                        </div>
                        <div className={`text-blue-500 transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}>
                          <CheckCircle size={18} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center p-12 px-6 text-center">
                  <div className="text-slate-300 mb-4"><FileText size={40} /></div>
                  <h4 className="font-['Sora',sans-serif] text-base font-bold text-slate-600 m-0 mb-1.5">No processed files yet</h4>
                  <p className="text-xs text-slate-500 m-0 mb-5">Upload and process documents to get started</p>
                  <button 
                    className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-none rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer font-['DM_Sans',sans-serif] transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.3)]"
                    onClick={() => router.push('/file-management')}
                  >
                    <Upload size={16} /> Upload Files
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 1: Configure ── */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.05)] border border-[#f0f0f5] animate-[slide-up_0.5s_ease_both]">
              <div className="flex items-center gap-3.5 mb-6 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center flex-shrink-0">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 m-0 mb-0.5">Quiz Configuration</h3>
                  <p className="text-xs text-slate-500 m-0">Set up your quiz parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4.5 mb-6">
                <div className="flex flex-col gap-1.75 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Quiz Title <span className="text-red-500">*</span></label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 font-['DM_Sans',sans-serif] text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] box-border placeholder:text-slate-400"
                    value={quizConfig.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    placeholder="Enter an engaging title for your quiz"
                  />
                </div>

                <div className="flex flex-col gap-1.75 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Description</label>
                  <textarea
                    className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 font-['DM_Sans',sans-serif] text-sm text-slate-800 outline-none resize-y transition-all focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] box-border placeholder:text-slate-400"
                    rows={3}
                    value={quizConfig.description}
                    onChange={(e) => handleConfigChange('description', e.target.value)}
                    placeholder="Brief description about content and objectives"
                  />
                </div>

                <div className="flex flex-col gap-1.75">
                  <label className="text-xs font-semibold text-slate-700">Subject</label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 font-['DM_Sans',sans-serif] text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] box-border placeholder:text-slate-400"
                    value={quizConfig.subject}
                    onChange={(e) => handleConfigChange('subject', e.target.value)}
                    placeholder="e.g., Mathematics, Science"
                  />
                </div>

                <div className="flex flex-col gap-1.75">
                  <label className="text-xs font-semibold text-slate-700">Difficulty Level</label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map(d => (
                      <button
                        key={d}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.25 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 font-['DM_Sans',sans-serif] text-xs font-medium text-slate-500 cursor-pointer transition-all hover:border-indigo-200 hover:bg-indigo-50 ${quizConfig.difficulty === d ? 'font-bold' : ''}`}
                        style={quizConfig.difficulty === d ? { background: difficultyConfig[d].bg, borderColor: difficultyConfig[d].color, color: difficultyConfig[d].color } : {}}
                        onClick={() => handleConfigChange('difficulty', d)}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: difficultyConfig[d].dot }} />
                        {difficultyConfig[d].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.75">
                  <label className="text-xs font-semibold text-slate-700">Number of Questions</label>
                  <div className="flex items-center gap-0 border-[1.5px] border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button 
                      className="w-9.5 h-10.5 border-none bg-transparent text-base font-medium text-indigo-500 cursor-pointer transition-colors hover:bg-violet-100"
                      onClick={() => handleConfigChange('numberOfQuestions', Math.max(5, quizConfig.numberOfQuestions - 1))}
                    >−</button>
                    <span className="flex-1 text-center font-['Sora',sans-serif] text-base font-bold text-slate-800">{quizConfig.numberOfQuestions}</span>
                    <button 
                      className="w-9.5 h-10.5 border-none bg-transparent text-base font-medium text-indigo-500 cursor-pointer transition-colors hover:bg-violet-100"
                      onClick={() => handleConfigChange('numberOfQuestions', Math.min(50, quizConfig.numberOfQuestions + 1))}
                    >+</button>
                  </div>
                  <span className="text-[11.5px] text-slate-400">Between 5 and 50</span>
                </div>

                <div className="flex flex-col gap-1.75">
                  <label className="text-xs font-semibold text-slate-700">Time Limit (minutes)</label>
                  <div className="flex items-center gap-0 border-[1.5px] border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button 
                      className="w-9.5 h-10.5 border-none bg-transparent text-base font-medium text-indigo-500 cursor-pointer transition-colors hover:bg-violet-100"
                      onClick={() => handleConfigChange('timeLimit', Math.max(5, quizConfig.timeLimit - 5))}
                    >−</button>
                    <span className="flex-1 text-center font-['Sora',sans-serif] text-base font-bold text-slate-800">{quizConfig.timeLimit}</span>
                    <button 
                      className="w-9.5 h-10.5 border-none bg-transparent text-base font-medium text-indigo-500 cursor-pointer transition-colors hover:bg-violet-100"
                      onClick={() => handleConfigChange('timeLimit', Math.min(180, quizConfig.timeLimit + 5))}
                    >+</button>
                  </div>
                  <span className="text-[11.5px] text-slate-400">5 – 180 minutes</span>
                </div>
              </div>

              {/* Summary pill row */}
              <div className="flex gap-2.5 flex-wrap p-4 bg-blue-50 rounded-xl border border-indigo-100">
                <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.25 rounded-full">
                  <FileText size={14} />{selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.25 rounded-full">
                  <BookOutlined />{quizConfig.numberOfQuestions} Questions
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.25 rounded-full">
                  <span className="w-2 h-2 rounded-full" style={{ background: difficultyConfig[quizConfig.difficulty].dot }} />
                  {difficultyConfig[quizConfig.difficulty].label}
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.25 rounded-full">
                  <ClockCircleOutlined />{quizConfig.timeLimit} min
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Review ── */}
          {currentStep === 2 && generatedQuiz && (
            <div className="bg-white rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.05)] border border-[#f0f0f5] animate-[slide-up_0.5s_ease_both]">
              <div className="flex items-center gap-3.5 mb-6 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircleOutlined />
                </div>
                <div>
                  <h3 className="font-['Sora',sans-serif] text-base font-bold text-slate-900 m-0 mb-0.5">Review Generated Quiz</h3>
                  <p className="text-xs text-slate-500 m-0">Edit, add, or remove questions before saving</p>
                </div>
                <button 
                  className="ml-auto inline-flex items-center gap-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-none rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer font-['DM_Sans',sans-serif] transition-transform hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
                  onClick={handleAddQuestion}
                >
                  <PlusOutlined /> Add Question
                </button>
              </div>

              {/* Quiz meta */}
              <div className="p-4.5 bg-blue-50 rounded-xl border border-indigo-100 mb-5 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-['Sora',sans-serif] text-lg font-bold text-slate-900 m-0 mb-1">{generatedQuiz.title}</h4>
                  {generatedQuiz.description && <p className="text-xs text-slate-500 m-0">{generatedQuiz.description}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.25 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600">
                    <ThunderboltOutlined />{generatedQuiz.difficulty?.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1.25 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                    <ClockCircleOutlined />{generatedQuiz.timeLimit} min
                  </span>
                  <span className="inline-flex items-center gap-1.25 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                    <BookOutlined />{generatedQuiz.questions?.length} Q
                  </span>
                </div>
              </div>

              {/* Edit form */}
              {(editingQuestionIndex !== null || isAddingQuestion) && questionForm && (
                <div className="border-2 border-indigo-500 rounded-xl mb-5 overflow-hidden shadow-[0_4px_24px_rgba(99,102,241,0.12)] animate-[slide-up_0.5s_ease_both]">
                  <div className="flex items-center gap-2 bg-gradient-to-br from-violet-50 to-blue-50 px-5 py-3 font-['Sora',sans-serif] text-sm font-bold text-indigo-600 border-b border-indigo-100">
                    <Edit3 size={18} />
                    <span>{isAddingQuestion ? 'Add New Question' : `Editing Question ${editingQuestionIndex + 1}`}</span>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.75">
                      <label className="text-xs font-semibold text-slate-700">Question Text</label>
                      <textarea
                        className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 font-['DM_Sans',sans-serif] text-sm text-slate-800 outline-none resize-y transition-all focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] box-border placeholder:text-slate-400"
                        rows={3}
                        value={questionForm.question}
                        onChange={(e) => updateQuestionFormField('question', e.target.value)}
                        placeholder="Enter your question here..."
                      />
                    </div>
                    <div className="flex flex-col gap-1.75">
                      <label className="text-xs font-semibold text-slate-700">Answer Options <span className="font-normal text-slate-400 text-xs">— click the dot to mark correct answer</span></label>
                      <div className="flex flex-col gap-2">
                        {questionForm.options.map((option, idx) => (
                          <div key={idx} className={`flex items-center gap-2.5 p-2 rounded-xl border-[1.5px] border-slate-200 transition-colors ${questionForm.correctAnswer === idx ? 'bg-emerald-50 !border-emerald-300' : 'hover:bg-slate-50'}`}>
                            <button
                              className={`w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white cursor-pointer transition-all flex-shrink-0 ${questionForm.correctAnswer === idx ? 'bg-emerald-500 border-emerald-500' : ''}`}
                              onClick={() => updateQuestionFormField('correctAnswer', idx)}
                            />
                            <span className="font-['Sora',sans-serif] text-xs font-bold text-slate-400 w-5 flex-shrink-0">{String.fromCharCode(65 + idx)}</span>
                            <input
                              className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-slate-200 bg-slate-50 font-['DM_Sans',sans-serif] text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white box-border placeholder:text-slate-400"
                              value={option}
                              onChange={(e) => updateQuestionOption(idx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.75">
                      <label className="text-xs font-semibold text-slate-700">Explanation <span className="font-normal text-slate-400 text-xs">— optional</span></label>
                      <textarea
                        className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 font-['DM_Sans',sans-serif] text-sm text-slate-800 outline-none resize-y transition-all focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] box-border placeholder:text-slate-400"
                        rows={2}
                        value={questionForm.explanation}
                        onChange={(e) => updateQuestionFormField('explanation', e.target.value)}
                        placeholder="Why is this the correct answer?"
                      />
                    </div>
                    <div className="flex gap-2.5 justify-end">
                      <button 
                        className="px-4.5 py-2.25 rounded-xl border-[1.5px] border-slate-200 bg-white font-['DM_Sans',sans-serif] text-sm font-medium text-slate-500 cursor-pointer transition-all hover:border-slate-300 hover:bg-slate-50"
                        onClick={handleCancelEdit}
                      >Cancel</button>
                      <button 
                        className="inline-flex items-center gap-1.5 px-4.5 py-2.25 rounded-xl border-none bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-['DM_Sans',sans-serif] text-sm font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                        onClick={handleSaveQuestion}
                      ><SaveOutlined /> Save Question</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions list */}
              <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
                {generatedQuiz.questions?.map((q, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start p-4 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 transition-all hover:border-blue-200 hover:bg-blue-50 animate-[fade-in_0.4s_ease_both]" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-['Sora',sans-serif] text-xs font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 m-0 mb-2.5 leading-relaxed">{q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {q.options?.map((opt, optIdx) => (
                          <div key={optIdx} className={`flex items-center gap-1.5 px-2.5 py-1.75 rounded-lg text-xs text-slate-600 bg-white border-[1.5px] border-slate-200 ${optIdx === q.correctAnswer ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium' : ''}`}>
                            <span className="font-['Sora',sans-serif] text-[11px] font-bold text-slate-400 flex-shrink-0">{String.fromCharCode(65 + optIdx)}</span>
                            {opt}
                            {optIdx === q.correctAnswer && <CheckCircleOutlined className="text-emerald-500 flex-shrink-0 ml-auto" />}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-2.5 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700 flex items-start gap-1.5">
                          <BulbOutlined /> {q.explanation}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button 
                        className="w-8 h-8 rounded-lg border-none bg-blue-50 text-blue-500 flex items-center justify-center cursor-pointer text-sm transition-colors hover:bg-blue-100"
                        onClick={() => handleEditQuestion(idx)}
                      ><EditOutlined /></button>
                      <button 
                        className="w-8 h-8 rounded-lg border-none bg-rose-50 text-rose-500 flex items-center justify-center cursor-pointer text-sm transition-colors hover:bg-rose-100"
                        onClick={() => handleDeleteQuestion(idx)}
                      ><DeleteOutlined /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between animate-[slide-up_0.6s_0.3s_ease_both]">
            <button
              className="inline-flex items-center gap-1.75 px-5 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white font-['DM_Sans',sans-serif] text-sm font-semibold text-slate-500 cursor-pointer transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.back()}
            >
              <ArrowLeftOutlined /> {currentStep === 0 ? 'Back' : 'Previous'}
            </button>

            {currentStep < 2 ? (
              <button
                className={`inline-flex items-center gap-2 px-6 py-2.75 rounded-xl border-none bg-gradient-to-br from-blue-500 to-indigo-500 font-['DM_Sans',sans-serif] text-sm font-bold text-white cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)] ${currentStep === 1 ? 'bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 shadow-[0_4px_18px_rgba(124,58,237,0.35)]' : ''} ${!canProceed() || generating ? 'opacity-45 cursor-not-allowed hover:transform-none hover:shadow-none' : ''}`}
                onClick={() => {
                  if (!canProceed()) return;
                  if (currentStep === 1) handleGenerateQuiz();
                  else setCurrentStep(currentStep + 1);
                }}
                disabled={!canProceed() || generating}
              >
                {currentStep === 1
                  ? (generating
                    ? <><span className="w-3.5 h-3.5 rounded-full border-[2.5px] border-white/35 border-t-white animate-spin inline-block" /> Generating…</>
                    : <><Wand2 size={16} /> Generate Quiz</>)
                  : <>Next <ArrowRightOutlined /></>
                }
              </button>
            ) : (
              <div className="flex gap-2.5">
                <button 
                  className="inline-flex items-center gap-1.75 px-5 py-2.75 rounded-xl border-[1.5px] border-slate-200 bg-white font-['DM_Sans',sans-serif] text-sm font-semibold text-slate-500 cursor-pointer transition-all hover:border-indigo-200 hover:bg-violet-50 hover:text-indigo-600"
                  onClick={() => setCurrentStep(1)}
                >
                  <Sparkles size={16} /> Regenerate
                </button>
                <button 
                  className="inline-flex items-center gap-2 px-6 py-2.75 rounded-xl border-none bg-gradient-to-br from-emerald-500 to-emerald-600 font-['DM_Sans',sans-serif] text-sm font-bold text-white cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,185,129,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleSaveQuiz} 
                  disabled={saving}
                >
                  {saving ? <><span className="w-3.5 h-3.5 rounded-full border-[2.5px] border-white/35 border-t-white animate-spin inline-block" /> Saving…</> : <><SaveOutlined /> Save Quiz</>}
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&display=swap');
          
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes pulse {
            0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(99,102,241,0); }
          }
          @keyframes spin { 
            to { transform: rotate(360deg); } 
          }
        `}</style>
      </DashboardLayout>
    </ProtectedRoute>
  );
}