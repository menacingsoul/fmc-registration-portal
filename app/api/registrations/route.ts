import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET() {
  try {
    
    await connectToDatabase();

    
    const users = await User.find({}, 'firstName lastName rollNo email branch');

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'No registrations yet' }, { status: 400 });
    }
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Retrieval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
