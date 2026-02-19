'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  message, 
  ConfigProvider, 
  theme,
  Tag,
  Radio,
  Modal,
  Spin
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  BookOutlined
} from '@ant-design/icons';
import { Edit3, Save } from 'lucide-react';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import DashboardLayout from '../../../../components/DashboardLayout';
import { quizAPI } from '../../../../../utils/api';

const { TextArea } = Input;
const { Option } = Select;

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState(null);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getQuizById(quizId);
      if (response.data.success) {
        const quizData = response.data.data;
        // Transform backend data structure to match our component needs
        const transformedQuiz = {
          ...quizData,
          questions: quizData.Questions?.map(q => ({
            question: q.QuestionText || q.Question,
            options: q.Options?.map(opt => opt.OptionText || opt) || [],
            correctAnswer: q.Options?.findIndex(opt => opt.IsCorrect) ?? q.CorrectAnswer ?? 0,
            explanation: q.Explanation || ''
          })) || []
        };
        setQuiz(transformedQuiz);
      } else {
        message.error('Failed to load quiz');
        router.push('/teacher/quiz-management');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      message.error('Failed to load quiz');
      router.push('/teacher/quiz-management');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizFieldChange = (field, value) => {
    setQuiz({
      ...quiz,
      [field]: value
    });
  };

  const handleAddQuestion = () => {
    setIsAddingQuestion(true);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
  };

  const handleEditQuestion = (index) => {
    const question = quiz.questions[index];
    setEditingQuestionIndex(index);
    setQuestionForm({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || ''
    });
  };

  const handleDeleteQuestion = (index) => {
    Modal.confirm({
      title: 'Delete Question',
      content: 'Are you sure you want to delete this question? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
        setQuiz({
          ...quiz,
          questions: updatedQuestions
        });
        message.success('Question deleted successfully');
      }
    });
  };

  const handleSaveQuestion = () => {
    if (!questionForm.question.trim()) {
      message.error('Please enter a question');
      return;
    }

    if (questionForm.options.some(opt => !opt.trim())) {
      message.error('Please fill in all options');
      return;
    }

    const updatedQuestions = [...quiz.questions];
    
    if (isAddingQuestion) {
      updatedQuestions.push(questionForm);
      message.success('Question added successfully');
    } else {
      updatedQuestions[editingQuestionIndex] = questionForm;
      message.success('Question updated successfully');
    }

    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });

    setEditingQuestionIndex(null);
    setIsAddingQuestion(false);
    setQuestionForm(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestionIndex(null);
    setIsAddingQuestion(false);
    setQuestionForm(null);
  };

  const updateQuestionFormField = (field, value) => {
    setQuestionForm({
      ...questionForm,
      [field]: value
    });
  };

  const updateQuestionOption = (index, value) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index] = value;
    setQuestionForm({
      ...questionForm,
      options: updatedOptions
    });
  };

  const handleSaveQuiz = async () => {
    // Validation
    if (!quiz.Title?.trim()) {
      message.error('Please enter a quiz title');
      return;
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      message.error('Please add at least one question');
      return;
    }

    setSaving(true);
    try {
      const response = await quizAPI.updateQuiz(quizId, {
        title: quiz.Title,
        description: quiz.Description,
        difficulty: quiz.Difficulty,
        timeLimit: quiz.TimeLimit,
        subject: quiz.Subject,
        questions: quiz.questions
      });

      if (response.data.success) {
        message.success('Quiz updated successfully');
        router.push('/teacher/quiz-management');
      } else {
        message.error(response.data.message || 'Failed to update quiz');
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      message.error(error.response?.data?.message || 'Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <DashboardLayout role="teacher">
          <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#4F46E5',
            },
          }}
        >
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push('/teacher/quiz-management')}
                  className="mb-4"
                >
                  Back to Quiz Management
                </Button>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Quiz</h1>
                    <p className="text-gray-600">Update quiz details, questions, and options</p>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSaveQuiz}
                    loading={saving}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 border-0"
                    style={{ background: 'linear-gradient(to right, rgb(22, 163, 74), rgb(16, 185, 129))' }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Quiz Basic Info */}
              <Card className="mb-6 bg-white/80 backdrop-blur-xl border-blue-200/50">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Quiz Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={quiz.Title}
                      onChange={(e) => handleQuizFieldChange('Title', e.target.value)}
                      placeholder="Enter quiz title"
                      size="large"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <TextArea
                      value={quiz.Description}
                      onChange={(e) => handleQuizFieldChange('Description', e.target.value)}
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Subject</label>
                      <Input
                        value={quiz.Subject}
                        onChange={(e) => handleQuizFieldChange('Subject', e.target.value)}
                        placeholder="e.g., Mathematics"
                        size="large"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Difficulty</label>
                      <Select
                        value={quiz.Difficulty}
                        onChange={(value) => handleQuizFieldChange('Difficulty', value)}
                        className="w-full"
                        size="large"
                      >
                        <Option value="easy">
                          <div className="flex items-center gap-2">
                            <Tag color="success">Easy</Tag>
                          </div>
                        </Option>
                        <Option value="medium">
                          <div className="flex items-center gap-2">
                            <Tag color="warning">Medium</Tag>
                          </div>
                        </Option>
                        <Option value="hard">
                          <div className="flex items-center gap-2">
                            <Tag color="error">Hard</Tag>
                          </div>
                        </Option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Time Limit (Minutes)</label>
                      <Input
                        type="number"
                        min={5}
                        max={180}
                        value={quiz.TimeLimit}
                        onChange={(e) => handleQuizFieldChange('TimeLimit', parseInt(e.target.value) || 10)}
                        size="large"
                      />
                    </div>
                  </div>

                  {/* Quiz Stats */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex flex-wrap gap-3">
                      <Tag icon={<ThunderboltOutlined />} color="purple">
                        {quiz.Difficulty?.toUpperCase()}
                      </Tag>
                      <Tag icon={<ClockCircleOutlined />} color="blue">
                        {quiz.TimeLimit} Minutes
                      </Tag>
                      <Tag icon={<BookOutlined />} color="green">
                        {quiz.questions?.length || 0} Questions
                      </Tag>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Questions Section */}
              <Card 
                className="bg-white/80 backdrop-blur-xl border-blue-200/50"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900">Questions</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddQuestion}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0"
                      style={{ background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))' }}
                    >
                      Add Question
                    </Button>
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Edit/Add Question Form */}
                  {(editingQuestionIndex !== null || isAddingQuestion) && questionForm && (
                    <Card 
                      className="border-2 border-blue-500 shadow-lg"
                      title={
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-5 h-5 text-blue-600" />
                          <span>{isAddingQuestion ? 'Add New Question' : `Edit Question ${editingQuestionIndex + 1}`}</span>
                        </div>
                      }
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Question Text</label>
                          <TextArea
                            value={questionForm.question}
                            onChange={(e) => updateQuestionFormField('question', e.target.value)}
                            placeholder="Enter your question here..."
                            rows={3}
                            className="border-gray-300"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Answer Options</label>
                          <div className="space-y-2">
                            {questionForm.options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Radio
                                  checked={questionForm.correctAnswer === idx}
                                  onChange={() => updateQuestionFormField('correctAnswer', idx)}
                                />
                                <Input
                                  value={option}
                                  onChange={(e) => updateQuestionOption(idx, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                  className="flex-1"
                                  prefix={<span className="font-semibold text-gray-500">{String.fromCharCode(65 + idx)}.</span>}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Select the radio button next to the correct answer</p>
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Explanation (Optional)</label>
                          <TextArea
                            value={questionForm.explanation}
                            onChange={(e) => updateQuestionFormField('explanation', e.target.value)}
                            placeholder="Add an explanation for the correct answer..."
                            rows={2}
                            className="border-gray-300"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button 
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSaveQuestion}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 border-0"
                            style={{ background: 'linear-gradient(to right, rgb(22, 163, 74), rgb(16, 185, 129))' }}
                          >
                            Save Question
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Questions List */}
                  {quiz.questions && quiz.questions.length > 0 ? (
                    <div className="space-y-3">
                      {quiz.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium mb-3">{q.question}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {q.options?.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`p-2 rounded-lg text-sm ${
                                      optIdx === q.correctAnswer
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-white border border-gray-200 text-gray-700'
                                    }`}
                                  >
                                    <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                    {opt}
                                    {optIdx === q.correctAnswer && (
                                      <CheckCircleOutlined className="ml-2 text-green-500" />
                                    )}
                                  </div>
                                ))}
                              </div>
                              {q.explanation && (
                                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                                  <BulbOutlined className="mr-2" />
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEditQuestion(idx)}
                                className="text-blue-600 hover:bg-blue-50"
                                size="small"
                              />
                              <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteQuestion(idx)}
                                className="text-red-600 hover:bg-red-50"
                                danger
                                size="small"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No questions added yet. Click "Add Question" to get started.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Save Button at Bottom */}
              <div className="mt-6 flex justify-end">
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSaveQuiz}
                  loading={saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 border-0"
                  style={{ background: 'linear-gradient(to right, rgb(22, 163, 74), rgb(16, 185, 129))' }}
                >
                  Save All Changes
                </Button>
              </div>
            </div>
          </div>
        </ConfigProvider>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
