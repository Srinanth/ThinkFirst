import { supabase, supabaseAdmin } from '../src/config/supabase.js';

async function seedAdmin() {
  console.log('--- Starting ThinkFirst Admin Seeding ---');

  const adminEmail = 'admin@institution.edu';
  const adminPassword = 'Admin2026!';
  const adminFullName = 'Dr. Alexander Vance';
  const adminRole = 'admin';
  const collegeName = 'Faculty of Engineering';
  const loginId = 'ADM-89421';

  try {
    // 1. List existing auth users to check if user exists
    console.log(`Connecting to Supabase Auth to find ${adminEmail}...`);
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    let adminUser = userList.users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());

    if (!adminUser) {
      console.log(`Creating auth user for ${adminEmail}...`);
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: adminFullName,
          role: adminRole,
          college: collegeName,
          login_id: loginId,
        },
      });

      if (createError || !created.user) {
        throw new Error(`Failed to create admin auth user: ${createError?.message}`);
      }
      adminUser = created.user;
      console.log(`Auth user created with UUID: ${adminUser.id}`);
    } else {
      console.log(`Auth user already exists (UUID: ${adminUser.id}). Resetting password and metadata...`);
      const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        adminUser.id,
        {
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            full_name: adminFullName,
            role: adminRole,
            college: collegeName,
            login_id: loginId,
          },
        }
      );
      if (updateError || !updated.user) {
        console.warn('Warning updating user metadata:', updateError?.message);
      } else {
        adminUser = updated.user;
      }
    }

    // 2. Also ensure admin.thinkfirst2026@gmail.com has its password updated if present
    const thinkfirstAdmin = userList.users.find(
      (u) => u.email?.toLowerCase() === 'admin.thinkfirst2026@gmail.com'
    );
    if (thinkfirstAdmin) {
      console.log('Syncing existing admin.thinkfirst2026@gmail.com with Admin2026! password...');
      await supabaseAdmin.auth.admin.updateUserById(thinkfirstAdmin.id, {
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: adminFullName,
          role: adminRole,
          college: collegeName,
          login_id: loginId,
        },
      });

      // Upsert profile for this user too
      await supabaseAdmin.from('profiles').upsert(
        {
          id: thinkfirstAdmin.id,
          full_name: adminFullName,
          role: adminRole,
          college: collegeName,
        },
        { onConflict: 'id' }
      );
    }

    // 3. Upsert into public.profiles for primary adminUser
    console.log(`Upserting profile in public.profiles for ${adminEmail}...`);
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: adminUser.id,
          full_name: adminFullName,
          role: adminRole,
          college: collegeName,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (profileError) {
      throw new Error(`Failed to upsert profile: ${profileError.message}`);
    }
    console.log('Profile record in public.profiles:', profileData);

    // 4. Verify live Supabase Auth sign in
    console.log('Verifying client authentication with supabase.auth.signInWithPassword...');
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (signInError || !sessionData.session) {
      throw new Error(`Authentication verification failed: ${signInError?.message}`);
    }

    console.log('Authentication successful!');
    console.log('Live JWT Access Token acquired successfully.');

    console.log('\n======================================================');
    console.log('        COLLEGE ADMIN SEEDING SUCCESSFUL             ');
    console.log('======================================================');
    console.log('College Affiliation : ', collegeName);
    console.log('Administrator Name  : ', adminFullName);
    console.log('Role                : ', adminRole);
    console.log('Login ID (Portal)   : ', loginId);
    console.log('Email               : ', adminEmail);
    console.log('Password            : ', adminPassword);
    console.log('User UUID           : ', adminUser.id);
    console.log('Secondary Admin     :  admin.thinkfirst2026@gmail.com (same password)');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Seeding encountered an error:', err);
    process.exit(1);
  }
}

seedAdmin();
