import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email || !email.endsWith('@itbhu.ac.in')) {
      return NextResponse.json({ error: 'Only @itbhu.ac.in email addresses are allowed' }, { status: 403 });
    }

    // At this point, the token is valid and the email is from the correct domain
    return NextResponse.json({ email });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}