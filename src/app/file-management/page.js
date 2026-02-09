'use client';

import { useState, useEffect } from 'react';
import { fileAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';

export default function FileManagement() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, [page, filter]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: 10 };
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await fileAPI.getUserFiles(params);
      if (response.data.success) {
        setFiles(response.data.data?.files || []);
        setPagination(response.data.data?.pagination);
      } else {
        setError('Failed to load files');
        setFiles([]);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err.response?.data?.message || 'Failed to fetch files. Please try again.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fileAPI.getFileStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({
        totalFiles: 0,
        completedFiles: 0,
        processingFiles: 0,
        totalSize: 0
      });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF and DOCX files are allowed');
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      setUploadProgress(0);

      await fileAPI.uploadFile(selectedFile, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      setSuccess('File uploaded and processed successfully!');
      setSelectedFile(null);
      setUploadProgress(0);
      
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      fetchFiles();
      fetchStats();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await fileAPI.deleteFile(fileId);
      setSuccess('File deleted successfully');
      fetchFiles();
      fetchStats();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const handleViewFile = (fileId) => {
    router.push(`/file-details/${fileId}`);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800 border border-green-200',
      processing: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      failed: 'bg-red-100 text-red-800 border border-red-200'
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
            <p className="text-gray-600 mt-1">Upload and manage your educational documents</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-red-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setError('');
                  fetchFiles();
                }}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <div className="text-green-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-green-200/50 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedFiles}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-yellow-200/50 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.processingFiles}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-purple-200/50 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New File</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (PDF or DOCX, max 10MB)
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              {uploading && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              >
                {uploading ? 'Processing...' : 'Upload and Process'}
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-xl p-4 shadow-sm">
            <div className="flex space-x-2">
              {['all', 'completed', 'processing', 'failed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg transition-all capitalize ${
                    filter === f 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-xl shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Files</h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading files...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mb-4">
                    <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files Found</h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'all' 
                      ? 'Upload your first file to start generating quizzes!' 
                      : `No ${filter} files found. Try changing the filter.`}
                  </p>
                  {filter !== 'all' && (
                    <button
                      onClick={() => setFilter('all')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                    >
                      View All Files
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            File Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Chunks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {files.map((file) => (
                          <tr key={file.FileID} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {file.FileName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {file.FileType?.includes('pdf') ? 'PDF' : 'DOCX'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatFileSize(file.FileSize)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {file.TotalChunks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {getStatusBadge(file.Status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(file.UploadedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => handleViewFile(file.FileID)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(file.FileID)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total files)
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page === pagination.totalPages}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}