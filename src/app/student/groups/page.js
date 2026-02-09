'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  message,
  Tag,
  Spin,
  ConfigProvider,
  theme,
  Empty,
  Tabs
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  UsersOutlined,
  ClockCircleOutlined,
  MailOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Users, UserCheck, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { userGroupsAPI } from '../../../utils/api';

export default function StudentGroupsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [acceptedGroups, setAcceptedGroups] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [processingInvitation, setProcessingInvitation] = useState(null);

  const lightTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#4F46E5',
      colorBgContainer: '#ffffff',
      colorBorder: '#e5e7eb',
      borderRadius: 12,
    },
  };

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      const response = await userGroupsAPI.getUserGroups();
      if (response.data.success) {
        setAcceptedGroups(response.data.data.acceptedGroups || []);
        setPendingInvitations(response.data.data.pendingInvitations || []);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      message.error(err.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (groupId) => {
    try {
      setProcessingInvitation(groupId);
      const response = await userGroupsAPI.acceptInvitation(groupId);
      if (response.data.success) {
        message.success(response.data.message || 'Successfully joined the group');
        fetchUserGroups();
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      message.error(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleRejectInvitation = async (groupId) => {
    try {
      setProcessingInvitation(groupId);
      const response = await userGroupsAPI.rejectInvitation(groupId);
      if (response.data.success) {
        message.success(response.data.message || 'Invitation rejected');
        fetchUserGroups();
      }
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      message.error(err.response?.data?.message || 'Failed to reject invitation');
    } finally {
      setProcessingInvitation(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout role="student">
          <div className="flex items-center justify-center h-96">
            <Spin size="large" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout role="student">
        <ConfigProvider theme={lightTheme}>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
              <p className="text-gray-500 mt-1">View and manage your group memberships</p>
            </div>

            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <Card className="bg-amber-50 border-amber-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pending Invitations ({pendingInvitations.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingInvitations.map((group) => (
                    <div
                      key={group.GroupID}
                      className="bg-white p-4 rounded-xl border-2 border-amber-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{group.Name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{group.Description || 'No description'}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <UserCheck className="w-4 h-4" />
                            <span>
                              from{' '}
                              {group.Creator.FirstName && group.Creator.LastName
                                ? `${group.Creator.FirstName} ${group.Creator.LastName}`
                                : group.Creator.Username}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>Invited: {new Date(group.invitedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => handleAcceptInvitation(group.GroupID)}
                          loading={processingInvitation === group.GroupID}
                          className="flex-1"
                          style={{ background: '#10b981' }}
                        >
                          Accept
                        </Button>
                        <Button
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => handleRejectInvitation(group.GroupID)}
                          loading={processingInvitation === group.GroupID}
                          className="flex-1"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* My Groups */}
            <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  My Groups ({acceptedGroups.length})
                </h2>
              </div>

              {acceptedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acceptedGroups.map((group) => (
                    <div
                      key={group.GroupID}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md cursor-pointer"
                      onClick={() => router.push(`/student/quizzes?group=${group.GroupID}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          Joined
                        </Tag>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{group.Name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {group.Description || 'No description'}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UserCheck className="w-4 h-4" />
                          <span>
                            Teacher:{' '}
                            {group.Creator.FirstName && group.Creator.LastName
                              ? `${group.Creator.FirstName} ${group.Creator.LastName}`
                              : group.Creator.Username}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Joined: {new Date(group.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium mb-2">No groups joined yet</p>
                      <p className="text-gray-500 text-sm">
                        Wait for invitations from your teachers to join groups and access quizzes
                      </p>
                    </div>
                  }
                />
              )}
            </Card>
          </div>
        </ConfigProvider>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
