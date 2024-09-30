import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import User from '../../../models/User'

export async function POST(req: Request) {
  try {
    const { pin } = await req.json()

    await connectToDatabase()

    const user = await User.findOneAndUpdate({ pin }, { isVerified: true }, { new: true })

    if (!user) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Confirmation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}