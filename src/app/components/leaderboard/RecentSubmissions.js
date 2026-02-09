'use client';
import { Clock, Activity, CheckCircle, Target, TrendingUp } from 'lucide-react';

export default function RecentSubmissions({ data }) {
  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No recent submissions</p>
        <p className="text-gray-400 text-sm mt-2">Recent quiz submissions will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Recent Submissions</h2>
              <p className="text-green-100 text-sm mt-1">Live quiz activity feed</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {data.map((submission) => (
          <div
            key={submission.submissionId || submission.id}
            className="p-5 transition-all hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              {/* Left Side - User and Quiz Info */}
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {(submission.fullName || submission.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {submission.fullName || submission.username}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      completed <span className="font-medium text-gray-700">{submission.quizTitle}</span>
                    </p>
                  </div>
                </div>

                {/* Time Ago */}
                <div className="flex items-center space-x-1 text-gray-400 text-xs ml-12">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(submission.completedAt)}</span>
                </div>
              </div>

              {/* Right Side - Stats */}
              <div className="flex items-center space-x-4">
                {/* Score Badge */}
                <div className={`px-4 py-2 rounded-xl border-2 ${getScoreColor(submission.percentage || submission.score)}`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {(submission.percentage || submission.score).toFixed(0)}
                      <span className="text-sm">%</span>
                    </div>
                    <div className="text-xs font-medium">Score</div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{submission.score}/{submission.totalScore}</span>
                    <span className="text-gray-400">points</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">{formatTime(submission.timeSpent)}</span>
                    <span className="text-gray-400">time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
