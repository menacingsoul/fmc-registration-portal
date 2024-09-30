import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import User from '../../../models/User'

export async function POST(req: Request) {
    try {
      let { email, rollNo } = await req.json()
  
      // Validate email format
      const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+\.[a-z]+\d{2}@(itbhu\.ac\.in|iitbhu\.ac\.in)$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
  
      // Parse email
      const [namePart, domainPart] = email.split('@')
      const [firstName, lastName, branchAndYear] = namePart.split('.')
      const branch = branchAndYear.slice(0, -2)
      const year = '20' + branchAndYear.slice(-2)

      email = `${namePart}@iitbhu.ac.in`

  
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