import { NextResponse } from 'next/server'

const VERIFIER_PIN = process.env.VERIFIER_PIN || '123456' // Set a secure PIN in your .env file

export async function POST(req: Request) {
  try {
    const { entryPin } = await req.json()

    if (entryPin === VERIFIER_PIN) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Invalid entry PIN' }, { status: 401 })
    }
  } catch (error) {
    console.error('Verifier entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}