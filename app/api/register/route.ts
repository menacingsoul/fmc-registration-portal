import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import nodemailer from 'nodemailer';
import User from '../../../models/User';

interface UserInfo {
  email: string;
  rollNo: string;
}

interface ParsedEmail {
  firstName: string;
  lastName: string;
  branch: string;
  year: string;
}


const parseIITBHUEmail = (email: string): ParsedEmail => {
  const [namePart] = email.split('@');
  const nameParts = namePart.split('.');

  const firstName = nameParts[0].toUpperCase();
  const lastName = nameParts[1].toUpperCase();

  let branch = '';
  let year = '';

  // Determine branch and year based on the nameParts length
  if (nameParts.length === 4) {
    branch = nameParts[3].slice(0, -2); //  e.g., cd.cse23 => "cse"
    year = '20' + nameParts[3].slice(-2); // Extract year as "23" => "2023"
  } else if (nameParts.length === 3) {
    branch = nameParts[2].slice(0, -2); // Last component is branch, e.g., cse23 => "cse"
    year = '20' + nameParts[2].slice(-2);
  }

  return { firstName, lastName, branch, year };
};

// Helper function to send email


// API handler
export async function POST(req: Request) {
  try {
    const { email, rollNo }: UserInfo = await req.json();

    // Parse email to extract user details
    const { firstName, lastName, branch, year } = parseIITBHUEmail(email);

    // Connect to the database
    await connectToDatabase();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already registered' }, { status: 400 });
    }

    const userCount = await User.countDocuments();
    if (userCount >= 975) {
      return NextResponse.json(
        { error: "Event Full. No more registrations are allowed." },
        { status: 400 }
      );
    }

    // Generate unique 8-digit PIN
    const pin = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Create a new user entry
    const newUser = new User({
      email,
      firstName,
      lastName,
      branch,
      yearOfAdmission: year,
      rollNo,
      pin,
      isVerified: false,
    });

    await newUser.save();

    return NextResponse.json({pin, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
