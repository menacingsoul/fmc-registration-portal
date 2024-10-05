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
const sendVerificationEmail = async (email: string, pin: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your QR Code for Garba Night Celebration',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Garba Night Verification</title>
          <style>
              body { font-family: 'Arial', sans-serif; background-color: #FFF5E6; color: #333; padding: 20px; }
              .container { background-color: #ffffff; border-radius: 8px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
              .header { text-align: center; margin-bottom: 20px; }
              .header img { max-width: 100%; height: auto; border-radius: 8px; }
              .qr { text-align: center; margin: 20px 0; }
              .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
              h1 { color: #FF6B6B; }
              p { line-height: 1.6; }
              .warning { color: #FF6B6B; font-weight: bold; font-size: 18px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://i.postimg.cc/hf5cCLzq/CHE-301-Chemical-Technology.png" alt="Navratri Celebration">
                  <h1>Garba Night Verification</h1>
              </div>
              <p>Dear ${email},</p>
              <p>Get ready to dance the night away! Here's your unique QR Code for the Garba Night Celebration:</p>
              <div class="qr">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pin}" alt="QR Code for Garba Night" />
              </div>
              <p>Please show this QR code at the venue entrance for quick and easy verification.</p>
              <p class="warning">Note: This QR code is unique to you and for one-time use only. Please do not share it with anyone.</p>
              <p>We can't wait to see you there! Prepare for an unforgettable night of music, dance, and festive spirit!</p>
              <div class="footer"><p>Film and Media Council</p></div>
          </div>
      </body>
      </html>
    `,
  };
  

  return transporter.sendMail(mailOptions);
};

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

    // Send the email
    await sendVerificationEmail(email, pin);

    return NextResponse.json({pin, message: 'Registration successful, PIN sent to email.' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
