<!-- 7998db1c-dcaa-486f-a0cd-263b3704a20b c2cc4eff-bdbc-4562-9e85-4cdb4231490f -->
# Plan: Recent Workouts from DB

### Assumptions

- Source is the authenticated user's WorkoutLogs ordered by `startedAt` desc
- Limit 5 items (configurable via query `limit`)

### API

- Add `GET /app/api/workouts/recent/route.ts`
- Auth required (401 if not logged in)
- Query: `limit` (1-20, default 5)
- Returns: `{ items: Array<{ id, title, duration, startedAt, completedAt, workoutId, workout?: { name } }> }`
- Service `lib/server/services/workout-logs.service.ts`
- `listRecentLogs(userId, limit)` Prisma query with select/include

### UI Update

- Update `app/(client)/dashboard/page.tsx`
- Fetch recent logs server-side using absolute URL with headers (like earlier fix)
- Render list items using real fields (title or `workout.name` fallback)
- Format relative time (Today/Yesterday/x days ago) and duration mins
- Hide calories for now (not in schema); keep slot for future metric

### Error/Loading States

- If no logs: show empty state text
- Hard failures: show subtle error text and keep list hidden

### Files

- `lib/server/services/workout-logs.service.ts`
- `app/api/workouts/recent/route.ts`
- `app/(client)/dashboard/page.tsx` (adjust recent section only)

### To-dos

- [ ] Create workout-logs.service.ts with listRecentLogs(userId, limit)
- [ ] Implement GET /api/workouts/recent with auth and Zod
- [ ] Update dashboard Recent Workouts to fetch and render real data