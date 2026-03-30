'use client';
import { Trophy, Medal, Award, Clock, Target, TrendingUp } from 'lucide-react';

export default function QuizLeaderboard({ data, quizTitle }) {
  const getEntryScore = (entry) => {
    const numericPercentage = Number(entry?.percentage);
    if (Number.isFinite(numericPercentage)) {
      return numericPercentage;
    }

    const score = Number(entry?.score);
    const totalScore = Number(entry?.totalScore);
    if (Number.isFinite(score) && Number.isFinite(totalScore) && totalScore > 0) {
      return (score / totalScore) * 100;
    }

    return 0;
  };

  const formatPercentage = (value) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `${safeValue.toLocaleString(undefined, {
      minimumFractionDigits: safeValue % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 2,
    })}%`;
  };

  const getParticipantKey = (entry) => {
    return String(
      entry?.userId ||
      entry?.UserID ||
      entry?.email ||
      entry?.username ||
      `${entry?.fullName || 'participant'}`
    ).toLowerCase();
  };

  const getEntryDurationInSeconds = (entry) => {
    const raw = Number(
      entry?.timeSpentSeconds ??
      entry?.timeSpent ??
      entry?.TimeSpent ??
      entry?.timeTaken ??
      entry?.TimeTaken ??
      entry?.duration ??
      entry?.Duration ??
      0
    );

    if (!Number.isFinite(raw) || raw <= 0) {
      return 0;
    }

    // Quiz submission currently sends seconds, but keep ms fallback for compatibility.
    return raw > 24 * 60 * 60 ? Math.floor(raw / 1000) : Math.floor(raw);
  };

  const formatTime = (totalSeconds) => {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getFormattedDuration = (entry) => {
    if (typeof entry?.timeSpentFormatted === 'string' && entry.timeSpentFormatted.trim()) {
      return entry.timeSpentFormatted.trim();
    }

    return formatTime(getEntryDurationInSeconds(entry));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const leaderboardData = (Array.isArray(data) ? data : []).reduce((acc, entry) => {
    const key = getParticipantKey(entry);
    const current = acc.get(key);
    const entryScore = getEntryScore(entry);
    const currentScore = current ? getEntryScore(current) : -1;
    const entryPoints = Number(entry?.score || 0);
    const currentPoints = Number(current?.score || 0);
    const entryTime = getEntryDurationInSeconds(entry) || Number.MAX_SAFE_INTEGER;
    const currentTime = getEntryDurationInSeconds(current) || Number.MAX_SAFE_INTEGER;

    // Keep one best attempt per participant for stable ranking.
    if (
      !current ||
      entryScore > currentScore ||
      (entryScore === currentScore && entryPoints > currentPoints) ||
      (entryScore === currentScore && entryPoints === currentPoints && entryTime < currentTime)
    ) {
      acc.set(key, entry);
    }

    return acc;
  }, new Map());

  const rankedData = Array.from(leaderboardData.values()).sort((a, b) => {
    const scoreDiff = getEntryScore(b) - getEntryScore(a);
    if (scoreDiff !== 0) return scoreDiff;

    const pointsDiff = Number(b?.score || 0) - Number(a?.score || 0);
    if (pointsDiff !== 0) return pointsDiff;

    return (getEntryDurationInSeconds(a) || Number.MAX_SAFE_INTEGER) - (getEntryDurationInSeconds(b) || Number.MAX_SAFE_INTEGER);
  });

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
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

  if (!rankedData || rankedData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No submissions yet</p>
        <p className="text-gray-400 text-sm mt-2">The leaderboard will update as students submit their responses</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Quiz Leaderboard</h2>
              {quizTitle && <p className="text-blue-100 text-sm mt-1">{quizTitle}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Total Participants</p>
            <p className="text-3xl font-bold">{rankedData.length}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-100">
        {rankedData.map((entry, index) => (
          <div
            key={`${getParticipantKey(entry)}-${index}`}
            className={`p-6 transition-all hover:bg-gray-50 ${
              index < 3 ? 'bg-gradient-to-r from-blue-50/30 to-purple-50/30' : ''
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
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        TOP {index + 1}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm truncate">{entry.email}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Submitted {formatDate(entry.completedAt)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6">
                {/* Score */}
                <div className="text-center">
                  <div className="flex items-center space-x-1 text-gray-500 text-xs mb-1">
                    <Target className="w-3 h-3" />
                    <span>Score</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPercentage(getEntryScore(entry))}
                  </div>
                </div>

                {/* Correct Answers */}
                <div className="text-center">
                  <div className="flex items-center space-x-1 text-gray-500 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Points</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {entry.score}/{entry.totalScore}
                  </div>
                </div>

                {/* Time */}
                <div className="text-center">
                  <div className="flex items-center space-x-1 text-gray-500 text-xs mb-1">
                    <Clock className="w-3 h-3" />
                    <span>Time</span>
                  </div>
                  <div className="text-lg font-semibold text-purple-600">
                    {getFormattedDuration(entry)}
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
