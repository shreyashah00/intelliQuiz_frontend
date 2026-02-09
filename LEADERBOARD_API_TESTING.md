# Leaderboard API Testing Guide

## How to Verify API Endpoints

The leaderboard implementation now includes detailed console logging to trace all API calls.

### Testing Steps:

1. **Open Browser Console**
   - Press F12 in your browser
   - Go to the Console tab

2. **Navigate to Leaderboards**
   - Go to Teacher Dashboard → Leaderboards

3. **Check Console Logs**

You should see logs like this:

#### When Page Loads:

```
[leaderboardAPI] Calling GET /leaderboard/recent?limit=20
[API Call] GET /api/leaderboard/recent?limit=20
[API Response] Recent submissions: {success: true, data: [...]}
```

#### When Selecting a Quiz:

```
[leaderboardAPI] Calling GET /leaderboard/quiz/abc-123-def
[API Call] GET /api/leaderboard/quiz/abc-123-def
[API Response] Quiz abc-123-def leaderboard: {success: true, data: [...]}
```

#### When Selecting a Group:

```
[leaderboardAPI] Calling GET /leaderboard/group/xyz-789-abc
[API Call] GET /api/leaderboard/group/xyz-789-abc
[API Response] Group xyz-789-abc leaderboard: {success: true, data: [...]}
```

### Expected API Calls:

| Feature            | Endpoint                              | Parameters                     |
| ------------------ | ------------------------------------- | ------------------------------ |
| Recent Submissions | `GET /api/leaderboard/recent`         | `?limit=20`                    |
| Quiz Leaderboard   | `GET /api/leaderboard/quiz/:quizId`   | `:quizId` = selected quiz ID   |
| Group Leaderboard  | `GET /api/leaderboard/group/:groupId` | `:groupId` = selected group ID |

### Verifying Correct Endpoints:

1. **Recent Activity Tab**
   - Should call: `/api/leaderboard/recent?limit=20`
   - Should NOT call quiz or group endpoints

2. **Quiz Leaderboard Tab**
   - Select a quiz from dropdown
   - Should call: `/api/leaderboard/quiz/{QUIZ_ID}`
   - Should NOT call recent or group endpoints
   - The {QUIZ_ID} should be the actual UUID of the selected quiz

3. **Group Leaderboard Tab**
   - Select a group from dropdown
   - Should call: `/api/leaderboard/group/{GROUP_ID}`
   - Should NOT call recent or quiz endpoints
   - The {GROUP_ID} should be the actual UUID of the selected group

### Network Tab Verification:

1. Open **Network** tab in DevTools
2. Filter by **XHR** or **Fetch**
3. Navigate to leaderboards
4. You should see actual HTTP requests being made:
   - `leaderboard/recent?limit=20`
   - `leaderboard/quiz/{uuid}`
   - `leaderboard/group/{uuid}`

### If APIs Are Not Working:

Check the following:

1. **Backend Server Running?**

   ```bash
   # Backend should be running on http://localhost:5000
   ```

2. **API Base URL Correct?**
   - Check `.env.local` file
   - Should have: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

3. **Backend Routes Implemented?**
   - Verify backend has these routes:
     - `GET /api/leaderboard/quiz/:quizId`
     - `GET /api/leaderboard/group/:groupId`
     - `GET /api/leaderboard/recent`

4. **Authentication Token Valid?**
   - Check if you're logged in
   - Token should be in Authorization header
   - Check localStorage for auth token

### Common Issues:

#### Issue 1: 404 Not Found

```
Error: Request failed with status code 404
```

**Solution:** Backend route not implemented. Implement the specific endpoint.

#### Issue 2: 401 Unauthorized

```
Error: Request failed with status code 401
```

**Solution:** JWT token missing or invalid. Re-login.

#### Issue 3: 500 Internal Server Error

```
Error: Request failed with status code 500
```

**Solution:** Backend error. Check backend console logs.

#### Issue 4: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:** Backend needs to enable CORS for frontend origin.

### Testing with Mock Data:

If backend is not ready, you can temporarily mock the API responses:

```javascript
// In src/utils/api.js - Temporary mock for testing

export const leaderboardAPI = {
  getQuizLeaderboard: async (quizId) => {
    console.log(`[MOCK] GET /leaderboard/quiz/${quizId}`);
    return {
      data: {
        success: true,
        data: [
          {
            userId: "1",
            username: "John Doe",
            email: "john@example.com",
            score: 95,
            totalQuestions: 10,
            correctAnswers: 9,
            completionTime: 450000,
            submittedAt: new Date().toISOString(),
          },
          // Add more mock data...
        ],
      },
    };
  },
  // ... similar for other endpoints
};
```

### Verification Checklist:

- [ ] Console shows correct endpoint being called
- [ ] Network tab shows HTTP request to correct URL
- [ ] Quiz ID in URL matches selected quiz
- [ ] Group ID in URL matches selected group
- [ ] No calls to recent endpoint when viewing quiz/group leaderboard
- [ ] Error messages display properly if endpoint fails
- [ ] Loading states work correctly
- [ ] Socket.IO connection status shows correctly

---

**Note:** The logging has been added to both:

1. `src/utils/api.js` - Shows which API function is called
2. `src/app/teacher/leaderboard/page.js` - Shows request/response details

This should help identify if the wrong endpoint is being called.
