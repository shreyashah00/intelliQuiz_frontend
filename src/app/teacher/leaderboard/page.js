'use client';
import { useEffect, useRef, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import QuizLeaderboard from '../../components/leaderboard/QuizLeaderboard';
import GroupLeaderboard from '../../components/leaderboard/GroupLeaderboard';
import { leaderboardAPI, quizAPI, groupAPI } from '../../../utils/api';
import {
  initializeSocket,
  subscribeLiveActivities,
  unsubscribeLiveActivities,
  subscribeToSocketEvent,
  disconnectSocket,
  authenticateSocket,
} from '../../../utils/socket';
import {
  Trophy,
  Users,
  RefreshCw,
  Filter,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function TeacherLeaderboard() {
  const [activeTab, setActiveTab] = useState('quiz');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [quizLeaderboards, setQuizLeaderboards] = useState([]);
  const [groupLeaderboards, setGroupLeaderboards] = useState([]);
  
  // Filter states
  const [quizzes, setQuizzes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  
  // Socket connection state
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketAuthenticated, setSocketAuthenticated] = useState(false);

  const quizCursorRef = useRef(null);
  const groupCursorRef = useRef(null);
  const activeSubscriptionRef = useRef(null);
  const socketUnsubscribersRef = useRef([]);
  const selectedQuizRef = useRef('');
  const selectedGroupRef = useRef('');

  useEffect(() => {
    selectedQuizRef.current = selectedQuiz;
  }, [selectedQuiz]);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    fetchInitialData();
    const cleanup = setupRealtimeUpdates();

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (!socketConnected || !socketAuthenticated) {
      return;
    }

    if (activeSubscriptionRef.current) {
      unsubscribeLiveActivities(activeSubscriptionRef.current);
      activeSubscriptionRef.current = null;
    }

    if (activeTab === 'quiz' && selectedQuiz) {
      const payload = {
        connectionType: 'quiz_leaderboard',
        quizId: Number(selectedQuiz),
        intervalSeconds: 10,
        cursorAt: quizCursorRef.current || undefined,
      };
      subscribeLiveActivities(payload);
      activeSubscriptionRef.current = {
        connectionType: 'quiz_leaderboard',
        quizId: Number(selectedQuiz),
      };
    }

    if (activeTab === 'group' && selectedGroup) {
      const payload = {
        connectionType: 'group_leaderboard',
        groupId: Number(selectedGroup),
        intervalSeconds: 15,
        cursorAt: groupCursorRef.current || undefined,
      };
      subscribeLiveActivities(payload);
      activeSubscriptionRef.current = {
        connectionType: 'group_leaderboard',
        groupId: Number(selectedGroup),
      };
    }

    return () => {
      if (activeSubscriptionRef.current) {
        unsubscribeLiveActivities(activeSubscriptionRef.current);
        activeSubscriptionRef.current = null;
      }
    };
  }, [activeTab, selectedQuiz, selectedGroup, socketConnected, socketAuthenticated]);

  const setupRealtimeUpdates = () => {
    try {
      const socket = initializeSocket();
      
      socket.on('connect', () => {
        console.log('Leaderboard: Socket connected');
        setSocketConnected(true);
        setSocketAuthenticated(false);
        authenticateSocket();
      });

      socket.on('disconnect', () => {
        console.log('Leaderboard: Socket disconnected');
        setSocketConnected(false);
        setSocketAuthenticated(false);
      });

      const unsubscribeSocketAuthenticated = subscribeToSocketEvent('socketAuthenticated', (payload) => {
        console.log('Socket authenticated:', payload);
        setSocketAuthenticated(Boolean(payload?.success));
      });

      const unsubscribeSocketAuthError = subscribeToSocketEvent('socketAuthenticationError', (payload) => {
        console.error('Socket authentication failed:', payload);
        setSocketAuthenticated(false);
      });

      const unsubscribeLiveSubscribed = subscribeToSocketEvent('liveActivitySubscribed', (payload) => {
        console.log('Live activity subscribed:', payload);
        if (payload?.data?.connectionType === 'quiz_leaderboard' && payload?.data?.cursorAt) {
          quizCursorRef.current = payload.data.cursorAt;
        }
        if (payload?.data?.connectionType === 'group_leaderboard' && payload?.data?.cursorAt) {
          groupCursorRef.current = payload.data.cursorAt;
        }
      });

      const unsubscribeQuizActivity = subscribeToSocketEvent('quizLeaderboardActivity', (payload) => {
        if (!payload?.success || payload?.connectionType !== 'quiz_leaderboard') {
          return;
        }

        if (payload?.cursorAt) {
          quizCursorRef.current = payload.cursorAt;
        }

        const currentQuizId = Number(selectedQuizRef.current);
        const activityQuizId = Number(payload?.data?.submissions?.[0]?.quizId || payload?.quizId || 0);
        const liveSubmissions = Array.isArray(payload?.data?.submissions) ? payload.data.submissions : [];

        if (currentQuizId && activityQuizId && currentQuizId === activityQuizId && liveSubmissions.length > 0) {
          // Apply incoming websocket data immediately for real-time UX.
          setQuizLeaderboards((prev) => {
            const prevList = Array.isArray(prev) ? prev : [];
            const existingByUser = new Map(prevList.map((item) => [Number(item?.userId || item?.UserID || 0), item]));

            for (const submission of liveSubmissions) {
              const submissionUserId = Number(submission?.userId || 0);
              if (!submissionUserId) {
                continue;
              }

              existingByUser.set(submissionUserId, {
                ...existingByUser.get(submissionUserId),
                ...submission,
                // Normalize fields used by the leaderboard renderer.
                timeSpent: submission.timeSpentSeconds ?? submission.timeSpent,
                timeSpentSeconds: submission.timeSpentSeconds ?? submission.timeSpent,
                timeSpentFormatted: submission.timeSpentFormatted,
              });
            }

            return Array.from(existingByUser.values());
          });

          return;
        }

        if (currentQuizId && payload?.hasUpdates) {
          fetchQuizLeaderboard(currentQuizId, { skipSubscribe: true });
        }
      });

      const unsubscribeQuizNoResponse = subscribeToSocketEvent('quizLeaderboardNoResponse', (payload) => {
        if (payload?.cursorAt) {
          quizCursorRef.current = payload.cursorAt;
        }
      });

      const unsubscribeGroupActivity = subscribeToSocketEvent('groupLeaderboardActivity', (payload) => {
        if (!payload?.success || payload?.connectionType !== 'group_leaderboard') {
          return;
        }

        if (payload?.cursorAt) {
          groupCursorRef.current = payload.cursorAt;
        }

        if (Number(selectedGroupRef.current) && payload?.hasUpdates) {
          fetchGroupLeaderboard(Number(selectedGroupRef.current), { skipSubscribe: true });
        }
      });

      socketUnsubscribersRef.current = [
        unsubscribeSocketAuthenticated,
        unsubscribeSocketAuthError,
        unsubscribeLiveSubscribed,
        unsubscribeQuizActivity,
        unsubscribeQuizNoResponse,
        unsubscribeGroupActivity,
      ];

      // Handle race conditions: if socket connected before listeners were attached,
      // reflect current state and re-send authentication.
      if (socket.connected) {
        setSocketConnected(true);
        authenticateSocket();
      }

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socketUnsubscribersRef.current.forEach((unsubscribe) => unsubscribe());
        socketUnsubscribersRef.current = [];
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

    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizLeaderboard = async (quizId, options = {}) => {
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
        setSelectedQuiz(Number(quizId));
        setActiveTab('quiz');

        if (!options.skipSubscribe && socketConnected && socketAuthenticated) {
          if (activeSubscriptionRef.current) {
            unsubscribeLiveActivities(activeSubscriptionRef.current);
          }

          subscribeLiveActivities({
            connectionType: 'quiz_leaderboard',
            quizId: Number(quizId),
            intervalSeconds: 10,
            cursorAt: quizCursorRef.current || undefined,
          });

          activeSubscriptionRef.current = {
            connectionType: 'quiz_leaderboard',
            quizId: Number(quizId),
          };
        }
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

  const fetchGroupLeaderboard = async (groupId, options = {}) => {
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
        setSelectedGroup(Number(groupId));
        setActiveTab('group');

        if (!options.skipSubscribe && socketConnected && socketAuthenticated) {
          if (activeSubscriptionRef.current) {
            unsubscribeLiveActivities(activeSubscriptionRef.current);
          }

          subscribeLiveActivities({
            connectionType: 'group_leaderboard',
            groupId: Number(groupId),
            intervalSeconds: 15,
            cursorAt: groupCursorRef.current || undefined,
          });

          activeSubscriptionRef.current = {
            connectionType: 'group_leaderboard',
            groupId: Number(groupId),
          };
        }
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

  const handleRefresh = () => {
    if (activeTab === 'quiz' && selectedQuiz) {
      fetchQuizLeaderboard(selectedQuiz);
    } else if (activeTab === 'group' && selectedGroup) {
      fetchGroupLeaderboard(selectedGroup);
    }
  };

  const tabs = [
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
                  socketConnected && socketAuthenticated
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    socketConnected && socketAuthenticated ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {socketConnected && socketAuthenticated ? 'Live' : 'Offline'}
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
                    onChange={(e) => fetchQuizLeaderboard(Number(e.target.value))}
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
                    onChange={(e) => fetchGroupLeaderboard(Number(e.target.value))}
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
            {activeTab === 'quiz' && (
              selectedQuiz ? (
                <QuizLeaderboard
                  data={quizLeaderboards}
                  quizTitle={quizzes.find(q => Number(q.QuizID) === Number(selectedQuiz))?.Title}
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
                  groupName={groups.find(g => Number(g.GroupID) === Number(selectedGroup))?.GroupName || groups.find(g => Number(g.GroupID) === Number(selectedGroup))?.Name}
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
