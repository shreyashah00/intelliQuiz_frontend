'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Spin,
  ConfigProvider,
  theme,
  Empty,
  Statistic,
  Collapse,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  BookOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Brain, BookOpen, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { quizAPI } from '../../../utils/api';

const { Option } = Select;
const { Panel } = Collapse;

export default function QuestionBankPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [stats, setStats] = useState({ questionTypes: [], subjects: [] });
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    difficulty: '',
    questionType: ''
  });

  const lightTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#4F46E5',
      colorBgContainer: '#ffffff',
      colorBorder: '#e5e7eb',
      borderRadius: 12,
    },
    components: {
      Table: {
        headerBg: '#f9fafb',
        headerColor: '#6b7280',
        rowHoverBg: '#eff6ff',
        borderColor: '#e5e7eb',
      },
      Card: {
        colorBgContainer: 'rgba(255, 255, 255, 0.8)',
        colorBorder: 'rgba(59, 130, 246, 0.2)',
      },
    },
  };

  useEffect(() => {
    fetchQuestions();
  }, [pagination.page, pagination.limit, filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.questionType && { questionType: filters.questionType }),
      };

      const response = await quizAPI.getQuestionBank(params);
      if (response.data.success) {
        setQuestions(response.data.data.questions || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination?.total || 0,
          totalPages: response.data.data.pagination?.totalPages || 0,
        }));
        setStats(response.data.data.stats || { questionTypes: [], subjects: [] });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', subject: '', difficulty: '', questionType: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      render: (text, record) => (
        <div>
          <p className="text-gray-900 font-medium mb-1">{text}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Tag color="blue">{record.questionType?.replace('_', ' ')}</Tag>
            <Tag color="purple">{record.points} {record.points === 1 ? 'point' : 'points'}</Tag>
            <span className="text-gray-500 text-xs">Used {record.usageCount} times</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Quiz Details',
      key: 'quiz',
      width: 250,
      render: (_, record) => (
        <div>
          <p className="text-gray-900 font-medium text-sm">{record.quiz.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Tag color={
              record.quiz.difficulty === 'easy' ? 'success' :
              record.quiz.difficulty === 'medium' ? 'warning' : 'error'
            }>
              {record.quiz.difficulty}
            </Tag>
            <span className="text-gray-500 text-xs">{record.quiz.subject}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <span className="text-gray-600 text-sm">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => router.push(`/quiz/${record.quiz.quizId}`)}
        >
          View Quiz
        </Button>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Answer Options:</h4>
        <div className="space-y-2">
          {record.options && record.options.length > 0 ? (
            record.options.map((option, index) => (
              <div
                key={option.optionId}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  option.isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  option.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-gray-900 flex-1">{option.text}</span>
                {option.isCorrect && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Correct</Tag>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No options available</p>
          )}
        </div>
      </div>
    );
  };

  // Calculate statistics for display
  const totalQuestions = pagination.total;
  const uniqueSubjects = stats.subjects?.length || 0;
  const multipleChoiceCount = stats.questionTypes?.find(t => t.QuestionType === 'multiple_choice')?._count?.QuestionID || 0;

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <ConfigProvider theme={lightTheme}>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
              <p className="text-gray-500 mt-1">Browse and manage all your quiz questions</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:shadow-lg transition-all" bordered>
                <Statistic
                  title={<span className="text-gray-500">Total Questions</span>}
                  value={totalQuestions}
                  prefix={<QuestionCircleOutlined className="text-blue-600 mr-2" />}
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                />
              </Card>
              <Card className="bg-white/80 backdrop-blur-xl border-purple-200/50 hover:shadow-lg transition-all" bordered>
                <Statistic
                  title={<span className="text-gray-500">Subjects</span>}
                  value={uniqueSubjects}
                  prefix={<BookOutlined className="text-purple-600 mr-2" />}
                  valueStyle={{ color: '#9333ea', fontWeight: 'bold' }}
                />
              </Card>
              <Card className="bg-white/80 backdrop-blur-xl border-green-200/50 hover:shadow-lg transition-all" bordered>
                <Statistic
                  title={<span className="text-gray-500">Multiple Choice</span>}
                  value={multipleChoiceCount}
                  prefix={<CheckCircleOutlined className="text-green-600 mr-2" />}
                  valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
                />
              </Card>
              <Card className="bg-white/80 backdrop-blur-xl border-orange-200/50 hover:shadow-lg transition-all" bordered>
                <Statistic
                  title={<span className="text-gray-500">Question Types</span>}
                  value={stats.questionTypes?.length || 0}
                  prefix={<FileTextOutlined className="text-orange-600 mr-2" />}
                  valueStyle={{ color: '#ea580c', fontWeight: 'bold' }}
                />
              </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50" bordered>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <FilterOutlined className="text-blue-600" />
                  <h3 className="text-gray-900 font-semibold">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Input
                    placeholder="Search questions..."
                    prefix={<SearchOutlined />}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    allowClear
                    size="large"
                    className="lg:col-span-2"
                  />
                  <Select
                    placeholder="Select Subject"
                    value={filters.subject || undefined}
                    onChange={(value) => handleFilterChange('subject', value)}
                    allowClear
                    size="large"
                  >
                    {stats.subjects?.map((s) => (
                      <Option key={s.Subject} value={s.Subject}>
                        {s.Subject} ({s._count?.QuizID || 0})
                      </Option>
                    ))}
                  </Select>
                  <Select
                    placeholder="Difficulty"
                    value={filters.difficulty || undefined}
                    onChange={(value) => handleFilterChange('difficulty', value)}
                    allowClear
                    size="large"
                  >
                    <Option value="easy">Easy</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="hard">Hard</Option>
                  </Select>
                  <Select
                    placeholder="Question Type"
                    value={filters.questionType || undefined}
                    onChange={(value) => handleFilterChange('questionType', value)}
                    allowClear
                    size="large"
                  >
                    <Option value="multiple_choice">Multiple Choice</Option>
                    <Option value="true_false">True/False</Option>
                    <Option value="short_answer">Short Answer</Option>
                  </Select>
                </div>
                {(filters.search || filters.subject || filters.difficulty || filters.questionType) && (
                  <Button onClick={clearFilters} size="small">
                    Clear All Filters
                  </Button>
                )}
              </div>
            </Card>

            {/* Questions Table */}
            <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 overflow-hidden" bordered bodyStyle={{ padding: 0 }}>
              <Table
                columns={columns}
                dataSource={questions}
                rowKey="questionId"
                loading={loading}
                expandable={{
                  expandedRowRender,
                  rowExpandable: (record) => record.options && record.options.length > 0,
                }}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  showSizeChanger: true,
                  showTotal: (total) => <span className="text-gray-500">Total {total} questions</span>,
                  onChange: (page, pageSize) => {
                    setPagination(prev => ({ ...prev, page, limit: pageSize }));
                  },
                  className: "px-4 pb-4"
                }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div className="py-8">
                          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">No questions found</p>
                          <p className="text-gray-500 text-sm">
                            Create quizzes to build your question bank
                          </p>
                        </div>
                      }
                    />
                  )
                }}
              />
            </Card>
          </div>
        </ConfigProvider>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
