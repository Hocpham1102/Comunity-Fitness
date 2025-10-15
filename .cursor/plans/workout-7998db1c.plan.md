<!-- 7998db1c-dcaa-486f-a0cd-263b3704a20b a54ad1f7-1d4e-4f9e-8b71-4cdae0a85ab0 -->
# Plan: Admin Exercise CRUD

### Scope

- Full CRUD for Exercise with RESTful endpoints, Zod validation, Prisma services
- Admin-only create/update/delete; public read (listing/search) is optional but available
- Responsive, accessible UI in admin area using shadcn/ui; consistent with existing layouts

### Endpoints

- POST/GET `/app/api/exercises/route.ts` → create + list (query: `page`, `pageSize`, `query`, `muscleGroups[]`, `equipment[]`, `difficulty`)
- GET/PATCH/DELETE `/app/api/exercises/[id]/route.ts`

### Service Layer (SOLID)

Create `lib/server/services/exercises.service.ts` with:

- `createExercise(user, data)`
- `listExercises(params)` (pagination + filters)
- `getExerciseById(id)`
- `updateExercise(id, user, data)` (admin only)
- `deleteExercise(id, user)` (admin only)

### Validation

- Reuse `exerciseSchema` from `lib/shared/schemas/workout.schema.ts`
- Add `createExerciseSchema` and `updateExerciseSchema` (partial) if needed
- 400 on Zod errors

### Auth & RBAC

- Use `auth()` in routes
- 401 if unauthenticated for mutations; 403 unless `role === 'ADMIN'`
- Keep public GET for list/get

### Caching

- Tags: `['exercises']`, `['exercise:{id}']`
- Revalidate tags on POST/PATCH/DELETE

### Admin UI

- Pages under admin group:
- `app/(admin)/exercises/page.tsx` list + filters + actions
- `app/(admin)/exercises/new/page.tsx` create form
- `app/(admin)/exercises/[id]/edit/page.tsx` edit form
- Components (shadcn/ui):
- `components/features/exercises/ExerciseForm.tsx`
- `components/features/exercises/ExerciseTable.tsx`
- `components/features/exercises/ExerciseFilters.tsx`
- `components/features/exercises/ConfirmDeleteDialog.tsx`
- UX: search, filter chips, pagination, empty states, toasts, keyboard focus, mobile-friendly table/cards

### Responses

- Create: 201 resource
- List: 200 `{ items, total, page, pageSize }`
- Get: 200 or 404
- Update: 200 resource
- Delete: 204

### Error Handling

- 400 Zod/bad input, 401 unauthenticated, 403 forbidden, 404 not found, 500 generic

### Integration

- Reuse enums for MuscleGroup/Equipment/Difficulty
- Client helpers in `app/(admin)/admin/exercises/actions.ts` (fetch wrappers)

### Files to add/update

- `lib/server/services/exercises.service.ts`
- `app/api/exercises/route.ts`
- `app/api/exercises/[id]/route.ts`
- `components/features/exercises/*`
- `app/(admin)/admin/exercises/*`

### To-dos

- [ ] Create exercises.service.ts with CRUD and filters
- [ ] Implement POST/GET in app/api/exercises/route.ts with auth + Zod
- [ ] Implement GET/PATCH/DELETE in app/api/exercises/[id]/route.ts
- [ ] Add revalidateTag for exercises on mutations
- [ ] Build admin Exercise list with filters, pagination, actions
- [ ] Build ExerciseForm with validation for create/edit
- [ ] Add new/edit pages under admin routes
- [ ] Add client helpers to call the API and show toasts