import { NextResponse } from 'next/server';

const FALLBACKS: Record<string, string> = {
  'captain jean-luc picard': 'https://ui-avatars.com/api/?name=Jean+Luc+Picard&background=2E3A59&color=fff&rounded=true',
  'commander data': 'https://ui-avatars.com/api/?name=Data&background=2E3A59&color=fff&rounded=true',
  'lieutenant commander geordi la forge': 'https://ui-avatars.com/api/?name=Geordi+La+Forge&background=2E3A59&color=fff&rounded=true',
  'deanna troi': 'https://ui-avatars.com/api/?name=Deanna+Troi&background=2E3A59&color=fff&rounded=true',
  'worf': 'https://ui-avatars.com/api/?name=Worf&background=2E3A59&color=fff&rounded=true',
  'beverly crusher': 'https://ui-avatars.com/api/?name=Beverly+Crusher&background=2E3A59&color=fff&rounded=true',
  'william t. riker': 'https://ui-avatars.com/api/?name=William+Riker&background=2E3A59&color=fff&rounded=true',
  'nyota uhura': 'https://ui-avatars.com/api/?name=Nyota+Uhura&background=2E3A59&color=fff&rounded=true',
  'quark': 'https://ui-avatars.com/api/?name=Quark&background=2E3A59&color=fff&rounded=true',
};

export async function GET() {
  // In future: fetch from Supabase bucket or table; today: return fallbacks
  const crew = Object.entries(FALLBACKS).map(([k, v]) => ({ name: k, url: v }));
  return NextResponse.json({ avatars: crew }, { status: 200 });
}


