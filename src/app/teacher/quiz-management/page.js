'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Modal, 
  message, 
  Tag, 
  Tooltip, 
  Card, 
  Statistic, 
  Space, 
  Dropdown, 
  Empty,
  Spin,
  ConfigProvider,
  theme,
  Checkbox,
  DatePicker,
  Switch,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  LinkOutlined,
  SearchOutlined,
  CopyOutlined,
  MoreOutlined,
  EditOutlined,
  BarChartOutlined,
  RobotOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { BookOpen, Brain, FileText, Sparkles, Users } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { quizAPI, quizResponseAPI, groupAPI } from '../../../utils/api';

const { Option } = Select;

export default function QuizManagementPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [linkModal, setLinkModal] = useState(false);
  const [selectedQuizLink, setSelectedQuizLink] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [responsesModal, setResponsesModal] = useState(false);
  const [responses, setResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [publishToGroupsModal, setPublishToGroupsModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(null);
  const [scheduledQuizzes, setScheduledQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchQuizzes();
    fetchScheduledQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getAllQuizzes();
      if (response.data.success) {
        setQuizzes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      message.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledQuizzes = async () => {
    try {
      const response = await quizAPI.getScheduledQuizzes();
      if (response.data.success) {
        setScheduledQuizzes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled quizzes:', error);
    }
  };

  const handleDelete = (quizId) => {
    Modal.confirm({
      title: 'Delete Quiz',
      content: 'Are you sure you want to delete this quiz? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      okButtonProps: { 
        style: { background: '#ef4444' }
      },
      onOk: async () => {
        try {
          await quizAPI.deleteQuiz(quizId);
          message.success('Quiz deleted successfully');
          fetchQuizzes();
        } catch (error) {
          console.error('Error deleting quiz:', error);
          message.error(error.response?.data?.message || 'Failed to delete quiz');
        }
      }
    });
  };

  const handlePublish = async (quizId) => {
    try {
      await quizAPI.publishQuiz(quizId);
      message.success('Quiz published successfully');
      fetchQuizzes();
    } catch (error) {
      console.error('Error publishing quiz:', error);
      message.error(error.response?.data?.message || 'Failed to publish quiz');
    }
  };

  const handleUnpublish = async (quizId) => {
    try {
      await quizAPI.unpublishQuiz(quizId);
      message.success('Quiz unpublished successfully');
      fetchQuizzes();
    } catch (error) {
      console.error('Error unpublishing quiz:', error);
      message.error(error.response?.data?.message || 'Failed to unpublish quiz');
    }
  };

  const handleGenerateLink = (quiz) => {
    const link = `${window.location.origin}/quiz/${quiz.QuizID}`;
    setSelectedQuizLink(link);
    setSelectedQuiz(quiz);
    setLinkModal(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(selectedQuizLink);
    message.success('Link copied to clipboard!');
  };

  const viewResponses = async (quiz) => {
    setSelectedQuiz(quiz);
    setResponsesModal(true);
    setLoadingResponses(true);
    try {
      const response = await quizResponseAPI.getQuizResponses(quiz.QuizID);
      if (response.data.success) {
        setResponses(response.data.data?.responses || []);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
      setResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  const openPublishToGroupsModal = async (quiz) => {
    setSelectedQuiz(quiz);
    setPublishToGroupsModal(true);
    setLoadingGroups(true);
    try {
      const response = await groupAPI.getGroups();
      if (response.data.success) {
        setGroups(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      message.error('Failed to load groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handlePublishToGroups = async () => {
    if (selectedGroups.length === 0) {
      message.error('Please select at least one group');
      return;
    }

    if (isScheduled && !scheduledAt) {
      message.error('Please select a date and time for scheduling');
      return;
    }

    if (isScheduled && scheduledAt && new Date(scheduledAt) <= new Date()) {
      message.error('Scheduled time must be in the future');
      return;
    }

    try {
      const payload = {
        QuizID: selectedQuiz.QuizID,
        GroupIDs: selectedGroups
      };

      if (isScheduled) {
        payload.isScheduled = true;
        payload.scheduledAt = scheduledAt;
      }

      const response = await quizAPI.publishToGroups(payload);
      if (response.data.success) {
        message.success(response.data.message || 'Quiz published to groups successfully');
        setPublishToGroupsModal(false);
        setSelectedGroups([]);
        setIsScheduled(false);
        setScheduledAt(null);
        fetchScheduledQuizzes();
      }
    } catch (error) {
      console.error('Error publishing to groups:', error);
      message.error(error.response?.data?.message || 'Failed to publish quiz to groups');
    }
  };

  const handleCancelScheduled = async (quizId, groupId) => {
    try {
      await quizAPI.cancelScheduledPublishing(quizId, groupId);
      message.success('Scheduled publishing cancelled successfully');
      fetchScheduledQuizzes();
    } catch (error) {
      console.error('Error cancelling scheduled publishing:', error);
      message.error(error.response?.data?.message || 'Failed to cancel scheduled publishing');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.Subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || quiz.Difficulty?.toLowerCase() === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && quiz.IsPublished) ||
                         (filterStatus === 'draft' && !quiz.IsPublished);
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const stats = {
    total: quizzes.length,
    published: quizzes.filter(q => q.IsPublished).length,
    drafts: quizzes.filter(q => !q.IsPublished).length,
    totalQuestions: quizzes.reduce((sum, q) => sum + (q.TotalQuestions || 0), 0)
  };

  const getActionItems = (record) => {
    const items = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Preview Quiz',
        onClick: () => router.push(`/quiz/${record.QuizID}`)
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit Quiz',
        onClick: () => router.push(`/teacher/quiz-management/edit/${record.QuizID}`)
      },
      {
        key: 'responses',
        icon: <BarChartOutlined />,
        label: 'View Responses',
        onClick: () => viewResponses(record)
      },
      {
        key: 'link',
        icon: <LinkOutlined />,
        label: 'Share Link',
        onClick: () => handleGenerateLink(record)
      },
      {
        key: 'publish-groups',
        icon: <TeamOutlined />,
        label: 'Publish to Groups',
        onClick: () => openPublishToGroupsModal(record)
      }
    ];

    // Add unpublish option if quiz is published
    if (record.IsPublished) {
      items.push({
        key: 'unpublish',
        icon: <ClockCircleOutlined />,
        label: 'Unpublish',
        onClick: () => handleUnpublish(record.QuizID)
      });
    }

    items.push(
      {
        type: 'divider'
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete Quiz',
        danger: true,
        onClick: () => handleDelete(record.QuizID)
      }
    );

    return items;
  };

  const columns = [
    {
      title: 'Quiz',
      dataIndex: 'Title',
      key: 'Title',
      render: (title, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-900 font-medium text-sm">{title}</p>
            <p className="text-gray-500 text-xs">{record.Subject || 'General'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Questions',
      dataIndex: 'TotalQuestions',
      key: 'TotalQuestions',
      width: 100,
      align: 'center',
      render: (count) => (
        <div className="flex items-center justify-center gap-1.5">
          <QuestionCircleOutlined className="text-blue-600" />
          <span className="text-gray-900 font-medium">{count}</span>
        </div>
      ),
    },
    {
      title: 'Difficulty',
      dataIndex: 'Difficulty',
      key: 'Difficulty',
      width: 110,
      align: 'center',
      render: (difficulty) => {
        const config = {
          easy: { color: 'success', text: 'Easy' },
          medium: { color: 'warning', text: 'Medium' },
          hard: { color: 'error', text: 'Hard' }
        };
        const { color, text } = config[difficulty?.toLowerCase()] || { color: 'default', text: difficulty };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Time',
      dataIndex: 'TimeLimit',
      key: 'TimeLimit',
      width: 90,
      align: 'center',
      render: (time) => (
        <div className="flex items-center justify-center gap-1.5">
          <ClockCircleOutlined className="text-gray-500" />
          <span className="text-gray-700">{time}m</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'IsPublished',
      key: 'IsPublished',
      width: 110,
      align: 'center',
      render: (isPublished) => (
        <Tag color={isPublished ? 'success' : 'default'}>
          {isPublished ? 'Published' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'CreatedAt',
      key: 'CreatedAt',
      width: 110,
      render: (date) => (
        <span className="text-gray-500 text-xs">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          />
        </Dropdown>
      ),
    },
  ];

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
      Table: {
        headerBg: '#f9fafb',
        headerColor: '#6b7280',
        rowHoverBg: '#eff6ff',
        borderColor: '#e5e7eb',
      },
      Modal: {
        contentBg: '#ffffff',
        headerBg: '#ffffff',
        titleColor: '#1f2937',
      },
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
      Dropdown: {
        colorBgElevated: '#ffffff',
        colorText: '#1f2937',
      },
      Card: {
        colorBgContainer: 'rgba(255, 255, 255, 0.8)',
        colorBorder: 'rgba(59, 130, 246, 0.2)',
      },
    },
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <ConfigProvider theme={lightTheme}>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quiz Management</h1>
                <p className="text-gray-600 mt-1">Create, manage and monitor your quizzes</p>
              </div>
              <Space size="middle">
                <Button
                  type="default"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => router.push('/teacher/create-quiz')}
                  className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 hover:text-gray-900"
                >
                  Manual Quiz
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<RobotOutlined />}
                  onClick={() => router.push('/teacher/generate-quiz')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700"
                  style={{ background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))' }}
                >
                  AI Generate
                </Button>
              </Space>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all" bordered>
                <Statistic
                  title={<span className="text-gray-500">Total Quizzes</span>}
                  value={stats.total}
                  prefix={<FileTextOutlined className="text-blue-600 mr-2" />}
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                />
              </Card>
              <Card className="bg-white/80 backdrop-blur-xl border-green-200/50 hover:shadow-lg hover:shadow-green-500/10 transition-all" bordered>
                <Statistic
                  title={<span className="text-gray-500">Published</span>}
                  value={stats.published}
                  prefix={<CheckCircleOutlined className="text-green-500 mr-2" />}
                  valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
                />
              </Card>
              <Card className="bg-white/80 backdrop-blur-xl border-orange-200/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all" bordered>
                <Statistic
                  title={<span className="text-gray-500">Drafts</span>}
                  value={stats.drafts}
                  prefix={<ClockCircleOutlined className="text-orange-500 mr-2" />}
                  valueStyle={{ color: '#ea580c', fontWeight: 'bold' }}
                />
              </Card>
              <Card className="bg-white/80 backdrop-blur-xl border-purple-200/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all" bordered>
                <Statistic
                  title={<span className="text-gray-500">Total Questions</span>}
                  value={stats.totalQuestions}
                  prefix={<QuestionCircleOutlined className="text-purple-500 mr-2" />}
                  valueStyle={{ color: '#9333ea', fontWeight: 'bold' }}
                />
              </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50" bordered>
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search quizzes by title or subject..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                  size="large"
                  allowClear
                />
                <Select
                  value={filterDifficulty}
                  onChange={setFilterDifficulty}
                  className="w-full md:w-44"
                  size="large"
                >
                  <Option value="all">All Difficulties</Option>
                  <Option value="easy">Easy</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="hard">Hard</Option>
                </Select>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full md:w-40"
                  size="large"
                >
                  <Option value="all">All Status</Option>
                  <Option value="published">Published</Option>
                  <Option value="draft">Drafts</Option>
                </Select>
              </div>
            </Card>

            {/* Tabs for All Quizzes and Scheduled Quizzes */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              items={[
                {
                  key: 'all',
                  label: (
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      All Quizzes ({filteredQuizzes.length})
                    </span>
                  ),
                  children: (
                    <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 overflow-hidden" bordered bodyStyle={{ padding: 0 }}>
              <Table
                columns={columns}
                dataSource={filteredQuizzes}
                rowKey="QuizID"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => <span className="text-gray-500">Total {total} quizzes</span>,
                  className: "px-4 pb-4"
                }}
                scroll={{ x: 900 }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span className="text-gray-500">No quizzes found</span>}
                    >
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => router.push('/teacher/generate-quiz')}
                      >
                        Create Your First Quiz
                      </Button>
                    </Empty>
                  )
                }}
              />
            </Card>
                  ),
                },
                {
                  key: 'scheduled',
                  label: (
                    <span className="flex items-center gap-2">
                      <ClockCircleOutlined />
                      Scheduled ({scheduledQuizzes.length})
                    </span>
                  ),
                  children: (
                    <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50" bordered>
                      {scheduledQuizzes.length > 0 ? (
                        <div className="space-y-4">
                          {scheduledQuizzes.map((item) => (
                            <div
                              key={item.QuizGroupID}
                              className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                      <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-gray-900">
                                        {item.Quiz.Title}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        {item.Quiz.Subject} • {item.Quiz.Difficulty}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="ml-13 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                      <TeamOutlined className="text-blue-600" />
                                      <span className="font-medium">Group:</span>
                                      <span>{item.Group.Name}</span>
                                      <Tag color="blue">{item.Group.memberCount || 0} members</Tag>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                      <ClockCircleOutlined className="text-amber-600" />
                                      <span className="font-medium">Scheduled for:</span>
                                      <span className="text-amber-700 font-semibold">
                                        {new Date(item.ScheduledAt).toLocaleString()}
                                      </span>
                                      <Tag color="warning">{item.Status}</Tag>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    Modal.confirm({
                                      title: 'Cancel Scheduled Publishing?',
                                      content: `Are you sure you want to cancel the scheduled publishing of "${item.Quiz.Title}" to "${item.Group.Name}"?`,
                                      okText: 'Yes, Cancel',
                                      cancelText: 'No',
                                      okButtonProps: { danger: true },
                                      onOk: () => handleCancelScheduled(item.QuizID, item.GroupID),
                                    });
                                  }}
                                >
                                  Cancel Schedule
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <div className="py-8">
                              <p className="text-gray-600 mb-2">No scheduled quizzes</p>
                              <p className="text-gray-500 text-sm">
                                Schedule quizzes to be automatically published to groups at a specific time
                              </p>
                            </div>
                          }
                        />
                      )}
                    </Card>
                  ),
                },
              ]}
            />

            {/* Share Link Modal */}
            <Modal
              title={
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <LinkOutlined className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold m-0">Share Quiz</h3>
                    <p className="text-gray-500 text-sm m-0">{selectedQuiz?.Title}</p>
                  </div>
                </div>
              }
              open={linkModal}
              onCancel={() => setLinkModal(false)}
              footer={null}
              centered
              width={500}
            >
              <div className="space-y-4 pt-4">
                <p className="text-gray-600">Share this link with students to let them take the quiz:</p>
                <div className="flex gap-2">
                  <Input
                    value={selectedQuizLink}
                    readOnly
                    className="flex-1"
                    size="large"
                  />
                  <Button 
                    type="primary" 
                    icon={<CopyOutlined />} 
                    size="large"
                    onClick={copyLink}
                  >
                    Copy
                  </Button>
                </div>
                {selectedQuiz && !selectedQuiz.IsPublished && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-700 text-sm flex items-center gap-2">
                      <ClockCircleOutlined />
                      This quiz is not published yet. Students won't be able to access it.
                    </p>
                  </div>
                )}
              </div>
            </Modal>

            {/* Responses Modal */}
            <Modal
              title={
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <BarChartOutlined className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold m-0">Quiz Responses</h3>
                    <p className="text-gray-500 text-sm m-0">{selectedQuiz?.Title}</p>
                  </div>
                </div>
              }
              open={responsesModal}
              onCancel={() => setResponsesModal(false)}
              footer={null}
              centered
              width={700}
            >
              {loadingResponses ? (
                <div className="py-12 text-center">
                  <Spin size="large" />
                  <p className="text-gray-500 mt-4">Loading responses...</p>
                </div>
              ) : responses.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pt-4">
                  {responses.map((response) => (
                    <div 
                      key={response.ResponseID} 
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {response.User?.FirstName?.[0] || response.User?.Username?.[0] || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">
                            {response.User?.FirstName} {response.User?.LastName || response.User?.Username}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {new Date(response.CompletedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          response.Percentage >= 70 ? 'text-green-600' : 
                          response.Percentage >= 50 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {response.Percentage}%
                        </p>
                        <p className="text-gray-500 text-sm">
                          {response.Score}/{response.TotalScore} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  description={<span className="text-gray-500">No responses yet</span>}
                  className="py-8"
                />
              )}
            </Modal>

            {/* Publish to Groups Modal */}
            <Modal
              title={
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <TeamOutlined className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold m-0">Publish to Groups</h3>
                    <p className="text-gray-500 text-sm m-0">{selectedQuiz?.Title}</p>
                  </div>
                </div>
              }
              open={publishToGroupsModal}
              onCancel={() => {
                setPublishToGroupsModal(false);
                setSelectedGroups([]);
                setIsScheduled(false);
                setScheduledAt(null);
              }}
              onOk={handlePublishToGroups}
              okText={isScheduled ? `Schedule for ${selectedGroups.length} Group${selectedGroups.length !== 1 ? 's' : ''}` : `Publish to ${selectedGroups.length} Group${selectedGroups.length !== 1 ? 's' : ''}`}
              cancelText="Cancel"
              centered
              width={600}
            >
              {loadingGroups ? (
                <div className="py-12 text-center">
                  <Spin size="large" />
                  <p className="text-gray-500 mt-4">Loading groups...</p>
                </div>
              ) : groups.length > 0 ? (
                <div className="space-y-4 pt-4">
                  {/* Scheduling Option */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-blue-600" />
                        <span className="text-gray-900 font-medium">Schedule Publishing</span>
                      </div>
                      <Switch
                        checked={isScheduled}
                        onChange={setIsScheduled}
                        checkedChildren="Scheduled"
                        unCheckedChildren="Immediate"
                      />
                    </div>
                    {isScheduled && (
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">
                          Select Date & Time
                        </label>
                        <DatePicker
                          showTime
                          value={scheduledAt}
                          onChange={setScheduledAt}
                          disabledDate={(current) => {
                            // Allow today and future dates, disable past dates
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return current && current < today;
                          }}
                          disabledTime={(current) => {
                            if (!current) return {};
                            const now = new Date();
                            const selectedDate = new Date(current);

                            // If selected date is today, disable past hours/minutes
                            if (selectedDate.toDateString() === now.toDateString()) {
                              return {
                                disabledHours: () => {
                                  const hours = [];
                                  for (let i = 0; i < now.getHours(); i++) {
                                    hours.push(i);
                                  }
                                  return hours;
                                },
                                disabledMinutes: (selectedHour) => {
                                  if (selectedHour === now.getHours()) {
                                    const minutes = [];
                                    for (let i = 0; i < now.getMinutes(); i++) {
                                      minutes.push(i);
                                    }
                                    return minutes;
                                  }
                                  return [];
                                }
                              };
                            }
                            return {};
                          }}
                          format="YYYY-MM-DD hh:mm A"
                          className="w-full"
                          size="large"
                          placeholder="Select publishing date and time"
                        />
                        <p className="text-gray-500 text-xs mt-2">
                          Quiz will be automatically published to selected groups at this time
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Group Selection */}
                  <div>
                    <p className="text-gray-600 mb-4">
                      Select the groups you want to {isScheduled ? 'schedule' : 'publish'} this quiz to:
                    </p>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {groups.map((group) => (
                    <div
                      key={group.GroupID}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedGroups.includes(group.GroupID)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => {
                        if (selectedGroups.includes(group.GroupID)) {
                          setSelectedGroups(selectedGroups.filter((id) => id !== group.GroupID));
                        } else {
                          setSelectedGroups([...selectedGroups, group.GroupID]);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              selectedGroups.includes(group.GroupID)
                                ? 'bg-blue-500'
                                : 'bg-gray-200'
                            }`}
                          >
                            <Users
                              className={`w-5 h-5 ${
                                selectedGroups.includes(group.GroupID) ? 'text-white' : 'text-gray-600'
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-gray-900 font-semibold">{group.Name}</p>
                            <p className="text-gray-500 text-sm">
                              {group._count?.Members || 0} member{group._count?.Members !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedGroups.includes(group.GroupID)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGroups([...selectedGroups, group.GroupID]);
                            } else {
                              setSelectedGroups(selectedGroups.filter((id) => id !== group.GroupID));
                            }
                          }}
                        />
                      </div>
                      {group.Description && (
                        <p className="text-gray-600 text-sm mt-2 ml-13">{group.Description}</p>
                      )}
                    </div>
                  ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Empty
                  description={
                    <div className="py-8">
                      <p className="text-gray-600 mb-2">No groups created yet</p>
                      <Button
                        type="primary"
                        onClick={() => {
                          setPublishToGroupsModal(false);
                          router.push('/teacher/group-management');
                        }}
                      >
                        Create Your First Group
                      </Button>
                    </div>
                  }
                />
              )}
            </Modal>
          </div>
        </ConfigProvider>
      </DashboardLayout>
    </ProtectedRoute>
  );
}