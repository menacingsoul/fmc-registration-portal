import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

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

    await connectToDatabase();

    const user = await User.findOne({email});


    if (!user) {
      return NextResponse.json({ error: 'User not registered' }, { status: 404 });
    }

    const userQrCode = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + user.pin;
    console.log(userQrCode);

    return NextResponse.json({ qrCode: userQrCode });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the QR code' }, { status: 500 });
  }
}

