'use client';

import { useState, useEffect, use } from 'react';
import { fileAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';

export default function FileDetails({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChunk, setSelectedChunk] = useState(null);

  useEffect(() => {
    fetchFileDetails();
  }, []);

  const fetchFileDetails = async () => {
    try {
      setLoading(true);
      const fileId = resolvedParams.fileId;
      const response = await fileAPI.getFileById(fileId);
      setFile(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching file details:', err);
      setError(err.response?.data?.message || 'Failed to fetch file details');
    } finally {
      setLoading(false);
    }
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
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

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

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <DashboardLayout role="teacher">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              {error}
            </div>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
            >
              Go Back
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        <div className="space-y-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm"
          >
            ← Back to Files
          </button>

          <h1 className="text-3xl font-bold text-gray-900">File Details</h1>

          {/* File Information Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">File Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">File Name</p>
              <p className="text-lg font-medium text-gray-900">{file.FileName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">File Type</p>
              <p className="text-lg font-medium text-gray-900">
                {file.FileType.includes('pdf') ? 'PDF' : 'DOCX'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">File Size</p>
              <p className="text-lg font-medium text-gray-900">{formatFileSize(file.FileSize)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="mt-1">{getStatusBadge(file.Status)}</div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Total Chunks</p>
              <p className="text-lg font-medium text-gray-900">{file.TotalChunks}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Uploaded At</p>
              <p className="text-lg font-medium text-gray-900">{formatDate(file.UploadedAt)}</p>
            </div>

            {file.ProcessedAt && (
              <div>
                <p className="text-sm text-gray-600">Processed At</p>
                <p className="text-lg font-medium text-gray-900">{formatDate(file.ProcessedAt)}</p>
              </div>
            )}
          </div>
        </div>

          {/* Chunks Section */}
          <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Text Chunks ({file.Chunks?.length || 0})
          </h2>

          {file.Chunks && file.Chunks.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Chunk List */}
                <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg max-h-[600px] overflow-y-auto">
                  <h3 className="font-semibold mb-3 text-gray-700">Chunks List</h3>
                  <div className="space-y-2">
                    {file.Chunks.map((chunk) => (
                      <button
                        key={chunk.ChunkID}
                        onClick={() => setSelectedChunk(chunk)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedChunk?.ChunkID === chunk.ChunkID
                            ? 'bg-blue-600 text-white'
                            : 'bg-white hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="font-medium">Chunk {chunk.ChunkIndex + 1}</div>
                        <div className={`text-xs ${
                          selectedChunk?.ChunkID === chunk.ChunkID ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {chunk.Content.substring(0, 50)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chunk Content */}
                <div className="md:col-span-2">
                  {selectedChunk ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-700">
                          Chunk {selectedChunk.ChunkIndex + 1}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {selectedChunk.Content.length} characters
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded border border-gray-200 max-h-[540px] overflow-y-auto">
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {selectedChunk.Content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <p className="text-gray-500">Select a chunk from the list to view its content</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Text View */}
              <div className="mt-6">
                <details className="bg-gray-50 p-4 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    View Full Text (All Chunks Combined)
                  </summary>
                  <div className="mt-4 bg-white p-4 rounded border border-gray-200 max-h-[600px] overflow-y-auto">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {file.Chunks.map(chunk => chunk.Content).join(' ')}
                    </p>
                  </div>
                </details>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No chunks available for this file</p>
            </div>
          )}
        </div>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
