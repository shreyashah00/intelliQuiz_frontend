# Leaderboard Feature Documentation

## Overview

The IntelliQuiz leaderboard system provides real-time tracking and visualization of student performance across quizzes and groups. It features live updates via Socket.IO and comprehensive analytics.

## Features Implemented

### 1. **Real-Time Leaderboard Updates**

- Socket.IO integration for live performance tracking
- Automatic updates when students submit quizzes
- Connection status indicator (Live/Offline)
- Auto-reconnection on connection loss

### 2. **Three Leaderboard Views**

#### Recent Activity

- Live feed of quiz submissions across all quizzes
- Shows last 20 submissions by default
- Real-time updates with new submissions appearing instantly
- Displays:
  - Student name and quiz title
  - Score percentage
  - Correct answers count
  - Completion time
  - Time ago indicator

#### Quiz Leaderboard

- Rankings for a specific quiz
- Dropdown to select from published quizzes
- Top 3 highlighted with special badges
- Displays:
  - Rank with trophy icons for top 3
  - Student name and email
  - Score percentage
  - Correct answers vs total questions
  - Completion time
  - Submission timestamp

#### Group Leaderboard

- Aggregated performance across all quizzes in a group
- Dropdown to select from your groups
- Comprehensive student analytics
- Displays:
  - Overall rank within the group
  - Total quizzes completed
  - Average score
  - Best and worst scores
  - Total accumulated score
  - Visual progress bars

### 3. **UI Components**

#### QuizLeaderboard Component

Location: `src/app/components/leaderboard/QuizLeaderboard.js`

- Beautiful gradient cards for top performers
- Trophy, Medal, and Award icons for top 3
- Responsive stat display
- Hover effects and animations

#### GroupLeaderboard Component

Location: `src/app/components/leaderboard/GroupLeaderboard.js`

- Grid layout for multiple statistics
- Color-coded progress bars
- Performance-based score coloring
- Comprehensive student metrics

#### RecentSubmissions Component

Location: `src/app/components/leaderboard/RecentSubmissions.js`

- Activity feed design
- Score badges with color coding
- Time ago formatting
- Live indicator with pulse animation

### 4. **API Integration**

#### Leaderboard API Endpoints

Location: `src/utils/api.js`

```javascript
// Get quiz leaderboard
leaderboardAPI.getQuizLeaderboard(quizId);

// Get group leaderboard
leaderboardAPI.getGroupLeaderboard(groupId);

// Get recent submissions
leaderboardAPI.getRecentSubmissions(limit);
```

### 5. **Socket.IO Integration**

#### Socket Utility

Location: `src/utils/socket.js`

Features:

- Auto-reconnection with exponential backoff
- JWT authentication
- Multiple transport support (websocket, polling)
- Event subscription management

Events:

- `quizSubmitted` - New quiz submission
- `leaderboardUpdate` - Leaderboard data changed

Usage:

```javascript
import { initializeSocket, subscribeToQuizSubmissions } from "@/utils/socket";

// Initialize connection
const socket = initializeSocket();

// Subscribe to submissions
const unsubscribe = subscribeToQuizSubmissions((data) => {
  console.log("New submission:", data);
});

// Cleanup
unsubscribe();
```

## File Structure

```
src/
├── app/
│   ├── components/
│   │   └── leaderboard/
│   │       ├── QuizLeaderboard.js       # Quiz rankings
│   │       ├── GroupLeaderboard.js      # Group rankings
│   │       └── RecentSubmissions.js     # Activity feed
│   └── teacher/
│       ├── leaderboard/
│       │   └── page.js                  # Main leaderboard page
│       └── page.js                      # Dashboard (updated)
├── utils/
│   ├── api.js                           # API utilities (updated)
│   └── socket.js                        # Socket.IO utilities (new)
└── package.json                         # Dependencies (updated)
```

## Navigation Updates

### Teacher Dashboard

- Added "View Leaderboards" quick action button
- Trophy icon with orange gradient
- Links to `/teacher/leaderboard`

### Sidebar Navigation

- Added "Leaderboards" menu item
- Positioned between Group Management and Profile
- Trophy icon for easy identification

## Usage Guide

### For Teachers

1. **Access Leaderboards**
   - Click "View Leaderboards" from dashboard quick actions
   - Or select "Leaderboards" from the sidebar menu

2. **View Recent Activity**
   - Default view shows last 20 submissions
   - Automatically updates when students submit quizzes
   - Look for "Live" indicator to confirm real-time connection

3. **View Quiz Leaderboard**
   - Click "Quiz Leaderboard" tab
   - Select a quiz from the dropdown
   - See ranked list of all submissions for that quiz
   - Top 3 performers highlighted with special badges

4. **View Group Leaderboard**
   - Click "Group Leaderboard" tab
   - Select a group from the dropdown
   - See aggregated performance across all group quizzes
   - View comprehensive analytics for each student

5. **Refresh Data**
   - Click "Refresh" button at any time
   - Manual refresh updates current view
   - Useful if connection is offline

## Technical Details

### Dependencies Added

- `socket.io-client`: ^4.x - Real-time bidirectional communication

### Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
# Socket.IO will connect to http://localhost:5000
```

### Backend Requirements

The backend must implement:

1. **API Endpoints**
   - `GET /api/leaderboard/quiz/:quizId`
   - `GET /api/leaderboard/group/:groupId`
   - `GET /api/leaderboard/recent?limit=20`

2. **Socket.IO Events**
   - Server emits `quizSubmitted` when a quiz is submitted
   - Server emits `leaderboardUpdate` when rankings change

3. **Authentication**
   - JWT token in Authorization header
   - Socket.IO authentication via handshake

### Performance Considerations

- Recent submissions cached in component state
- Leaderboard updates debounced to prevent excessive re-renders
- Socket reconnection with exponential backoff
- Cleanup functions prevent memory leaks

### Error Handling

- Connection errors logged to console
- Graceful fallback when Socket.IO unavailable
- User-friendly error messages
- Manual refresh option always available

## Color Scheme

### Score Colors

- 90%+ : Green (Excellent)
- 75-89%: Blue (Good)
- 60-74%: Yellow (Average)
- Below 60%: Orange (Needs Improvement)

### Rank Badges

- 1st Place: Gold gradient (yellow-600)
- 2nd Place: Silver gradient (gray-500)
- 3rd Place: Bronze gradient (amber-700)
- Others: White with gray border

## Future Enhancements

Potential improvements:

- Export leaderboard as PDF/CSV
- Filter by date range
- Compare multiple groups
- Student achievement badges
- Historical performance trends
- Email notifications for top performers
- Custom leaderboard periods (weekly, monthly)

## Troubleshooting

### Socket Not Connecting

1. Check if backend server is running
2. Verify NEXT_PUBLIC_API_URL environment variable
3. Check browser console for connection errors
4. Ensure JWT token is valid

### Leaderboard Not Updating

1. Check "Live" indicator status
2. Click "Refresh" button to update manually
3. Verify backend is emitting Socket.IO events
4. Check if quiz submissions are being saved

### Empty Leaderboards

1. Ensure quizzes are published
2. Confirm students have submitted responses
3. Check API endpoint responses in Network tab
4. Verify database contains quiz response data

## Support

For issues or questions:

- Check browser console for errors
- Verify all dependencies are installed
- Ensure backend API is accessible
- Review Socket.IO connection logs

---

**Version:** 1.0.0  
**Last Updated:** February 8, 2026  
**Author:** IntelliQuiz Development Team
