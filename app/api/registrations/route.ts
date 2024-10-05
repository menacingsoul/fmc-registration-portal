import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET() {
  try {
    // Establish a database connection
    await connectToDatabase();

    // Fetch all users with all their data
    const users = await User.find();

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'No registrations yet' }, { status: 400 });
    }

    // Return all users
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Retrieval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
