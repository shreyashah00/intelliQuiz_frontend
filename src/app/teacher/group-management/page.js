'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Input,
  Modal,
  message,
  Table,
  Tag,
  Spin,
  ConfigProvider,
  theme,
  Select,
  Space,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UserAddOutlined,
  SearchOutlined,
  TeamOutlined,
  CloseOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { Users, UserPlus, Trash2, Mail } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { groupAPI } from '../../../utils/api';

const { TextArea } = Input;

export default function GroupManagementPage() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addStudentsModalOpen, setAddStudentsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData] = useState({
    Name: '',
    Description: ''
  });

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
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupAPI.getGroups();
      if (response.data.success) {
        setGroups(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      message.error(err.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!formData.Name.trim()) {
      message.error('Group name is required');
      return;
    }

    try {
      const response = await groupAPI.createGroup(formData);
      if (response.data.success) {
        message.success('Group created successfully');
        setCreateModalOpen(false);
        setFormData({ Name: '', Description: '' });
        fetchGroups();
      }
    } catch (err) {
      console.error('Error creating group:', err);
      message.error(err.response?.data?.message || 'Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await groupAPI.deleteGroup(groupId);
      message.success('Group deleted successfully');
      fetchGroups();
    } catch (err) {
      console.error('Error deleting group:', err);
      message.error(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleSearchUsers = async (value) => {
    setSearchTerm(value);
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await groupAPI.searchUsers(value);
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      message.error(err.response?.data?.message || 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      message.error('Please select at least one student');
      return;
    }

    try {
      const response = await groupAPI.addStudents({
        GroupID: selectedGroup.GroupID,
        StudentIDs: selectedStudents
      });
      if (response.data.success) {
        message.success(`Successfully added ${selectedStudents.length} student(s) to the group`);
        setAddStudentsModalOpen(false);
        setSelectedStudents([]);
        setSearchTerm('');
        setSearchResults([]);
        fetchGroups();
      }
    } catch (err) {
      console.error('Error adding students:', err);
      message.error(err.response?.data?.message || 'Failed to add students');
    }
  };

  const handleRemoveStudent = async (groupId, userId) => {
    try {
      await groupAPI.removeStudent(groupId, userId);
      message.success('Student removed from group');
      fetchGroups();
    } catch (err) {
      console.error('Error removing student:', err);
      message.error(err.response?.data?.message || 'Failed to remove student');
    }
  };

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'Name',
      key: 'Name',
      render: (text) => <span className="font-semibold text-gray-900">{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
      ellipsis: true,
      render: (text) => <span className="text-gray-600">{text || 'No description'}</span>,
    },
    {
      title: 'Members',
      dataIndex: '_count',
      key: 'members',
      render: (count) => (
        <Tag color="blue" className="m-0">
          {count?.Members || 0} {count?.Members === 1 ? 'member' : 'members'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'CreatedAt',
      key: 'CreatedAt',
      render: (date) => <span className="text-gray-600 text-sm">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Add Students">
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              size="small"
              onClick={() => {
                setSelectedGroup(record);
                setAddStudentsModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="View Members">
            <Button
              icon={<TeamOutlined />}
              size="small"
              onClick={() => {
                Modal.info({
                  title: `Members of ${record.Name}`,
                  width: 600,
                  content: (
                    <div className="mt-4">
                      {record.Members && record.Members.length > 0 ? (
                        <div className="space-y-2">
                          {record.Members.map((member) => (
                            <div
                              key={member.GroupMemberID}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {member.User.FirstName?.[0] || member.User.Username[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-gray-900 font-medium">
                                    {member.User.FirstName && member.User.LastName
                                      ? `${member.User.FirstName} ${member.User.LastName}`
                                      : member.User.Username}
                                  </p>
                                  <p className="text-gray-600 text-sm">{member.User.Email}</p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    <Tag color={member.Status === 'accepted' ? 'success' : 'warning'}>
                                      {member.Status}
                                    </Tag>
                                    {member.Status === 'accepted' && member.AcceptedAt && (
                                      <span className="ml-2">
                                        Joined: {new Date(member.AcceptedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                    {member.Status === 'pending' && member.InvitedAt && (
                                      <span className="ml-2">
                                        Invited: {new Date(member.InvitedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Popconfirm
                                title="Remove this student from the group?"
                                onConfirm={() => handleRemoveStudent(record.GroupID, member.UserID)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Button danger size="small" icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No members yet</p>
                      )}
                    </div>
                  ),
                });
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this group?"
            description="This will remove all members and cannot be undone."
            onConfirm={() => handleDeleteGroup(record.GroupID)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Group">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <ConfigProvider theme={lightTheme}>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
                <p className="text-gray-500 mt-1">Create and manage student groups</p>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                style={{ background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))' }}
              >
                Create Group
              </Button>
            </div>

            {/* Groups Table */}
            <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-sm">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Spin size="large" />
                </div>
              ) : (
                <Table
                  dataSource={groups}
                  columns={columns}
                  rowKey="GroupID"
                  pagination={{ pageSize: 10 }}
                  locale={{
                    emptyText: (
                      <div className="py-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">No groups created yet</p>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setCreateModalOpen(true)}
                        >
                          Create Your First Group
                        </Button>
                      </div>
                    ),
                  }}
                />
              )}
            </Card>

            {/* Create Group Modal */}
            <Modal
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Create New Group</span>
                </div>
              }
              open={createModalOpen}
              onOk={handleCreateGroup}
              onCancel={() => {
                setCreateModalOpen(false);
                setFormData({ Name: '', Description: '' });
              }}
              okText="Create Group"
              cancelText="Cancel"
            >
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Computer Science 101"
                    size="large"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <TextArea
                    rows={3}
                    placeholder="Brief description of the group"
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  />
                </div>
              </div>
            </Modal>

            {/* Add Students Modal */}
            <Modal
              title={
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span>Add Students to {selectedGroup?.Name}</span>
                </div>
              }
              open={addStudentsModalOpen}
              onOk={handleAddStudents}
              onCancel={() => {
                setAddStudentsModalOpen(false);
                setSelectedStudents([]);
                setSearchTerm('');
                setSearchResults([]);
              }}
              okText={`Add ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
              cancelText="Cancel"
              width={600}
            >
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Search students by name, email, or username (min 2 characters)"
                  prefix={<SearchOutlined />}
                  size="large"
                  value={searchTerm}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  loading={searching}
                />

                {searching && (
                  <div className="text-center py-4">
                    <Spin />
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((user) => {
                      const isSelected = selectedStudents.includes(user.UserID);
                      return (
                        <div
                          key={user.UserID}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedStudents(selectedStudents.filter((id) => id !== user.UserID));
                            } else {
                              setSelectedStudents([...selectedStudents, user.UserID]);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-blue-500' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-600'}`}
                              >
                                {user.FirstName?.[0] || user.Username[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">
                                {user.FirstName && user.LastName
                                  ? `${user.FirstName} ${user.LastName}`
                                  : user.Username}
                              </p>
                              <p className="text-gray-600 text-sm">{user.Email}</p>
                            </div>
                          </div>
                          {isSelected && <CheckOutlined className="text-blue-600" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {searchTerm.length >= 2 && !searching && searchResults.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No students found</p>
                )}
              </div>
            </Modal>
          </div>
        </ConfigProvider>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
