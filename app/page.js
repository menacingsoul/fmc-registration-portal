'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPin('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, rollNo }),
      })

      const data = await response.json()

      if (response.ok) {
        setPin(data.pin)
      } else {
        setError(data.error || 'An error occurred')
      }
    } catch (error) {
      setError('An error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">IIT BHU Verification</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="firstname.lastname.branch+year@itbhu.ac.in"
            />
          </div>
          <div>
            <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700">
              Roll Number
            </label>
            <input
              type="text"
              id="rollNo"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Register
          </button>
        </form>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        {pin && (
          <div className="mt-4 p-4 bg-green-100 rounded-md">
            <p className="text-green-800 text-center font-bold">Your PIN: {pin}</p>
            <p className="text-sm text-green-700 text-center mt-2">
              Please screenshot this PIN for verification.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}