'use client';
import { Trophy, Users, TrendingUp, Target, Award, Star } from 'lucide-react';

export default function GroupLeaderboard({ data, groupName }) {
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Award className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Star className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-semibold text-lg">#{index + 1}</span>;
    }
  };

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-white border-2 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No data available</p>
        <p className="text-gray-400 text-sm mt-2">Students need to complete quizzes to appear on the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Group Leaderboard</h2>
              {groupName && <p className="text-purple-100 text-sm mt-1">{groupName}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-100 text-sm">Total Students</p>
            <p className="text-3xl font-bold">{data.length}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-100">
        {data.map((entry, index) => (
          <div
            key={entry.userId}
            className={`p-6 transition-all hover:bg-gray-50 ${
              index < 3 ? 'bg-gradient-to-r from-purple-50/30 to-pink-50/30' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Rank and User Info */}
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRankBadge(index)}`}>
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {entry.fullName || entry.username}
                    </h3>
                    {index < 3 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        RANK {index + 1}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm truncate">{entry.email}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                {/* Total Quizzes */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-gray-500 text-xs mb-1">
                    <Target className="w-3 h-3" />
                    <span>Quizzes</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {entry.quizzesCompleted || 0}
                  </div>
                </div>

                {/* Average Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-gray-500 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Avg Score</span>
                  </div>
                  <div className={`text-xl font-bold ${getScoreColor(entry.averagePercentage || 0)}`}>
                    {(entry.averagePercentage || 0).toFixed(1)}%
                  </div>
                </div>

                {/* Best Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-gray-500 text-xs mb-1">
                    <Star className="w-3 h-3" />
                    <span>Best</span>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {entry.quizDetails && entry.quizDetails.length > 0 
                      ? Math.max(...entry.quizDetails.map(q => q.percentage)).toFixed(0)
                      : 0}%
                  </div>
                </div>

                {/* Total Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-gray-500 text-xs mb-1">
                    <Trophy className="w-3 h-3" />
                    <span>Total</span>
                  </div>
                  <div className="text-xl font-bold text-purple-600">
                    {entry.totalScore || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (entry.averagePercentage || 0) >= 90
                      ? 'bg-gradient-to-r from-green-400 to-green-600'
                      : (entry.averagePercentage || 0) >= 75
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                      : (entry.averagePercentage || 0) >= 60
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                      : 'bg-gradient-to-r from-orange-400 to-orange-600'
                  }`}
                  style={{ width: `${entry.averagePercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
