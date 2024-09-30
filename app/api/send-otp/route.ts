import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectToDatabase } from '../../../lib/mongodb';
import Otp from '../../../models/Otp'; // Assuming you have an Otp model
import User from '../../../models/User';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  const emailRegex = /^([a-zA-Z]+)\.([a-zA-Z]+)(?:\.([a-zA-Z]+))?\.([a-zA-Z]+)(\d{2})@(itbhu\.ac\.in|iitbhu\.ac\.in)$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }

  try {
    // Connect to the database
    await connectToDatabase();

    // Check if email is already in the Otp collection (to prevent multiple OTPs)
    const existingUser = await User.findOne({ email }); 
    if (existingUser) {
      return NextResponse.json({ error: 'User already registered for the event' }, { status: 404 });
    }
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      return NextResponse.json({ error: 'OTP already sent. Please check your email.' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the OTP and email in the database (Otp schema should include email, otp, expiration time)
    await Otp.create({ email, otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // OTP expires in 10 minutes

    // Send OTP using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Example using Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        background-color: #ffffff;
                        border-radius: 8px;
                        padding: 20px;
                        max-width: 600px;
                        margin: auto;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .otp {
                        font-size: 24px;
                        font-weight: bold;
                        color: #ff5722; /* Bright color for emphasis */
                        padding: 10px;
                        background-color: #ffe0b2; /* Light background for OTP */
                        border-radius: 5px;
                        display: inline-block;
                    }
                    .footer {
                        text-align: center;
                        color: #888888; /* Light gray for footer text */
                        font-size: 12px;
                        margin-top: 30px;
                    }
                    h1 {
                        color: #333333; /* Dark color for heading */
                    }
                    p {
                        color: #555555; /* Slightly lighter color for paragraphs */
                        line-height: 1.5;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <p>Dear User,</p>
                    <p>Your OTP for email verification at Garba Night registration is:</p>
                    <div class="otp">${otp}</div>
                    <p>Please enter this code to verify your email address. It will expire in 5 minutes.</p>
                    <p>Thank you for your participation!</p>
                    <div class="footer">
                        <p>Film and Media Council</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };
    

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'OTP sent successfully', otp }); // You can omit sending OTP back in production
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
