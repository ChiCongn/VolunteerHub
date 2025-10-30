# Route Map
```bash
/api/v1/
  /auth
    POST   /register
    POST   /login
    POST   /logout
    POST   /forgot-password
    POST   /reset-password
  /users
    GET    / (admin)                 -> list users
    GET    /me                       -> current user
    GET    /:id                      -> public profile (or admin)
    PATCH  /me                       -> update own profile
    PATCH  /:id/role                 -> admin: change role
    PATCH  /:id/lock                 -> admin: lock/unlock
    DELETE /me                       -> soft-delete account
  /events
    GET    /                        -> discovery (public)
    GET    /:id                     -> event details
    POST   /                        -> manager/admin create
    PATCH  /:id                     -> manager (owner) / admin
    POST   /:id/cancel              -> manager/admin cancel (no hard delete)
    GET    /:id/stats               -> manager/admin event metrics
    GET    /pending                 -> admin (or /admin/events?status=pending)
  /events/:eventId/registrations
    POST   /                        -> volunteer enroll (creates registration pending)
    DELETE /:regId                  -> volunteer withdraw
    GET    /                        -> manager/admin list registrations (filterable)
    PATCH  /:regId/approve          -> manager/admin approve/deny
    PATCH  /:regId/complete         -> manager mark complete
  /events/:eventId/forms
    POST   /                        -> manager create form
    GET    /:formId
    PATCH  /:formId
    DELETE /:formId
  /events/:eventId/posts
    GET    /                        -> list posts in event
    POST   /                        -> create post (only after event approved / participant)
    PATCH  /:postId                  -> edit post (author/manager)
    DELETE /:postId                  -> delete post (author/manager/moderator)
    GET    /:postId                  -> get post with comments
  /posts/:postId/comments
    GET    /                        -> list comments (threaded)
    POST   /                        -> create comment
    PATCH  /:commentId               -> edit
    DELETE /:commentId               -> delete
  /posts/:postId/reactions
    GET    /                        -> list reactions
    POST   /                        -> add reaction
    DELETE /:reactionId              -> remove reaction
  /notifications
    GET    /users/:userId            -> user in-app notifications
    POST   /users/:userId/subscribe  -> web-push subscription
    PATCH  /:id/read                 -> mark read
    DELETE /:id                      -> delete notification
  /admin (admin-only convenience endpoints)
    GET    /users
    PATCH  /users/:id/approve-manager
    GET    /events?status=pending
    PATCH  /events/:id/approve
    GET    /exports/events
    GET    /exports/volunteers
    GET    /logs
  /stats
    GET /admin/overview              -> admin global overview
    GET /manager/overview            -> manager portfolio
    GET /events/:id                  -> event-level stats (manager/admin)
  /internal
    POST /hooks/events/:id/channels  -> internal hook (create discussion channel)
    POST /jobs/auto-deny             -> (internal) trigger background actions
```