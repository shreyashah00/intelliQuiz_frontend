'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Input,
  Select,
  Slider,
  Checkbox,
  Modal,
  message,
  Steps,
  Empty,
  Spin,
  Tag,
  ConfigProvider,
  theme,
  Divider,
  Space,
  Progress
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
  BookOutlined
} from '@ant-design/icons';
import { Brain, FileText, Sparkles, Wand2, Settings, Plus, Minus, CheckCircle, Upload } from 'lucide-react';
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
  const [previewVisible, setPreviewVisible] = useState(false);
  
  const [quizConfig, setQuizConfig] = useState({
    title: '',
    description: '',
    numberOfQuestions: 10,
    difficulty: 'medium',
    subject: '',
    timeLimit: 20,
  });

  useEffect(() => {
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
    if (selectedFiles.length === 0) {
      message.warning('Please select at least one file');
      return;
    }

    if (!quizConfig.title.trim()) {
      message.warning('Please enter a quiz title');
      return;
    }

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
      console.error('Error generating quiz:', err);
      message.error(err.response?.data?.message || 'Failed to generate quiz. Please try again.');
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
      console.error('Error saving quiz:', error);
      message.error(error.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return selectedFiles.length > 0;
    if (currentStep === 1) return quizConfig.title.trim() !== '';
    return true;
  };

  const lightTheme = {
    token: {
      colorPrimary: '#4f46e5',
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBorder: '#e5e7eb',
      colorText: '#1f2937',
      colorTextSecondary: '#6b7280',
      borderRadius: 12,
    },
    components: {
      Input: {
        colorBgContainer: '#f9fafb',
        colorBorder: '#d1d5db',
        colorText: '#1f2937',
        colorTextPlaceholder: '#9ca3af',
      },
      Select: {
        colorBgContainer: '#f9fafb',
        colorBorder: '#d1d5db',
        colorText: '#1f2937',
        optionSelectedBg: 'rgba(79, 70, 229, 0.1)',
        colorBgElevated: '#ffffff',
      },
      Slider: {
        railBg: '#e5e7eb',
        trackBg: '#4f46e5',
        trackHoverBg: '#6366f1',
        handleColor: '#4f46e5',
        handleActiveColor: '#6366f1',
      },
      Modal: {
        contentBg: '#ffffff',
        headerBg: '#ffffff',
        titleColor: '#1f2937',
      },
      Steps: {
        colorPrimary: '#4f46e5',
      },
      Card: {
        colorBgContainer: 'rgba(255, 255, 255, 0.8)',
        colorBorder: 'rgba(99, 102, 241, 0.2)',
      },
    },
  };

  const steps = [
    {
      title: 'Select Files',
      icon: <FileTextOutlined />,
    },
    {
      title: 'Configure',
      icon: <SettingOutlined />,
    },
    {
      title: 'Review',
      icon: <EyeOutlined />,
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <DashboardLayout role="teacher">
          <div className="flex items-center justify-center h-96">
            <Spin size="large" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <ConfigProvider theme={lightTheme}>
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl -top-32 -right-32"></div>
                <div className="absolute w-48 h-48 bg-white rounded-full blur-3xl -bottom-24 -left-24"></div>
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">AI Quiz Generator</h1>
                    <p className="text-blue-100">Create intelligent quizzes from your documents</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50" bordered>
              <Steps
                current={currentStep}
                items={steps}
                className="custom-steps"
              />
            </Card>

            {/* Step Content */}
            {currentStep === 0 && (
              <Card 
                className="bg-white/80 backdrop-blur-xl border-blue-200/50" 
                bordered
                title={
                  <div className="flex items-center gap-2 text-gray-900">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Select Source Documents</span>
                  </div>
                }
              >
                {files.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm mb-4">
                      Select one or more documents to generate quiz questions from. Only processed files are shown.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {files.map((file) => (
                        <div
                          key={file.FileID}
                          onClick={() => toggleFileSelection(file.FileID)}
                          className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                            selectedFiles.includes(file.FileID)
                              ? 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-500/10'
                              : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          <Checkbox 
                            checked={selectedFiles.includes(file.FileID)} 
                            onChange={() => toggleFileSelection(file.FileID)}
                          />
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <FileTextOutlined className="text-white text-lg" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-medium truncate">{file.FileName}</p>
                            <p className="text-gray-500 text-sm">{file.FileType?.toUpperCase()}</p>
                          </div>
                          {selectedFiles.includes(file.FileID) && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-600 text-sm">
                        <span className="text-blue-600 font-medium">{selectedFiles.length}</span> file(s) selected
                      </p>
                    </div>
                  </div>
                ) : (
                  <Empty
                    image={<FileText className="w-16 h-16 text-gray-400 mx-auto" />}
                    description={
                      <div className="space-y-2">
                        <p className="text-gray-600">No processed files available</p>
                        <p className="text-gray-500 text-sm">Upload and process documents first to generate quizzes</p>
                      </div>
                    }
                  >
                    <Button 
                      type="primary" 
                      icon={<Upload className="w-4 h-4" />}
                      onClick={() => router.push('/file-management')}
                    >
                      Upload Files
                    </Button>
                  </Empty>
                )}
              </Card>
            )}

            {currentStep === 1 && (
              <Card 
                className="bg-white/80 backdrop-blur-xl border-blue-200/50" 
                bordered
                title={
                  <div className="flex items-center gap-2 text-gray-900">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span>Quiz Configuration</span>
                  </div>
                }
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Quiz Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={quizConfig.title}
                        onChange={(e) => handleConfigChange('title', e.target.value)}
                        placeholder="Enter an engaging title for your quiz"
                        size="large"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">Description</label>
                      <TextArea
                        rows={3}
                        value={quizConfig.description}
                        onChange={(e) => handleConfigChange('description', e.target.value)}
                        placeholder="Brief description about the quiz content and objectives"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Subject</label>
                      <Input
                        value={quizConfig.subject}
                        onChange={(e) => handleConfigChange('subject', e.target.value)}
                        placeholder="e.g., Mathematics, Science, History"
                        size="large"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Difficulty Level</label>
                      <Select
                        value={quizConfig.difficulty}
                        onChange={(value) => handleConfigChange('difficulty', value)}
                        className="w-full"
                        size="large"
                      >
                        <Option value="easy">
                          <div className="flex items-center gap-2">
                            <Tag color="success">Easy</Tag>
                            <span className="text-gray-500 text-sm">Basic understanding</span>
                          </div>
                        </Option>
                        <Option value="medium">
                          <div className="flex items-center gap-2">
                            <Tag color="warning">Medium</Tag>
                            <span className="text-gray-500 text-sm">Applied knowledge</span>
                          </div>
                        </Option>
                        <Option value="hard">
                          <div className="flex items-center gap-2">
                            <Tag color="error">Hard</Tag>
                            <span className="text-gray-500 text-sm">Advanced concepts</span>
                          </div>
                        </Option>
                      </Select>
                    </div>
                  </div>

                  <Divider className="border-gray-200" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-gray-700 font-medium mb-4">
                        Number of Questions: <span className="text-blue-600 font-bold">{quizConfig.numberOfQuestions}</span>
                      </label>
                      <Slider
                        min={5}
                        max={50}
                        value={quizConfig.numberOfQuestions}
                        onChange={(value) => handleConfigChange('numberOfQuestions', value)}
                        marks={{
                          5: '5',
                          15: '15',
                          30: '30',
                          50: '50',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-4">
                        Time Limit: <span className="text-blue-600 font-bold">{quizConfig.timeLimit} minutes</span>
                      </label>
                      <Slider
                        min={5}
                        max={120}
                        value={quizConfig.timeLimit}
                        onChange={(value) => handleConfigChange('timeLimit', value)}
                        marks={{
                          5: '5m',
                          30: '30m',
                          60: '1h',
                          120: '2h',
                        }}
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-blue-50 border border-blue-200/50 rounded-xl">
                    <h4 className="text-blue-700 font-medium mb-3 flex items-center gap-2">
                      <BulbOutlined />
                      Quiz Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Files Selected</p>
                        <p className="text-gray-900 font-medium">{selectedFiles.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Questions</p>
                        <p className="text-gray-900 font-medium">{quizConfig.numberOfQuestions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Difficulty</p>
                        <p className="text-gray-900 font-medium capitalize">{quizConfig.difficulty}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="text-gray-900 font-medium">{quizConfig.timeLimit} min</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 2 && generatedQuiz && (
              <Card 
                className="bg-white/80 backdrop-blur-xl border-blue-200/50" 
                bordered
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-900">
                      <CheckCircleOutlined className="text-green-500" />
                      <span>Generated Quiz Preview</span>
                    </div>
                    <Tag color="success">{generatedQuiz.questions?.length} Questions Generated</Tag>
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Quiz Info */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{generatedQuiz.title}</h3>
                    <p className="text-gray-600 mb-4">{generatedQuiz.description}</p>
                    <div className="flex flex-wrap gap-3">
                      <Tag icon={<ThunderboltOutlined />} color="purple">
                        {generatedQuiz.difficulty?.toUpperCase()}
                      </Tag>
                      <Tag icon={<ClockCircleOutlined />} color="blue">
                        {generatedQuiz.timeLimit} Minutes
                      </Tag>
                      <Tag icon={<BookOutlined />} color="green">
                        {generatedQuiz.questions?.length} Questions
                      </Tag>
                    </div>
                  </div>

                  {/* Questions Preview */}
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {generatedQuiz.questions?.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200"
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.back()}
                className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              >
                {currentStep === 0 ? 'Back' : 'Previous'}
              </Button>

              {currentStep < 2 ? (
                <Button
                  type="primary"
                  size="large"
                  icon={currentStep === 1 ? <ThunderboltOutlined /> : <ArrowRightOutlined />}
                  onClick={() => {
                    if (currentStep === 1) {
                      handleGenerateQuiz();
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  disabled={!canProceed()}
                  loading={generating}
                  className={currentStep === 1 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-0' : ''}
                  style={currentStep === 1 ? { background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))' } : {}}
                >
                  {currentStep === 1 ? (generating ? 'Generating...' : 'Generate Quiz') : 'Next'}
                </Button>
              ) : (
                <Space>
                  <Button
                    size="large"
                    onClick={() => setCurrentStep(1)}
                    className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                  >
                    Regenerate
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSaveQuiz}
                    loading={saving}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 border-0"
                    style={{ background: 'linear-gradient(to right, rgb(22, 163, 74), rgb(16, 185, 129))' }}
                  >
                    Save Quiz
                  </Button>
                </Space>
              )}
            </div>
          </div>

          <style jsx global>{`
            .custom-steps .ant-steps-item-process .ant-steps-item-icon {
              background: linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229)) !important;
              border-color: transparent !important;
            }
            .custom-steps .ant-steps-item-finish .ant-steps-item-icon {
              background: rgba(34, 197, 94, 0.1) !important;
              border-color: rgb(34, 197, 94) !important;
            }
            .custom-steps .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon {
              color: rgb(34, 197, 94) !important;
            }
            .custom-steps .ant-steps-item-title {
              color: #6b7280 !important;
            }
            .custom-steps .ant-steps-item-process .ant-steps-item-title {
              color: #1f2937 !important;
            }
            .custom-steps .ant-steps-item-finish .ant-steps-item-title {
              color: rgb(34, 197, 94) !important;
            }
          `}</style>
        </ConfigProvider>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
