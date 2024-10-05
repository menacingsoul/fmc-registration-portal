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
    return <div className="min-h-screen flex items-center justify-center animate-spin"><Loader size={28}/></div>
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <Image src="/logo.png" alt="FMC Logo" width={100} height={100} className="mx-auto" />
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
          <div className="mt-4 p-4 bg-green-100 rounded-md">
            <div className="flex justify-center mt-4">
              <Image src={qrCode} alt="QR Code" width={200} height={200} />
            </div>
            <p className="text-sm text-green-700 text-center mt-2">
              This is your QR code for verification at the Venue
            </p>
          </div>
        )}

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}