'use client';
import { useEffect, useState, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { CheckCircle, X } from 'lucide-react';
import Image from 'next/image';

const Spinner = () => (
  <div className="w-5 h-5 border-4 border-blue-400 border-solid border-t-transparent rounded-full animate-spin"></div>
);

export default function VerifierDashboard() {
  const [entryPin, setEntryPin] = useState('');
  const [isVerifierAuthenticated, setIsVerifierAuthenticated] = useState(false);
  const [userPin, setUserPin] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [users, setUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchRollNo, setSearchRollNo] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef(null); // Reference to the video element

  // Function to initialize the QR scanner
  const initializeQrScanner = () => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(videoRef.current, (result) => {
        setUserPin(result.data); // Set the user pin from the QR code
        setIsScanning(false); // Stop scanning after retrieving the PIN
      });
      qrScanner.start();
      setIsScanning(true);
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/verifier-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryPin }),
      });

      if (response.ok) {
        setIsVerifierAuthenticated(true);
        setEntryPin('');
      } else {
        setError('Invalid entry PIN');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setVerificationResult(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: userPin }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationResult(data);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmVerification = async () => {
    setIsConfirming(true);
    setError('');

    try {
      const response = await fetch('/api/confirm-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: userPin }),
      });

      if (response.ok) {
        setVerificationResult((prev) => ({ ...prev, isVerified: true }));
      } else {
        setError('Failed to confirm verification');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleVerifyAnother = () => {
    setUserPin('');
    setVerificationResult(null);
    setError('');
  };

  const fetchAllUsers = async () => {
    setIsFetchingUsers(true);
    setError('');
    try {
      const response = await fetch('/api/registrations');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
      setIsModalOpen(true);
    } catch (err) {
      setError('An error occurred while fetching users.');
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.rollNo.toLowerCase().includes(searchRollNo.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <Image src="/logo.png" alt="FMC Logo" width={100} height={100} className="mx-auto" />
        <h1 className="text-2xl font-bold mb-6 text-center">Verifier Dashboard</h1>
        {!isVerifierAuthenticated ? (
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <div>
              <label htmlFor="entryPin" className="block text-sm font-medium text-gray-700">
                Enter Verifier PIN
              </label>
              <input
                type="password"
                id="entryPin"
                value={entryPin}
                onChange={(e) => setEntryPin(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? <Spinner /> : 'Enter Verifier Dashboard'}
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="userPin" className="block text-sm font-medium text-gray-700">
                  User PIN (scanned from QR code)
                </label>
                <input
                  type="number"
                  id="userPin"
                  value={userPin}
                  onChange={(e) => setUserPin(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? <Spinner /> : 'Verify'}
              </button>
            </form>

            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Scan QR Code to Retrieve PIN:</h2>
              <video ref={videoRef} className="w-full rounded-md border-2 border-gray-300 mb-4" />
              {!isScanning ? (
                <button
                  onClick={initializeQrScanner}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Start QR Scan
                </button>
              ) : (
                <Spinner />
              )}
            </div>

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
            {verificationResult && (
              <div className="mt-4 p-4 bg-green-100 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Verification Result:</h2>
                <p>Name: {verificationResult.firstName} {verificationResult.lastName}</p>
                <p>Roll No: {verificationResult.rollNo}</p>
                <p>Branch: {verificationResult.branch}</p>
                <p>Year of Admission: {verificationResult.yearOfAdmission}</p>
                <div className="flex items-center mt-2">
                  <p className="mr-2">Verified:</p>
                  {verificationResult.isVerified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <span>No</span>
                  )}
                </div>
                {!verificationResult.isVerified && (
                  <button
                    onClick={handleConfirmVerification}
                    className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {isConfirming ? <Spinner /> : 'Confirm Verification'}
                  </button>
                )}
                <button
                  onClick={handleVerifyAnother}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Verify Another User
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
