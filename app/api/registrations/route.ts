import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
   
    await connectToDatabase();

    // Fetch all users with all their data
    const users = await User.find();

    if (!users || users.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'No registrations yet' }), {
        status: 400,
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    
    return new NextResponse(JSON.stringify({ users }), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error('Retrieval error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
