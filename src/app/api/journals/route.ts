import { NextRequest, NextResponse } from 'next/server';
import { supabaseUnwindAdmin } from '@/lib/supabaseUnwind';

export async function POST(req: NextRequest) {
  try {
    const { firebase_uid, title, content, mood_score } = await req.json();

    const { data, error } = await supabaseUnwindAdmin
      .from('journals')
      .insert({
        firebase_uid,
        title,
        content,
        mood_score
      })
      .select();

    if (error) {
      console.error('Error creating journal:', error);
      return NextResponse.json({ error: 'Failed to create journal' }, { status: 500 });
    }

    return NextResponse.json({ journal: data[0], success: true });
  } catch (error) {
    console.error('Journal API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const firebase_uid = searchParams.get('firebase_uid');

  if (!firebase_uid) {
    return NextResponse.json({ error: 'Missing firebase_uid' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseUnwindAdmin
      .from('journals')
      .select('*')
      .eq('firebase_uid', firebase_uid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journals:', error);
      return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 });
    }

    return NextResponse.json({ journals: data });
  } catch (error) {
    console.error('Journal fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
