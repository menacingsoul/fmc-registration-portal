'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function VerifierDashboard() {
  const [pin, setPin] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  const [error, setError] = useState('')
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    router.push('/verifier/login')
    return null
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setVerificationResult(null)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationResult(data)
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch (error) {
      setError('An error occurred')
    }
  }

  const handleConfirmVerification = async () => {
    try {
      const response = await fetch('/api/confirm-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (response.ok) {
        setVerificationResult((prev) => ({ ...prev, isVerified: true }))
      } else {
        setError('Failed to confirm verification')
      }
    } catch (error) {
      setError('An error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Verifier Dashboard</h1>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
              Enter 6-digit PIN
            </label>
            <input
              type="text"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              pattern="\d{6}"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Verify
          </button>
        </form>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        {verificationResult && (
          <div className="mt-4 p-4 bg-green-100 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Verification Result:</h2>
            <p>Name: {verificationResult.firstName} {verificationResult.lastName}</p>
            <p>Roll No: {verificationResult.rollNo}</p>
            <p>Branch: {verificationResult.branch}</p>
            <p>Year of Admission: {verificationResult.yearOfAdmission}</p>
            <p>Verified: {verificationResult.isVerified ? 'Yes' : 'No'}</p>
            {!verificationResult.isVerified && (
              <button
                onClick={handleConfirmVerification}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Confirm Verification
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}