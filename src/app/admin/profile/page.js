'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { userAPI } from '../../../utils/api';
import {
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function AdminProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.getProfile();
      
      if (response.data.success) {
        setProfile(response.data.data);
        setEditedProfile(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await userAPI.updateProfile({
        FirstName: editedProfile.FirstName,
        LastName: editedProfile.LastName,
        PhoneNumber: editedProfile.PhoneNumber,
        Bio: editedProfile.Bio
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setEditedProfile(response.data.data);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout role="admin">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                Admin Profile
              </h1>
              <p className="text-gray-600 mt-1">Manage your administrator account</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 h-32"></div>
            
            {/* Profile Content */}
            <div className="px-8 pb-8">
              {/* Avatar */}
              <div className="flex items-end -mt-16 mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white">
                  <span className="text-4xl font-bold">
                    {profile?.FirstName?.[0] || profile?.Username?.[0] || 'A'}
                  </span>
                </div>
                <div className="ml-6 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.FirstName && profile?.LastName
                      ? `${profile.FirstName} ${profile.LastName}`
                      : profile?.Username}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Administrator
                    </span>
                    {profile?.EmailVerified && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={editedProfile.FirstName || ''}
                            onChange={(e) => setEditedProfile({...editedProfile, FirstName: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={editedProfile.LastName || ''}
                            onChange={(e) => setEditedProfile({...editedProfile, LastName: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoField
                          icon={User}
                          label="First Name"
                          value={profile?.FirstName || 'Not set'}
                        />
                        <InfoField
                          icon={User}
                          label="Last Name"
                          value={profile?.LastName || 'Not set'}
                        />
                      </>
                    )}
                    
                    <InfoField
                      icon={User}
                      label="Username"
                      value={profile?.Username || 'N/A'}
                    />
                    <InfoField
                      icon={Mail}
                      label="Email"
                      value={profile?.Email || 'N/A'}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editedProfile.PhoneNumber || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, PhoneNumber: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    ) : (
                      <InfoField
                        icon={Phone}
                        label="Phone Number"
                        value={profile?.PhoneNumber || 'Not set'}
                      />
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Bio</h3>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.Bio || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, Bio: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700">
                        {profile?.Bio || 'No bio provided'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      icon={Calendar}
                      label="Account Created"
                      value={formatDate(profile?.CreatedAt)}
                    />
                    <InfoField
                      icon={Calendar}
                      label="Last Updated"
                      value={formatDate(profile?.UpdatedAt)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Info Field Component
function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  );
}
