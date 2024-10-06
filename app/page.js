'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { Loader } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const router = useRouter();

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

  const handleRetrieveClick = async () => {
    router.push('/retrieve');
  };

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center space-x-4 animate-pulse">
          <Loader size={64} className="text-blue-600 animate-spin" />
          <span className="text-2xl font-bold text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-r from-blue-200 via-white to-green-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <Image src="/logo.png" alt="FMC Logo" width={100} height={100} className="mx-auto" />
        <h1 className="text-2xl font-bold mb-6 text-center">{process.env.NEXT_PUBLIC_EVENT_NAME} Registration</h1>
        
        {step === 1 && (
          <>
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600 text-center mb-4">
                Please sign in with your @itbhu.ac.in Google account to proceed.
              </p>
              <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setError('Login Failed')} />
            </div>
            <p className="text-center mt-2">OR</p>
            <div>
              <button className="bg-slate-500 text-white p-2 w-full rounded-md mt-4" onClick={handleRetrieveClick}>
                Retrieve Your QR Code
              </button>
            </div>
          </>
        )}

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

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

        {qrCodeUrl && (
          <div className="ticket bg-gradient-to-r from-purple-200 via-white to-yellow-200 border border-dashed border-gray-400 p-4 rounded-lg mt-8 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">🎟️ Event Pass</h2>
                <p className="text-lg font-medium text-gray-700">{process.env.NEXT_PUBLIC_EVENT_NAME}</p>
              </div>
              <Image src="/logo.png" alt="Event Logo" width={50} height={50} />
            </div>
            <div className="text-sm font-medium text-gray-700 mb-4">
              <p>Time: <span className="text-gray-800 font-semibold">{process.env.NEXT_PUBLIC_EVENT_TIME}</span></p>
              <p>Date: <span className="text-gray-800 font-semibold">{process.env.NEXT_PUBLIC_EVENT_DATE}</span></p>
              <p>Venue: <span className="text-gray-800 font-semibold">{process.env.NEXT_PUBLIC_EVENT_VENUE}</span></p>
            </div>
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="QR Code" className=" w-44 h-44" />
            </div>
            <p className="text-red-600 font-bold text-center mt-4">KINDLY SCREENSHOT THIS QR CODE AND SHOW IT AT THE VENUE</p>
          </div>
        )}
      </div>
    </div>
  );
}
