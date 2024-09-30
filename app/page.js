'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState(1); // Manage the current step in the registration process
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [otp, setOtp] = useState(''); // State to store the entered OTP
  const [error, setError] = useState('');
  const [pin, setPin] = useState(''); // Store the generated pin after registration
  const[loading, setLoading] = useState(false);


  // Handle sending OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
  

      if (response.ok) {
        setStep(2);
        setLoading(false);
         // Move to the next step (OTP Verification)
      } else {
        setLoading(false);
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      setLoading(false);
      setError('An error occurred while sending the OTP');
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        setStep(3); // Move to the final registration step
      } else {
        setLoading(false);
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      setError('An error occurred during OTP verification');
    }
  };

  // Handle final registration with Roll Number
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setPin('');
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, rollNo }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        setPin(data.pin);
      } else {
        setLoading(false);
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      setLoading(false);
      setError('An error occurred during registration');
    }
  };

  if(loading){
    return <div className="min-h-screen flex items-center justify-center animate-spin"><Loader size={28}/></div>
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        
        <Image src="/logo.png" alt="FMC Logo" width={100} height={100} className="mx-auto" />
        <h1 className="text-2xl font-bold mb-6 text-center">Garba Night Registration</h1>

        {/* Step 1: Email Input and Send OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                placeholder="Use institute Email Id ONLY"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send OTP
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="6-digit OTP"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Verify OTP
            </button>
          </form>
        )}

        {/* Step 3: Registration with Roll Number */}
        {!pin&&step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
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

        {/* Display PIN after Registration */}
        {pin && (
          <div className="mt-4 p-4 bg-green-100 rounded-md">
            <p className="text-green-800 text-center font-bold">Email: {email}</p>
            <p className="text-green-800 text-center font-bold">Your PIN: {pin}</p>
            <p className="text-sm text-green-700 text-center mt-2">
              You can screenshot this PIN for verification.
            </p>
            <p className='text-center text-xs mt-2 font-semibold'>This PIN was also sent to your registered Email.</p>
          </div>
        )}
      </div>
    </div>
  );
}
