'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Home() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleGoogleLogin = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.email.endsWith('@itbhu.ac.in')) {
          setEmail(data.email);
          setStep(2); // Move to the registration step
        } else {
          setError('Please use an @itbhu.ac.in email address.');
        }
      } else {
        setError(data.error || 'An error occurred during Google authentication');
      }
    } catch (error) {
      setError('An error occurred during Google authentication');
    } finally {
      setLoading(false);
    }
  };

  // Handle final registration with Roll Number
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setPin('');
    setQrCodeUrl('');
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, rollNo }),
      });

      const data = await response.json();

      if (response.ok) {
        setPin(data.pin);
        // Generate QR code
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data.pin}`;
        setQrCodeUrl(qrApiUrl);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center animate-spin"><Loader size={28}/></div>
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <Image src="/logo.png" alt="FMC Logo" width={100} height={100} className="mx-auto" />
        <h1 className="text-2xl font-bold mb-6 text-center">Garba Night Registration</h1>

        {/* Step 1: Google Login */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-4">
              Please sign in with your @itbhu.ac.in Google account to proceed.
            </p>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError('Login Failed')}
            />
          </div>
        )}

        {/* Step 2: Registration with Roll Number */}
        {step === 2 && !qrCodeUrl && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
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
              Complete Registration
            </button>
          </form>
        )}

        {/* Display Error Message */}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

        {/* Display QR Code after Registration */}
        {qrCodeUrl && (
          <div className="mt-4 p-4 bg-green-100 rounded-md">
            <p className="text-green-800 text-center font-bold">Email: {email}</p>
            <div className="flex justify-center mt-4">
              <Image src={qrCodeUrl} alt="QR Code" width={200} height={200} />
            </div>
            <p className="text-sm text-red-700 font-bold text-center mt-2">
          KINDLY SCREENSHOT THIS QR CODE AND SHOW IT AT THE VENUE
            </p>
           
          </div>
        )}
      </div>
    </div>
  );
}