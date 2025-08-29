import { NextRequest, NextResponse } from 'next/server';
import { supabasePsycaiAdmin } from '@/lib/supabasePsycai';
import { supabaseUnwindAdmin } from '@/lib/supabaseUnwind';

export async function POST(req: NextRequest) {
  try {
    const { uid, email, name, photoURL } = await req.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Sync user to psycai Supabase (auth data)
    const { error: psycaiError } = await supabasePsycaiAdmin
      .from('users')
      .upsert({
        firebase_uid: uid,
        email,
        name,
        photo_url: photoURL,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'firebase_uid'
      });

    if (psycaiError) {
      console.error('Error syncing to psycai:', psycaiError);
      return NextResponse.json(
        { error: 'Failed to sync to psycai database' },
        { status: 500 }
      );
    }

    // 2. Create user reference in unwind Supabase (for app data foreign keys)
    const { error: unwindError } = await supabaseUnwindAdmin
      .from('users')
      .upsert({
        firebase_uid: uid
      }, {
        onConflict: 'firebase_uid'
      });

    if (unwindError) {
      console.error('Error syncing to unwind:', unwindError);
      return NextResponse.json(
        { error: 'Failed to sync to unwind database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'User synced to both databases'
    });

  } catch (error) {
    console.error('Sync user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
