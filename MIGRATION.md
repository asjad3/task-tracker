# Migration Guide: Local Storage to User Authentication

If you were using an older version of UniTrack Pro that stored tasks in local storage, this guide will help you migrate to the new authentication-based system.

## What Changed?

The app has been completely redesigned from the ground up:

### Old System
- ✗ Tasks stored in browser's localStorage
- ✗ No user accounts
- ✗ Tasks lost if you cleared browser data
- ✗ No way to access tasks from different devices
- ✗ Optional Supabase sync via manual configuration

### New System
- ✓ Secure user authentication required
- ✓ All tasks stored in Supabase cloud database
- ✓ Access your tasks from any device
- ✓ Each user has their own private task list
- ✓ Automatic cloud sync
- ✓ Row Level Security ensures data privacy

## Important: Data Migration

**⚠️ Your existing tasks stored in localStorage will NOT be automatically migrated.**

The new system requires authentication, and tasks are associated with user accounts. Your old local tasks cannot be automatically transferred because they weren't associated with any user.

### Options for Preserving Your Data

If you have important tasks in the old version, here are your options:

#### Option 1: Manual Data Export/Import (Recommended for few tasks)

1. **Before updating**, open your browser's Developer Console (F12)
2. Run this command to export your tasks:
   ```javascript
   console.log(JSON.stringify(JSON.parse(localStorage.getItem('unitrack_data') || '[]'), null, 2))
   ```
3. Copy the output and save it to a file
4. Update to the new version and create an account
5. Manually re-create important tasks

#### Option 2: Browser-Based Migration Script (For many tasks)

If you have many tasks, you can use this script:

1. **Before updating**, keep the old version open
2. Open Developer Console (F12)
3. Run this script to export tasks as a CSV:

```javascript
(function() {
  const tasks = JSON.parse(localStorage.getItem('unitrack_data') || '[]');
  if (tasks.length === 0) {
    console.log('No tasks found');
    return;
  }
  
  const csv = [
    ['Title', 'Course', 'Type', 'Status', 'Priority', 'Due Date', 'Description'].join(','),
    ...tasks.map(t => [
      `"${t.title}"`,
      `"${t.course}"`,
      `"${t.type}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.dueDate}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'unitrack-tasks-export.csv';
  a.click();
  console.log('Tasks exported to CSV!');
})();
```

4. This will download a CSV file with all your tasks
5. You can reference this file when creating tasks in the new system

#### Option 3: Keep Old Version Temporarily

1. Bookmark the old deployment or keep the old version running locally
2. Set up the new version alongside it
3. Gradually recreate important tasks in the new system
4. Once done, you can retire the old version

## Setting Up the New Version

Follow the [SETUP.md](./SETUP.md) guide to:

1. Create a Supabase account and project
2. Set up the database tables
3. Configure your environment variables
4. Create your user account

## Why This Change?

The migration to a proper authentication system provides:

1. **Security**: Your tasks are protected and private
2. **Reliability**: No more lost data from clearing browser storage
3. **Accessibility**: Access your tasks from any device
4. **Features**: Opens up possibilities for future features like:
   - Task sharing and collaboration
   - Email notifications for deadlines
   - Mobile apps
   - Advanced analytics

## Frequently Asked Questions

### Q: Can I continue using localStorage?
**A:** No, the new version requires Supabase authentication. This is a breaking change that improves security and functionality.

### Q: Is my data safe in Supabase?
**A:** Yes! Supabase uses PostgreSQL with Row Level Security (RLS). Each user can only access their own data, and it's stored securely in the cloud.

### Q: Do I need to pay for Supabase?
**A:** The free tier is more than sufficient for personal use. You get 500MB database space and 50,000 monthly active users - way more than needed for a personal task tracker.

### Q: What happens to my old localStorage data?
**A:** It remains in your browser's localStorage but is no longer used by the app. You can manually clear it at any time.

### Q: Can I self-host Supabase?
**A:** Yes! Supabase is open source and can be self-hosted. See the [Supabase self-hosting docs](https://supabase.com/docs/guides/self-hosting) for details.

## Need Help?

- Check the [SETUP.md](./SETUP.md) for detailed setup instructions
- Visit the [Supabase documentation](https://supabase.com/docs)
- Open an issue on GitHub if you encounter problems

---

**Note**: This migration represents a major architectural change. We believe the benefits of cloud storage and proper authentication far outweigh the one-time migration effort.
