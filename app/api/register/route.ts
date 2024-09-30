import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import User from '../../../models/User'

export async function POST(req: Request) {
    try {
      let { email, rollNo } = await req.json()
  
      // Validate email format
      const [namePart, domainPart] = email.split('@');
      const nameParts = namePart.split('.');
      let firstName = nameParts[0].toUpperCase();
      let lastName = nameParts[1].toUpperCase();
      let branch = '';
      let year = '';
      
      // Check if there is an optional component
      if (nameParts.length === 4) {
        // Case: email of type "first.last.cd.branchXX@domain"
        branch = nameParts[3].slice(0,-2); // Third part (cd) is treated as the branch
        year = '20' + nameParts[3].slice(-2); // Year is from the fourth part
      } else if (nameParts.length === 3) {
        // Case: email of type "first.last.branchXX@domain"
        branch = nameParts[2].slice(0, -2); // Last part is the branch
        year = '20' + nameParts[2].slice(-2); // Year is the last two digits
      }
      

  
      // Generate unique 8-digit PIN
      const pin = Math.floor(10000000 + Math.random() * 90000000).toString()
  
      await connectToDatabase()
  
      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json({ error: 'User already registered' }, { status: 400 })
      }
  
      // Create new user
      const newUser = new User({
        email,
        firstName,
        lastName,
        branch,
        yearOfAdmission: year,
        rollNo,
        pin,
        isVerified: false,
      })
  
      await newUser.save()
  
      return NextResponse.json({ pin })
    } catch (error) {
      console.error('Registration error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }