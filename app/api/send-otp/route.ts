import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectToDatabase } from "../../../lib/mongodb";
import Otp from "../../../models/Otp";
import User from "../../../models/User";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email format
    const emailRegex =
      /^([a-zA-Z]+)\.([a-zA-Z]+)(?:\.([a-zA-Z]+))?\.([a-zA-Z]+)(\d{2})@(itbhu\.ac\.in|iitbhu\.ac\.in)$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if the number of users has reached the limit
    const userCount = await User.countDocuments();
    if (userCount >= 975) {
      return NextResponse.json(
        { error: "Event Full. No more registrations are allowed." },
        { status: 400 }
      );
    }

    const itbhuEmail = email.split("@")[0] + "@itbhu.ac.in";
    console.log(itbhuEmail);
    const iitbhuEmail = email.split("@")[0] + "@iitbhu.ac.in";
    console.log(iitbhuEmail);

    const existingUser1 = await User.findOne({ email: iitbhuEmail });
    const existingUser2 = await User.findOne({ email: itbhuEmail });

    console.log(existingUser1);
    console.log(existingUser2);

    if (existingUser1 || existingUser2) {
      return NextResponse.json(
        { error: "User already registered for the event" },
        { status: 404 }
      );
    }

    // Delete any previous OTPs for the same email
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      await existingOtp.deleteOne();
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the OTP and email in the database (OTP expires in 10 minutes)
    await Otp.create({ email, otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Create the email template
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code for Garba Night Registration",
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
                    font-size: 28px;
                    font-weight: bold;
                    color: #e91e63;
                    padding: 15px;
                    background-color: #ffe0e0;
                    border-radius: 8px;
                    display: inline-block;
                }
                .footer {
                    text-align: center;
                    color: #888888;
                    font-size: 12px;
                    margin-top: 30px;
                }
                h1 {
                    color: #333333;
                }
                p {
                    color: #555555;
                    line-height: 1.5;
                }
                .highlight {
                    color: #e91e63;
                    font-weight: bold;
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
                <p>Please enter this code to verify your email address. The OTP is valid for <span class="highlight">5 minutes</span>.</p>
                <p>Thank you for your participation and looking forward to seeing you at the event!</p>
                <div class="footer">
                    <p>Film and Media Council</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return a success response
    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
