'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  message,
  Radio,
  Divider,
  Tag,
  ConfigProvider,
  theme,
  Collapse,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  DragOutlined,
  CopyOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { Plus, Minus, GripVertical, Trash2, Copy, BookOpen, Settings } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { quizAPI } from '../../../utils/api';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

export default function CreateQuizPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([{
    id: Date.now(),
    questionText: '',
    questionType: 'multiple_choice',
    points: 1,
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  }]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      questionText: '',
      questionType: 'multiple_choice',
      points: 1,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    }]);
    message.success('Question added');
  };

  const duplicateQuestion = (questionId) => {
    const questionToDuplicate = questions.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const newQuestion = {
        ...questionToDuplicate,
        id: Date.now(),
        options: questionToDuplicate.options.map(opt => ({ ...opt }))
      };
      const index = questions.findIndex(q => q.id === questionId);
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      setQuestions(newQuestions);
      message.success('Question duplicated');
    }
  };

  const removeQuestion = (questionId) => {
    if (questions.length === 1) {
      message.warning('Quiz must have at least one question');
      return;
    }
    setQuestions(questions.filter(q => q.id !== questionId));
    message.success('Question removed');
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId, optionIndex, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const setCorrectAnswer = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = q.options.map((opt, idx) => ({
          ...opt,
          isCorrect: idx === optionIndex
        }));
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const validateQuiz = () => {
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        message.error(`Question ${i + 1} text is required`);
        return false;
      }

      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].text.trim()) {
          message.error(`Question ${i + 1}, Option ${j + 1} text is required`);
          return false;
        }
      }

      const hasCorrectAnswer = questions[i].options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        message.error(`Question ${i + 1} must have one correct answer`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (values) => {
    if (!validateQuiz()) {
      return;
    }

    setLoading(true);
    try {
      const quizData = {
        title: values.title,
        description: values.description,
        difficulty: values.difficulty,
        subject: values.subject,
        timeLimit: values.timeLimit,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          options: q.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect
          }))
        }))
      };

      const response = await quizAPI.createQuiz(quizData);
      
      if (response.data.success) {
        message.success('Quiz created successfully!');
        router.push('/teacher/quiz-management');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      message.error(error.response?.data?.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  const lightTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#4F46E5',
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBorder: '#e5e7eb',
      colorText: '#111827',
      colorTextSecondary: '#6b7280',
      borderRadius: 12,
    },
    components: {
      Input: {
        colorBgContainer: '#f9fafb',
        colorBorder: '#d1d5db',
        colorText: '#111827',
        colorTextPlaceholder: '#9ca3af',
      },
      InputNumber: {
        colorBgContainer: '#f9fafb',
        colorBorder: '#d1d5db',
        colorText: '#111827',
      },
      Select: {
        colorBgContainer: '#f9fafb',
        colorBorder: '#d1d5db',
        colorText: '#111827',
        optionSelectedBg: 'rgba(79, 70, 229, 0.1)',
        colorBgElevated: '#ffffff',
      },
      Form: {
        labelColor: '#374151',
      },
      Radio: {
        colorPrimary: '#4F46E5',
      },
      Collapse: {
        headerBg: 'transparent',
        contentBg: 'transparent',
      },
    },
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <ConfigProvider theme={lightTheme}>
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.back()}
                  className="text-gray-500 hover:text-gray-700 mb-2 -ml-3"
                >
                  Back
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Quiz Manually</h1>
                <p className="text-gray-500 mt-1">Build your quiz question by question</p>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-blue-200/50 shadow-sm">
                <div className="text-center px-3 border-r border-gray-200">
                  <p className="text-2xl font-bold text-indigo-600">{questions.length}</p>
                  <p className="text-xs text-gray-500">Questions</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-2xl font-bold text-purple-600">{totalPoints}</p>
                  <p className="text-xs text-gray-500">Total Points</p>
                </div>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                difficulty: 'medium',
                timeLimit: 30
              }}
            >
              {/* Quiz Details Card */}
              <Card 
                className="bg-white/80 backdrop-blur-xl border-blue-200/50 mb-6 shadow-sm" 
                bordered
                title={
                  <div className="flex items-center gap-2 text-gray-900">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    <span>Quiz Details</span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="title"
                    label={<span className="text-gray-600 font-medium">Quiz Title</span>}
                    rules={[{ required: true, message: 'Please enter quiz title' }]}
                    className="md:col-span-2"
                  >
                    <Input placeholder="Enter an engaging title for your quiz" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={<span className="text-gray-600 font-medium">Description</span>}
                    className="md:col-span-2"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Brief description about the quiz content"
                    />
                  </Form.Item>

                  <Form.Item
                    name="difficulty"
                    label={<span className="text-gray-600 font-medium">Difficulty</span>}
                    rules={[{ required: true, message: 'Select difficulty' }]}
                  >
                    <Select size="large">
                      <Option value="easy">
                        <Tag color="success">Easy</Tag>
                      </Option>
                      <Option value="medium">
                        <Tag color="warning">Medium</Tag>
                      </Option>
                      <Option value="hard">
                        <Tag color="error">Hard</Tag>
                      </Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="subject"
                    label={<span className="text-gray-600 font-medium">Subject</span>}
                  >
                    <Input placeholder="e.g., Programming, Science" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="timeLimit"
                    label={<span className="text-gray-600 font-medium">Time Limit (minutes)</span>}
                  >
                    <InputNumber min={1} max={180} className="w-full" size="large" />
                  </Form.Item>
                </div>
              </Card>

              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Questions
                  </h2>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addQuestion}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0"
                    style={{ background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234))' }}
                  >
                    Add Question
                  </Button>
                </div>

                {questions.map((question, qIndex) => (
                  <Card
                    key={question.id}
                    className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-sm"
                    bordered
                    title={
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{qIndex + 1}</span>
                          </div>
                          <span className="text-gray-900 font-semibold">Question {qIndex + 1}</span>
                          <Tag color="purple">{question.points} {question.points === 1 ? 'point' : 'points'}</Tag>
                        </div>
                        <Space>
                          <Tooltip title="Duplicate">
                            <Button
                              type="text"
                              icon={<CopyOutlined />}
                              onClick={() => duplicateQuestion(question.id)}
                              className="text-gray-400 hover:text-indigo-600"
                            />
                          </Tooltip>
                          {questions.length > 1 && (
                            <Tooltip title="Delete">
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeQuestion(question.id)}
                              />
                            </Tooltip>
                          )}
                        </Space>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-600 font-medium block mb-2">
                          Question Text <span className="text-red-500">*</span>
                        </label>
                        <TextArea
                          rows={2}
                          value={question.questionText}
                          onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                          placeholder="Enter your question here..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-600 font-medium block mb-2">Points</label>
                          <InputNumber
                            min={1}
                            max={10}
                            value={question.points}
                            onChange={(value) => updateQuestion(question.id, 'points', value)}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <Divider className="border-gray-200 my-4" />

                      <div>
                        <label className="text-gray-600 font-medium block mb-3 flex items-center gap-2">
                          <CheckCircleOutlined className="text-green-500" />
                          Answer Options <span className="text-red-500">*</span>
                          <span className="text-gray-400 text-sm font-normal">(Select the correct answer)</span>
                        </label>
                        
                        <Radio.Group
                          value={question.options.findIndex(opt => opt.isCorrect)}
                          onChange={(e) => setCorrectAnswer(question.id, e.target.value)}
                          className="w-full"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex} 
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                  option.isCorrect 
                                    ? 'bg-green-50 border-green-300' 
                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <Radio value={optIndex}>
                                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                    option.isCorrect 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                </Radio>
                                <Input
                                  value={option.text}
                                  onChange={(e) => updateOption(question.id, optIndex, 'text', e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                  className="flex-1"
                                  variant="borderless"
                                />
                                {option.isCorrect && (
                                  <Tag color="success" className="m-0">Correct</Tag>
                                )}
                              </div>
                            ))}
                          </div>
                        </Radio.Group>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Add Question Button (Bottom) */}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <PlusOutlined />
                  Add Another Question
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col md:flex-row gap-4 mt-8 sticky bottom-4 bg-gradient-to-t from-blue-50 via-blue-50/95 to-transparent pt-8 pb-4 -mx-4 px-4">
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-base font-semibold"
                  style={{ background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234))' }}
                >
                  Create Quiz ({questions.length} Questions, {totalPoints} Points)
                </Button>
                <Button
                  size="large"
                  onClick={() => router.back()}
                  className="md:w-40 h-12 bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </ConfigProvider>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
