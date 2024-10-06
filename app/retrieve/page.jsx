'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { GoogleLogin } from '@react-oauth/google';
import { Loader } from 'lucide-react';

export default function RetrieveQRCode() {
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/get-qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
      } else {
        setError(data.error || 'An error occurred while fetching the QR code');
      }
    } catch (error) {
      setError('An error occurred during QR code retrieval');
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
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <img src="/logo.png" alt="FMC Logo" width="100" height="100" className="mx-auto" />
        <h1 className="text-2xl font-bold mb-6 text-center">Retrieve Your QR Code</h1>

        {!qrCode && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-4">
              Please sign in with your @itbhu.ac.in Google account to retrieve your QR code.
            </p>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError('Login Failed')}
            />
          </div>
        )}
       

        {qrCode && (
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
            <img src={qrCode} alt="QR Code" className=" w-44 h-44" />
          </div>
          <p className="text-red-600 font-bold text-center mt-4">KINDLY SCREENSHOT THIS QR CODE AND SHOW IT AT THE VENUE</p>
        </div>
        )}

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}