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
  TeamOutlined,
  FilePdfOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { BookOpen, Brain, FileText, Sparkles, Users, Zap, TrendingUp } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { quizAPI, quizResponseAPI, groupAPI } from '../../../utils/api';

const { Option } = Select;

// Inject keyframe animations
const styleSheet = typeof document !== 'undefined' ? (() => {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    .qm-root * { font-family: 'DM Sans', sans-serif; }
    .qm-display { font-family: 'Plus Jakarta Sans', sans-serif; }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-6px); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: scale(0.8); }
      to   { opacity: 1; transform: scale(1); }
    }

    .fade-slide-up { animation: fadeSlideUp 0.5s ease both; }
    .fade-slide-up-d1 { animation: fadeSlideUp 0.5s 0.08s ease both; }
    .fade-slide-up-d2 { animation: fadeSlideUp 0.5s 0.16s ease both; }
    .fade-slide-up-d3 { animation: fadeSlideUp 0.5s 0.24s ease both; }
    .fade-slide-up-d4 { animation: fadeSlideUp 0.5s 0.32s ease both; }

    .stat-card {
      animation: fadeSlideUp 0.5s ease both;
      transition: transform 0.25s ease;
    }
    .stat-card:hover {
      transform: translateY(-4px);
    }

    .quiz-row {
      transition: background 0.15s ease;
    }
    .quiz-row:hover {
      background: #eff6ff !important;
    }

    .action-btn {
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .action-btn:hover {
      transform: translateY(-2px);
    }

    .hero-icon { animation: float 3.5s ease-in-out infinite; }

    .gradient-text {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .glass-card {
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(59,130,246,0.15);
    }

    .dot-bg {
      background-image: radial-gradient(circle, #bfdbfe 1px, transparent 1px);
      background-size: 24px 24px;
    }

    .badge-published {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    .badge-draft {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }
    .badge-easy   { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
    .badge-medium { background:#fef9c3; color:#854d0e; border:1px solid #fde68a; }
    .badge-hard   { background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; }

    .filter-section .ant-input-affix-wrapper,
    .filter-section .ant-select-selector {
      border-radius: 12px !important;
      border-color: #dbeafe !important;
      background: #f0f7ff !important;
      height: 44px !important;
    }
    .filter-section .ant-input {
      background: transparent !important;
    }

    .ant-table-thead > tr > th {
      background: #f8faff !important;
      color: #64748b !important;
      font-weight: 600 !important;
      font-size: 12px !important;
      letter-spacing: 0.05em !important;
      text-transform: uppercase !important;
      border-bottom: 1px solid #dbeafe !important;
    }
    .ant-table-row {
      transition: background 0.15s !important;
    }
    .ant-table-row:hover > td {
      background: #eff6ff !important;
    }
    .ant-table-cell {
      border-bottom: 1px solid #f1f5f9 !important;
    }

    .ant-tabs-tab {
      font-weight: 500 !important;
      color: #64748b !important;
      transition: color 0.2s !important;
    }
    .ant-tabs-tab-active .ant-tabs-tab-btn {
      color: #2563eb !important;
      font-weight: 600 !important;
    }
    .ant-tabs-ink-bar {
      background: linear-gradient(90deg,#2563eb,#4f46e5) !important;
      border-radius: 4px !important;
      height: 3px !important;
    }

    .group-card {
      transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
    }
    .group-card:hover {
      transform: translateY(-1px);
    }
    .group-card.selected {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .schedule-badge {
      animation: slideInRight 0.3s ease both;
    }
  `;
  document.head.appendChild(style);
  return style;
})() : null;

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
  const [previewModal, setPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState(null);

  useEffect(() => {
    fetchQuizzes();
    fetchScheduledQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getAllQuizzes();
      if (response.data.success) setQuizzes(response.data.data || []);
    } catch (error) {
      message.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledQuizzes = async () => {
    try {
      const response = await quizAPI.getScheduledQuizzes();
      if (response.data.success) setScheduledQuizzes(response.data.data || []);
    } catch {}
  };

  const handleDelete = (quizId) => {
    Modal.confirm({
      title: 'Delete Quiz',
      content: 'Are you sure you want to delete this quiz? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await quizAPI.deleteQuiz(quizId);
          message.success('Quiz deleted successfully');
          fetchQuizzes();
        } catch (error) {
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
      message.error(error.response?.data?.message || 'Failed to publish quiz');
    }
  };

  const handleUnpublish = async (quizId) => {
    try {
      await quizAPI.unpublishQuiz(quizId);
      message.success('Quiz unpublished successfully');
      fetchQuizzes();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to unpublish quiz');
    }
  };

  const handleGenerateLink = (quiz) => {
    const link = `${window.location.origin}/quiz/${quiz.QuizID}`;
    setSelectedQuizLink(link);
    setSelectedQuiz(quiz);
    setLinkModal(true);
  };

  const openPreviewQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    setPreviewModal(true);
    setPreviewLoading(true);
    setPreviewQuiz(null);
    try {
      const response = await quizAPI.getQuizById(quiz.QuizID);
      if (response.data.success) setPreviewQuiz(response.data.data);
      else message.error('Failed to load quiz preview');
    } catch {
      message.error('Failed to load quiz preview');
    } finally {
      setPreviewLoading(false);
    }
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
      if (response.data.success) setResponses(response.data.data?.responses || []);
    } catch {
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
      if (response.data.success) setGroups(response.data.data || []);
    } catch {
      message.error('Failed to load groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handlePublishToGroups = async () => {
    if (selectedGroups.length === 0) { message.error('Please select at least one group'); return; }
    if (isScheduled && !scheduledAt) { message.error('Please select a date and time for scheduling'); return; }
    if (isScheduled && scheduledAt && new Date(scheduledAt) <= new Date()) { message.error('Scheduled time must be in the future'); return; }
    try {
      const payload = { QuizID: selectedQuiz.QuizID, GroupIDs: selectedGroups };
      if (isScheduled) { payload.isScheduled = true; payload.scheduledAt = scheduledAt; }
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
      message.error(error.response?.data?.message || 'Failed to publish quiz to groups');
    }
  };

  const handleCancelScheduled = async (quizId, groupId) => {
    try {
      await quizAPI.cancelScheduledPublishing(quizId, groupId);
      message.success('Scheduled publishing cancelled successfully');
      fetchScheduledQuizzes();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to cancel scheduled publishing');
    }
  };

  const handleExportToPDF = async (quiz) => {
    try {
      message.loading({ content: 'Generating PDF...', key: 'export-pdf' });
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const sanitizeText = (text) => {
        if (!text) return '';
        return String(text).replace(/[\u0080-\uFFFF]/g, (char) => {
          const replacements = {'\u2013':'-','\u2014':'-','\u2018':"'",'\u2019':"'",'\u201C':'"','\u201D':'"','\u2022':'*'};
          return replacements[char] || '?';
        }).replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?');
      };
      const response = await quizAPI.getQuizById(quiz.QuizID);
      const quizData = response.data.data;
      const questions = quizData.Questions || quizData.questions || [];
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 20;
      doc.setFontSize(20); doc.setTextColor(37,99,235);
      doc.text(sanitizeText(quizData.Title || quiz.Title), pageWidth/2, y, {align:'center'}); y+=10;
      doc.setFontSize(10); doc.setTextColor(107,114,128);
      doc.text([`Subject: ${sanitizeText(quizData.Subject||'N/A')}`,`Questions: ${questions.length}`,`Created: ${new Date(quizData.CreatedAt).toLocaleDateString()}`].join('  |  '), pageWidth/2, y, {align:'center'}); y+=15;
      questions.forEach((q,i)=>{
        if(y>pageHeight-60){doc.addPage();y=20;}
        doc.setFontSize(12);doc.setTextColor(31,41,55);doc.setFont(undefined,'bold');
        doc.text(`Question ${i+1}:`,20,y);y+=7;
        doc.setFont(undefined,'normal');doc.setFontSize(10);
        const split=doc.splitTextToSize(sanitizeText(q.QuestionText||'No text'),pageWidth-40);
        doc.text(split,20,y);y+=(split.length*5)+5;
        (q.Options||[]).forEach((opt,oi)=>{
          if(y>pageHeight-20){doc.addPage();y=20;}
          const isCorrect=opt.IsCorrect||opt.isCorrect||false;
          doc.setFontSize(10);
          isCorrect?(doc.setTextColor(22,163,74),doc.setFont(undefined,'bold')):(doc.setTextColor(75,85,99),doc.setFont(undefined,'normal'));
          const line=`   ${String.fromCharCode(65+oi)}. ${sanitizeText(opt.OptionText||opt.text||opt)}`;
          const sp=doc.splitTextToSize(line,pageWidth-40);
          doc.text(sp,20,y);y+=(sp.length*5)+2;
          if(isCorrect){doc.setFontSize(8);doc.setTextColor(22,163,74);doc.text('      [Correct Answer]',20,y);y+=5;}
        });
        y+=5;
        if(i<questions.length-1){doc.setDrawColor(229,231,235);doc.line(20,y,pageWidth-20,y);y+=7;}
      });
      const totalPages=doc.internal.pages.length-1;
      for(let i=1;i<=totalPages;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(156,163,175);doc.text(`IntelliQuiz  |  Page ${i} of ${totalPages}`,pageWidth/2,pageHeight-10,{align:'center'});}
      doc.save(`${quizData.Title.replace(/[^a-z0-9]/gi,'_')}_${Date.now()}.pdf`);
      message.success({content:'Quiz exported successfully!',key:'export-pdf'});
    } catch (error) {
      message.error({content:'Failed to export quiz to PDF',key:'export-pdf'});
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.Title?.toLowerCase().includes(searchTerm.toLowerCase()) || quiz.Subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || quiz.Difficulty?.toLowerCase() === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'published' && quiz.IsPublished) || (filterStatus === 'draft' && !quiz.IsPublished);
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
      { key:'view', icon:<EyeOutlined/>, label:'Preview Quiz', onClick:()=>openPreviewQuiz(record) },
      { key:'edit', icon:<EditOutlined/>, label:'Edit Quiz', onClick:()=>router.push(`/teacher/quiz-management/edit/${record.QuizID}`) },
      { key:'responses', icon:<BarChartOutlined/>, label:'View Responses', onClick:()=>viewResponses(record) },
      { key:'link', icon:<LinkOutlined/>, label:'Share Link', onClick:()=>handleGenerateLink(record) },
      { key:'publish-groups', icon:<TeamOutlined/>, label:'Publish to Groups', onClick:()=>openPublishToGroupsModal(record) },
      { key:'export', icon:<FilePdfOutlined/>, label:'Export to PDF', onClick:()=>handleExportToPDF(record) },
    ];
    if (record.IsPublished) items.push({ key:'unpublish', icon:<ClockCircleOutlined/>, label:'Unpublish', onClick:()=>handleUnpublish(record.QuizID) });
    items.push({ type:'divider' }, { key:'delete', icon:<DeleteOutlined/>, label:'Delete Quiz', danger:true, onClick:()=>handleDelete(record.QuizID) });
    return items;
  };

  const DifficultyBadge = ({ difficulty }) => {
    const map = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };
    const cls = map[difficulty?.toLowerCase()] || 'badge-draft';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
        {difficulty || 'N/A'}
      </span>
    );
  };

  const columns = [
    {
      title: 'Quiz',
      dataIndex: 'Title',
      key: 'Title',
      render: (title, record) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200 flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-sm leading-tight">{title}</p>
            <p className="text-blue-400 text-xs mt-0.5">{record.Subject || 'General'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Questions',
      dataIndex: 'TotalQuestions',
      key: 'TotalQuestions',
      width: 110,
      align: 'center',
      render: (count) => (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
            <QuestionCircleOutlined className="text-xs" />
            {count} Qs
          </span>
        </div>
      ),
    },
    {
      title: 'Difficulty',
      dataIndex: 'Difficulty',
      key: 'Difficulty',
      width: 110,
      align: 'center',
      render: (d) => <DifficultyBadge difficulty={d} />,
    },
    {
      title: 'Time',
      dataIndex: 'TimeLimit',
      key: 'TimeLimit',
      width: 90,
      align: 'center',
      render: (time) => (
        <span className="inline-flex items-center gap-1 text-gray-500 text-xs font-medium">
          <ClockCircleOutlined />
          {time}m
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'IsPublished',
      key: 'IsPublished',
      width: 110,
      align: 'center',
      render: (isPublished) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPublished ? 'badge-published' : 'badge-draft'}`}>
          {isPublished ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          {isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'CreatedAt',
      key: 'CreatedAt',
      width: 110,
      render: (date) => (
        <span className="text-gray-400 text-xs">
          {new Date(date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']} placement="bottomRight">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150">
            <MoreOutlined />
          </button>
        </Dropdown>
      ),
    },
  ];

  const lightTheme = {
    token: {
      colorPrimary: '#2563eb',
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBorder: '#dbeafe',
      colorText: '#1e293b',
      colorTextSecondary: '#64748b',
      borderRadius: 14,
      fontFamily: '"DM Sans", sans-serif',
    },
    components: {
      Table: { headerBg:'#f8faff', headerColor:'#64748b', rowHoverBg:'#eff6ff', borderColor:'#f1f5f9' },
      Modal: { contentBg:'#ffffff', headerBg:'#ffffff', titleColor:'#1e293b' },
      Input: { colorBgContainer:'#f0f7ff', colorBorder:'#dbeafe', colorText:'#1e293b', colorTextPlaceholder:'#94a3b8', borderRadius: 12 },
      Select: { colorBgContainer:'#f0f7ff', colorBorder:'#dbeafe', colorText:'#1e293b', optionSelectedBg:'rgba(37,99,235,0.08)', colorBgElevated:'#ffffff', borderRadius: 12 },
      Dropdown: { colorBgElevated:'#ffffff', colorText:'#1e293b', borderRadius: 12 },
      Card: { colorBgContainer:'rgba(255,255,255,0.8)', colorBorder:'rgba(59,130,246,0.15)' },
      Button: { borderRadius: 10 },
    },
  };

  /* ─── Stat Card ─── */
  const StatCard = ({ icon, label, value, color, delay, bg, shadow }) => (
    <div className={`stat-card rounded-2xl p-5 border glass-card relative overflow-hidden cursor-default`}
         style={{ animationDelay: delay }}>
      {/* Decorative circle removed */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold qm-display" style={{color}} >{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:`${color}18`}}>
          <span style={{color}} className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <ConfigProvider theme={lightTheme}>
          <div className="qm-root min-h-screen" >
            {/* Dot pattern overlay */}
            <div className="fixed inset-0 dot-bg opacity-40 pointer-events-none" style={{zIndex:0}} />

            <div className="relative z-10 p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">

              {/* ── Header ── */}
              <div className="fade-slide-up flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="hero-icon w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold qm-display gradient-text tracking-tight">
                      Quiz Management
                    </h1>
                  </div>
                  <p className="text-gray-400 text-sm ml-14">Create, manage and monitor all your quizzes</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/teacher/create-quiz')}
                    className="action-btn flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-200 bg-white text-blue-600 font-semibold text-sm shadow-sm hover:bg-blue-50 hover:shadow-md transition-all"
                  >
                    <PlusOutlined /> Manual Quiz
                  </button>
                  <button
                    onClick={() => router.push('/teacher/generate-quiz')}
                    className="action-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg shadow-blue-300 transition-all"
                    style={{background:'linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)'}}
                  >
                    <Sparkles className="w-4 h-4" /> AI Generate
                  </button>
                </div>
              </div>

              {/* ── Stats ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<FileTextOutlined />} label="Total Quizzes"    value={stats.total}          color="#2563eb"   />
                <StatCard icon={<CheckCircleOutlined />} label="Published"     value={stats.published}      color="#16a34a" delay="0.16s" shadow="rgba(22,163,74,0.08)" />
                <StatCard icon={<ClockCircleOutlined />} label="Drafts"        value={stats.drafts}         color="#f59e0b" delay="0.24s" shadow="rgba(245,158,11,0.08)" />
                <StatCard icon={<QuestionCircleOutlined />} label="Questions"  value={stats.totalQuestions} color="#7c3aed" delay="0.32s" shadow="rgba(124,58,237,0.08)" />
              </div>

              {/* ── Filters ── */}
              <div className="fade-slide-up-d2 glass-card rounded-2xl p-5 filter-section">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Search quizzes by title or subject..."
                      prefix={<SearchOutlined className="text-blue-300" />}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      size="large"
                      allowClear
                      style={{borderRadius:12, borderColor:'#dbeafe', background:'#f0f7ff'}}
                    />
                  </div>
                  <Select value={filterDifficulty} onChange={setFilterDifficulty} className="w-full md:w-48" size="large" style={{borderRadius:12}}>
                    <Option value="all">All Difficulties</Option>
                    <Option value="easy">🟢 Easy</Option>
                    <Option value="medium">🟡 Medium</Option>
                    <Option value="hard">🔴 Hard</Option>
                  </Select>
                  <Select value={filterStatus} onChange={setFilterStatus} className="w-full md:w-44" size="large" style={{borderRadius:12}}>
                    <Option value="all">All Status</Option>
                    <Option value="published">✅ Published</Option>
                    <Option value="draft">🕐 Drafts</Option>
                  </Select>
                </div>
              </div>

              {/* ── Tabs ── */}
              <div className="fade-slide-up-d3">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  size="large"
                  items={[
                    {
                      key: 'all',
                      label: (
                        <span className="flex items-center gap-2 px-1">
                          <BookOpen className="w-4 h-4" />
                          All Quizzes
                          <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            {filteredQuizzes.length}
                          </span>
                        </span>
                      ),
                      children: (
                        <div className="glass-card rounded-2xl overflow-hidden">
                          <Table
                            columns={columns}
                            dataSource={filteredQuizzes}
                            rowKey="QuizID"
                            loading={loading}
                            pagination={{
                              pageSize: 10,
                              showSizeChanger: true,
                              showTotal: (total) => <span className="text-gray-400 text-xs">Total {total} quizzes</span>,
                              className: "px-5 pb-4 pt-2",
                            }}
                            scroll={{ x: 900 }}
                            rowClassName="quiz-row"
                            locale={{
                              emptyText: (
                                <div className="py-16 text-center">
                                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-blue-300" />
                                  </div>
                                  <p className="text-gray-400 mb-1 font-medium">No quizzes found</p>
                                  <p className="text-gray-300 text-sm mb-4">Create your first quiz to get started</p>
                                  <button
                                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md shadow-blue-200 transition-all hover:opacity-90"
                                    style={{background:'linear-gradient(135deg,#2563eb,#4f46e5)'}}
                                    onClick={() => router.push('/teacher/generate-quiz')}
                                  >
                                    <Sparkles className="w-4 h-4 inline mr-1.5" /> Create First Quiz
                                  </button>
                                </div>
                              )
                            }}
                          />
                        </div>
                      ),
                    },
                    {
                      key: 'scheduled',
                      label: (
                        <span className="flex items-center gap-2 px-1">
                          <ClockCircleOutlined />
                          Scheduled
                          <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                            {scheduledQuizzes.length}
                          </span>
                        </span>
                      ),
                      children: (
                        <div className="space-y-4">
                          {scheduledQuizzes.length > 0 ? scheduledQuizzes.map((item) => (
                            <div key={item.QuizGroupID}
                              className="schedule-badge glass-card rounded-2xl p-5 border border-amber-100"
                              style={{background:'linear-gradient(135deg,#fffbeb,#fff7ed)'}}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-100 flex-shrink-0">
                                    <BookOpen className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-900 qm-display">{item.Quiz.Title}</h3>
                                    <p className="text-sm text-gray-400">{item.Quiz.Subject} · {item.Quiz.Difficulty}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <TeamOutlined className="text-blue-400" />
                                        {item.Group.Name}
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full font-semibold text-xs">{item.Group.memberCount||0} members</span>
                                      </span>
                                      <span className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                                        <ClockCircleOutlined />
                                        {new Date(item.ScheduledAt).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => Modal.confirm({
                                    title: 'Cancel Scheduled Publishing?',
                                    content: `Cancel "${item.Quiz.Title}" scheduled to "${item.Group.Name}"?`,
                                    okText:'Yes, Cancel', cancelText:'No', okButtonProps:{danger:true},
                                    onOk:()=>handleCancelScheduled(item.QuizID,item.GroupID)
                                  })}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 text-sm font-medium border border-red-100 bg-red-50 hover:bg-red-100 transition-all"
                                >
                                  <DeleteOutlined /> Cancel
                                </button>
                              </div>
                            </div>
                          )) : (
                            <div className="glass-card rounded-2xl py-16 text-center">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
                                <ClockCircleOutlined className="text-3xl text-amber-300" />
                              </div>
                              <p className="text-gray-400 font-medium">No scheduled quizzes</p>
                              <p className="text-gray-300 text-sm mt-1">Schedule quizzes to publish automatically to groups</p>
                            </div>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* ── Preview Modal ── */}
          <Modal
            title={
              <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-100">
                  <EyeOutlined className="text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold m-0 qm-display">Quiz Preview</h3>
                  <p className="text-gray-400 text-xs m-0">{selectedQuiz?.Title}</p>
                </div>
              </div>
            }
            open={previewModal}
            onCancel={() => { setPreviewModal(false); setPreviewQuiz(null); }}
            footer={null}
            centered
            width={860}
            styles={{body:{padding:'0 24px 24px'}}}
          >
            {previewLoading ? (
              <div className="py-16 text-center">
                <Spin size="large" />
                <p className="text-gray-400 mt-4 text-sm">Loading quiz preview...</p>
              </div>
            ) : previewQuiz ? (
              <div className="space-y-5 max-h-[68vh] overflow-y-auto pr-1 pt-2">
                <div className="p-5 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50">
                  <h4 className="text-lg font-bold text-gray-900 qm-display">{previewQuiz.Title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{previewQuiz.Description || previewQuiz.Subject || 'No description'}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      {label:previewQuiz.Subject||'General', color:'bg-blue-100 text-blue-700'},
                      {label:previewQuiz.Difficulty||'N/A', color:'bg-purple-100 text-purple-700'},
                      {label:`${previewQuiz.TimeLimit||0} min`, color:'bg-cyan-100 text-cyan-700'},
                      {label:`${previewQuiz.Questions?.length||0} questions`, color:'bg-amber-100 text-amber-700'},
                    ].map(t=>(
                      <span key={t.label} className={`px-3 py-1 rounded-full text-xs font-semibold ${t.color}`}>{t.label}</span>
                    ))}
                  </div>
                </div>
                {(previewQuiz.Questions||[]).map((q,i) => (
                  <div key={q.QuestionID||`q-${i}`} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <p className="font-semibold text-gray-900 leading-snug">
                        <span className="text-blue-400 mr-2 font-bold">Q{i+1}.</span>
                        {q.QuestionText||q.Question||'Untitled question'}
                      </p>
                      <span className="flex-shrink-0 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">{q.Points||1} pt</span>
                    </div>
                    <div className="space-y-2">
                      {(q.Options||[]).map((opt,oi) => {
                        const isCorrect = opt.IsCorrect||opt.isCorrect;
                        return (
                          <div key={opt.OptionID||`o-${oi}`}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                              isCorrect ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-100 bg-gray-50 text-gray-600'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCorrect?'bg-green-200 text-green-800':'bg-gray-200 text-gray-500'}`}>
                              {String.fromCharCode(65+oi)}
                            </span>
                            <span>{opt.OptionText||opt.text||String(opt)}</span>
                            {isCorrect && <CheckCircleOutlined className="ml-auto text-green-500" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description={<span className="text-gray-400">Unable to preview this quiz</span>} />
            )}
          </Modal>

          {/* ── Share Link Modal ── */}
          <Modal
            title={
              <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-100">
                  <LinkOutlined className="text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold m-0 qm-display">Share Quiz</h3>
                  <p className="text-gray-400 text-xs m-0">{selectedQuiz?.Title}</p>
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
              <p className="text-gray-500 text-sm">Share this link with students to let them take the quiz:</p>
              <div className="flex gap-2">
                <Input value={selectedQuizLink} readOnly size="large" style={{borderRadius:12,borderColor:'#dbeafe',background:'#f0f7ff'}} />
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow-md shadow-blue-200 hover:opacity-90 transition-all"
                  style={{background:'linear-gradient(135deg,#2563eb,#4f46e5)'}}
                >
                  <CopyOutlined /> Copy
                </button>
              </div>
              {selectedQuiz && !selectedQuiz.IsPublished && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <ClockCircleOutlined className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-700 text-sm">This quiz is not published yet. Students won't be able to access it until you publish it.</p>
                </div>
              )}
            </div>
          </Modal>

          {/* ── Responses Modal ── */}
          <Modal
            title={
              <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md shadow-green-100">
                  <BarChartOutlined className="text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold m-0 qm-display">Quiz Responses</h3>
                  <p className="text-gray-400 text-xs m-0">{selectedQuiz?.Title}</p>
                </div>
              </div>
            }
            open={responsesModal}
            onCancel={() => setResponsesModal(false)}
            footer={null}
            centered
            width={680}
          >
            {loadingResponses ? (
              <div className="py-12 text-center"><Spin size="large" /><p className="text-gray-400 mt-3 text-sm">Loading responses...</p></div>
            ) : responses.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pt-4 pr-1">
                {responses.map((resp) => {
                  const pct = resp.Percentage;
                  const color = pct>=70?'#16a34a':pct>=50?'#d97706':'#dc2626';
                  return (
                    <div key={resp.ResponseID} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                          <span className="text-white text-sm font-bold">
                            {resp.User?.FirstName?.[0]||resp.User?.Username?.[0]||'S'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{resp.User?.FirstName} {resp.User?.LastName||resp.User?.Username}</p>
                          <p className="text-gray-400 text-xs">{new Date(resp.CompletedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{color}}>{pct}%</p>
                        <p className="text-gray-400 text-xs">{resp.Score}/{resp.TotalScore} pts</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center">
                  <BarChartOutlined className="text-2xl text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">No responses yet</p>
              </div>
            )}
          </Modal>

          {/* ── Publish to Groups Modal ── */}
          <Modal
            title={
              <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-100">
                  <TeamOutlined className="text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold m-0 qm-display">Publish to Groups</h3>
                  <p className="text-gray-400 text-xs m-0">{selectedQuiz?.Title}</p>
                </div>
              </div>
            }
            open={publishToGroupsModal}
            onCancel={() => { setPublishToGroupsModal(false); setSelectedGroups([]); setIsScheduled(false); setScheduledAt(null); }}
            onOk={handlePublishToGroups}
            okText={isScheduled ? `Schedule for ${selectedGroups.length} Group${selectedGroups.length!==1?'s':''}` : `Publish to ${selectedGroups.length} Group${selectedGroups.length!==1?'s':''}`}
            cancelText="Cancel"
            centered
            width={580}
            okButtonProps={{style:{background:'linear-gradient(135deg,#2563eb,#4f46e5)',border:'none',borderRadius:10}}}
          >
            {loadingGroups ? (
              <div className="py-12 text-center"><Spin size="large" /></div>
            ) : groups.length > 0 ? (
              <div className="space-y-4 pt-4">
                {/* Schedule toggle */}
                <div className="p-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/40">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-blue-500" />
                      <span className="font-semibold text-gray-800 text-sm">Schedule Publishing</span>
                    </div>
                    <Switch checked={isScheduled} onChange={setIsScheduled} checkedChildren="On" unCheckedChildren="Off" />
                  </div>
                  {isScheduled && (
                    <div>
                      <label className="block text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide">Select Date & Time</label>
                      <DatePicker
                        showTime
                        value={scheduledAt}
                        onChange={setScheduledAt}
                        disabledDate={(c) => { const t=new Date();t.setHours(0,0,0,0);return c&&c<t; }}
                        format="YYYY-MM-DD hh:mm A"
                        className="w-full"
                        size="large"
                        placeholder="Select publishing date and time"
                        style={{borderRadius:12,borderColor:'#dbeafe'}}
                      />
                      <p className="text-gray-400 text-xs mt-2">Quiz will auto-publish to selected groups at this time</p>
                    </div>
                  )}
                </div>

                {/* Group list */}
                <div>
                  <p className="text-gray-400 text-sm mb-3">Select the groups to {isScheduled?'schedule':'publish'} this quiz:</p>
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {groups.map((group) => {
                      const selected = selectedGroups.includes(group.GroupID);
                      return (
                        <div
                          key={group.GroupID}
                          className={`group-card p-4 rounded-xl border-2 cursor-pointer ${selected ? 'selected' : 'border-gray-100 bg-white'}`}
                          onClick={() => setSelectedGroups(selected ? selectedGroups.filter(id=>id!==group.GroupID) : [...selectedGroups,group.GroupID])}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selected?'bg-blue-500 shadow-md shadow-blue-100':'bg-gray-100'}`}>
                                <Users className={`w-5 h-5 ${selected?'text-white':'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{group.Name}</p>
                                <p className="text-gray-400 text-xs">{group._count?.Members||0} member{group._count?.Members!==1?'s':''}</p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected?'border-blue-500 bg-blue-500':'border-gray-300'}`}>
                              {selected && <CheckCircleOutlined className="text-white text-xs" />}
                            </div>
                          </div>
                          {group.Description && <p className="text-gray-400 text-xs mt-2 ml-13 pl-0.5">{group.Description}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <Users className="w-7 h-7 text-purple-300" />
                </div>
                <p className="text-gray-400 font-medium mb-3">No groups yet</p>
                <button
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition-all hover:opacity-90"
                  style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)'}}
                  onClick={() => { setPublishToGroupsModal(false); router.push('/teacher/group-management'); }}
                >
                  Create Your First Group
                </button>
              </div>
            )}
          </Modal>

        </ConfigProvider>
      </DashboardLayout>
    </ProtectedRoute>
  );
}