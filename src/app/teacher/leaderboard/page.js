'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import QuizLeaderboard from '../../components/leaderboard/QuizLeaderboard';
import GroupLeaderboard from '../../components/leaderboard/GroupLeaderboard';
import RecentSubmissions from '../../components/leaderboard/RecentSubmissions';
import { leaderboardAPI, quizAPI, groupAPI } from '../../../utils/api';
import { initializeSocket, subscribeToSubmissionNotifications, subscribeToLeaderboardUpdates, disconnectSocket, joinQuizRoom } from '../../../utils/socket';
import {
  Trophy,
  Users,
  Activity,
  RefreshCw,
  Filter,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function TeacherLeaderboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [quizLeaderboards, setQuizLeaderboards] = useState([]);
  const [groupLeaderboards, setGroupLeaderboards] = useState([]);
  
  // Filter states
  const [quizzes, setQuizzes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  
  // Socket connection state
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    fetchInitialData();
    setupRealtimeUpdates();

    return () => {
      disconnectSocket();
    };
  }, []);

  const setupRealtimeUpdates = () => {
    try {
      const socket = initializeSocket();
      
      socket.on('connect', () => {
        console.log('Leaderboard: Socket connected');
        setSocketConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Leaderboard: Socket disconnected');
        setSocketConnected(false);
      });

      // Subscribe to submission notifications (for all quizzes)
      const unsubscribeNotifications = subscribeToSubmissionNotifications((data) => {
        console.log('New submission notification:', data);
        handleNewSubmission(data);
      });

      // Subscribe to leaderboard updates (for specific quiz room)
      const unsubscribeLeaderboard = subscribeToLeaderboardUpdates((data) => {
        console.log('Leaderboard update:', data);
        handleLeaderboardUpdate(data);
      });

      return () => {
        unsubscribeNotifications();
        unsubscribeLeaderboard();
      };
    } catch (error) {
      console.error('Error setting up real-time updates:', error);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch quizzes and groups for filters
      const [quizzesRes, groupsRes] = await Promise.all([
        quizAPI.getAllQuizzes().catch(() => ({ data: { success: false, data: [] } })),
        groupAPI.getGroups().catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (quizzesRes.data.success) {
        const publishedQuizzes = quizzesRes.data.data.filter(q => q.IsPublished);
        setQuizzes(publishedQuizzes);
      }

      if (groupsRes.data.success) {
        setGroups(groupsRes.data.data);
      }

      // Fetch recent submissions
      await fetchRecentSubmissions();

    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentSubmissions = async (limit = 20) => {
    try {
      console.log(`[API Call] GET /api/leaderboard/recent?limit=${limit}`);
      const response = await leaderboardAPI.getRecentSubmissions(limit);
      console.log('[API Response] Recent submissions:', response.data);
      
      if (response.data.success) {
        // Recent submissions returns array directly under data
        const submissions = Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
        console.log('Parsed submissions:', submissions);
        setRecentSubmissions(submissions);
      } else {
        console.error('Recent submissions API returned success=false');
        setRecentSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching recent submissions:', error.response?.data || error.message);
      // Don't show alert for recent submissions, just log it
      setRecentSubmissions([]);
    }
  };

  const fetchQuizLeaderboard = async (quizId) => {
    if (!quizId) {
      console.error('fetchQuizLeaderboard called without quizId');
      return;
    }

    try {
      setRefreshing(true);
      console.log(`[API Call] GET /api/leaderboard/quiz/${quizId}`);
      
      const response = await leaderboardAPI.getQuizLeaderboard(quizId);
      console.log(`[API Response] Quiz ${quizId} leaderboard:`, response.data);
      
      if (response.data.success) {
        // Quiz leaderboard is nested: data.data.leaderboard
        const leaderboardData = response.data.data?.leaderboard || [];
        const quizInfo = response.data.data?.quiz || null;
        
        console.log('Parsed leaderboard data:', leaderboardData);
        console.log('Quiz info:', quizInfo);
        
        setQuizLeaderboards(leaderboardData);
        setSelectedQuiz(quizId);
        setActiveTab('quiz');
        
        // Join the quiz room for real-time updates
        joinQuizRoom(quizId);
      } else {
        console.error('Quiz leaderboard API returned success=false');
        alert('Failed to load quiz leaderboard: ' + (response.data.message || 'Unknown error'));
        setQuizLeaderboards([]);
      }
    } catch (error) {
      console.error(`Error fetching quiz ${quizId} leaderboard:`, error.response?.data || error.message);
      alert('Failed to load quiz leaderboard: ' + (error.response?.data?.message || error.message));
      setQuizLeaderboards([]);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchGroupLeaderboard = async (groupId) => {
    if (!groupId) {
      console.error('fetchGroupLeaderboard called without groupId');
      return;
    }

    try {
      setRefreshing(true);
      console.log(`[API Call] GET /api/leaderboard/group/${groupId}`);
      
      const response = await leaderboardAPI.getGroupLeaderboard(groupId);
      console.log(`[API Response] Group ${groupId} leaderboard:`, response.data);
      
      if (response.data.success) {
        // Group leaderboard is nested: data.data.leaderboard
        const leaderboardData = response.data.data?.leaderboard || [];
        const groupInfo = response.data.data?.group || null;
        
        console.log('Parsed leaderboard data:', leaderboardData);
        console.log('Group info:', groupInfo);
        
        setGroupLeaderboards(leaderboardData);
        setSelectedGroup(groupId);
        setActiveTab('group');
      } else {
        console.error('Group leaderboard API returned success=false');
        alert('Failed to load group leaderboard: ' + (response.data.message || 'Unknown error'));
        setGroupLeaderboards([]);
      }
    } catch (error) {
      console.error(`Error fetching group ${groupId} leaderboard:`, error.response?.data || error.message);
      alert('Failed to load group leaderboard: ' + (error.response?.data?.message || error.message));
      setGroupLeaderboards([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewSubmission = (data) => {
    // Create submission object for recent list
    const newSubmission = {
      submissionId: Date.now().toString(),
      quizId: data.quizId,
      quizTitle: data.quizTitle || 'Quiz',
      userId: data.userId,
      username: data.username || 'Student',
      fullName: data.fullName || data.username || 'Student',
      score: data.score,
      totalScore: data.totalScore,
      percentage: data.percentage,
      timeSpent: data.timeSpent || 0,
      completedAt: data.submittedAt || new Date().toISOString(),
    };

    // Add to recent submissions list
    setRecentSubmissions((prev) => {
      return [newSubmission, ...prev].slice(0, 20);
    });

    // Refresh current view if viewing this quiz
    if (activeTab === 'quiz' && selectedQuiz === data.quizId) {
      fetchQuizLeaderboard(data.quizId);
    }
  };

  const handleLeaderboardUpdate = (data) => {
    console.log('Handling leaderboard update:', data);
    
    if (data.type === 'newSubmission') {
      // Handle leaderboard update for current view
      if (activeTab === 'quiz' && selectedQuiz) {
        // Refresh quiz leaderboard
        fetchQuizLeaderboard(selectedQuiz);
      } else if (activeTab === 'group' && selectedGroup) {
        // Refresh group leaderboard  
        fetchGroupLeaderboard(selectedGroup);
      }
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'recent') {
      fetchRecentSubmissions();
    } else if (activeTab === 'quiz' && selectedQuiz) {
      fetchQuizLeaderboard(selectedQuiz);
    } else if (activeTab === 'group' && selectedGroup) {
      fetchGroupLeaderboard(selectedGroup);
    }
  };

  const tabs = [
    { id: 'recent', label: 'Recent Activity', icon: Activity },
    { id: 'quiz', label: 'Quiz Leaderboard', icon: Trophy },
    { id: 'group', label: 'Group Leaderboard', icon: Users },
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <DashboardLayout role="teacher">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Leaderboards</h1>
                  <p className="text-gray-500 text-sm mt-1">Track student performance and rankings</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Socket Status */}
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  socketConnected 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    socketConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {socketConnected ? 'Live' : 'Offline'}
                  </span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 font-medium transition-all ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters (Quiz and Group tabs) */}
          {(activeTab === 'quiz' || activeTab === 'group') && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 font-medium">Select {activeTab === 'quiz' ? 'Quiz' : 'Group'}:</span>
                
                {activeTab === 'quiz' ? (
                  <select
                    value={selectedQuiz}
                    onChange={(e) => fetchQuizLeaderboard(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a quiz...</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz.QuizID} value={quiz.QuizID}>
                        {quiz.Title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedGroup}
                    onChange={(e) => fetchGroupLeaderboard(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a group...</option>
                    {groups.map((group) => (
                      <option key={group.GroupID} value={group.GroupID}>
                        {group.GroupName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            {activeTab === 'recent' && (
              <RecentSubmissions data={recentSubmissions} />
            )}

            {activeTab === 'quiz' && (
              selectedQuiz ? (
                <QuizLeaderboard
                  data={quizLeaderboards}
                  quizTitle={quizzes.find(q => q.QuizID === selectedQuiz)?.Title}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Quiz</h3>
                  <p className="text-gray-500">Choose a quiz from the dropdown above to view its leaderboard</p>
                </div>
              )
            )}

            {activeTab === 'group' && (
              selectedGroup ? (
                <GroupLeaderboard
                  data={groupLeaderboards}
                  groupName={groups.find(g => g.GroupID === selectedGroup)?.GroupName}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Group</h3>
                  <p className="text-gray-500">Choose a group from the dropdown above to view its leaderboard</p>
                </div>
              )
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
