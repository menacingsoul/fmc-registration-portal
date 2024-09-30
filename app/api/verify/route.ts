import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import User from '../../../models/User'

export async function POST(req: Request) {
  try {
    const { pin } = await req.json()

    await connectToDatabase()

    const user = await User.findOne({ pin })

    if (!user) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 })
    }

    return NextResponse.json({
      firstName: user.firstName,
      lastName: user.lastName,
      rollNo: user.rollNo,
      branch: user.branch,
      yearOfAdmission: user.yearOfAdmission,
      isVerified: user.isVerified,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}