import { supabase, supabaseAdmin } from '../src/config/supabase.js';

async function syncAllUsers() {
  console.log('--- Syncing Test User Passwords ---');
  const password = 'Admin2026!';

  const usersToSync = [
    { email: 'admin@institution.edu', role: 'admin', name: 'Dr. Alexander Vance' },
    { email: 'teacher.demo@thinkfirst.edu', role: 'teacher', name: 'Dr. Alistair Vance' },
    { email: 'student.demo@thinkfirst.edu', role: 'student', name: 'Lucas Chen, Honors Scholar' },
  ];

  for (const item of usersToSync) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email?.toLowerCase() === item.email.toLowerCase());

    if (existing) {
      console.log(`Updating password for ${item.email} (${existing.id})...`);
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: password,
        email_confirm: true,
      });
    } else {
      console.log(`Creating user ${item.email}...`);
      const { data: created } = await supabaseAdmin.auth.admin.createUser({
        email: item.email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: item.name, role: item.role },
      });
      if (created?.user) {
        await supabaseAdmin.from('profiles').upsert({
          id: created.user.id,
          full_name: item.name,
          role: item.role,
          college: 'Faculty of Engineering',
        });
      }
    }

    // Verify sign in
    const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
      email: item.email,
      password: password,
    });
    if (signInErr) {
      console.error(`Sign in check failed for ${item.email}:`, signInErr.message);
    } else {
      console.log(`Verified auth for ${item.email} - Token acquired: ${Boolean(signIn.session?.access_token)}`);
    }
  }
}

syncAllUsers();
