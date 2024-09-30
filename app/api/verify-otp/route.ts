import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Otp from '../../../models/Otp';

export async function POST(request: Request) {
  // Parse the incoming request body
  let { email, otp } = await request.json();

  otp = otp.toString();

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Check if OTP exists for the given email
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return NextResponse.json({ error: 'OTP not found. Please request a new one.' }, { status: 404 });
    }

    // Check if the OTP matches and is not expired
 
    const isOtpValid = otpRecord.otp.toString() === otp.toString();

    if (!isOtpValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please request a new one.' }, { status: 400 });
    }

    // If OTP is valid, delete the record from the OTP collection
    await Otp.deleteOne({ email });

    // Return a success message
    return NextResponse.json({ message: 'OTP verified successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
