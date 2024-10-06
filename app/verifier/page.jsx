'use client';

import { useEffect, useState, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { CheckCircle, X, Camera } from 'lucide-react';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import { set } from 'mongoose';

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
  const [count, setCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchRollNo, setSearchRollNo] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);


  const initializeQrScanner = async () => {
    if (videoRef.current) {
      try {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            setUserPin(result.data);
            setIsScanning(false);
            scannerRef.current.stop();
            handleVerify(result.data);
          },
          { returnDetailedScanResult: true }
        );
        await scannerRef.current.start();
        setIsScanning(true);
      } catch (error) {
        console.error('Failed to initialize QR scanner:', error);
        setError('Failed to start camera. Please check permissions and try again.');
      }
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setIsScanning(false);
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

  const handleVerify = async (pin) => {
    setError('');
    setVerificationResult(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
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
    initializeQrScanner();
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
  
  const fetchVerifiedCount = async () => {
    setIsCounting(true);
    setError('');
    try {
      const response = await fetch('/api/get-verified-count');
      if (!response.ok) {
        throw new Error('Failed to fetch verified users count');
      }
      const data = await response.json();
      setCount(data.verifiedCount);
      console.log(count);
    } catch (err) {
      setError('An error occurred while getting count.');
    } finally {
      setIsCounting(false);
    }
  }

  const filteredUsers = users.filter((user) =>
    user.rollNo.toLowerCase().includes(searchRollNo.toLowerCase())
  );

  useEffect(() => {
    if (isVerifierAuthenticated && !isScanning && !verificationResult) {
      initializeQrScanner();
    }
  }, [isVerifierAuthenticated, isScanning, verificationResult]);

  const handleExportToExcel = () => {
    if (users.length === 0) {
      alert('No users to export.');
      return;
    }

    const formattedData = users.map((user) => ({
      'Roll No': user.rollNo,
      'Name': user.firstName +" "+ user.lastName,
      'Email': user.email,
      'Branch': user.branch,

    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered Users');
    XLSX.writeFile(workbook, 'registered_users.xlsx');
  };

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
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Scan QR Code:</h2>
              <div className="relative">
                <video ref={videoRef} className="w-full rounded-md border-2 border-gray-300" />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                    Scanning...
                  </div>
                )}
              </div>
              {!isScanning ? (
                <button
                  onClick={initializeQrScanner}
                  className="mt-2 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Camera className="mr-2" /> Start QR Scan
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Stop Scanning
                </button>
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
            
            <button
              onClick={fetchAllUsers}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isFetchingUsers ? <Spinner /> : 'Get All Registered Users'}
            </button>
            <button
              onClick={fetchVerifiedCount}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isCounting ? <Spinner /> : 'Count Verified Users'}
            </button>
            {count >=0 && (
              <p className="mt-4 text-center text-black text-sm">Verified Users: {count}</p>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white w-4/5 max-w-3xl p-6 rounded-lg shadow-lg relative">
          <button
              onClick={handleExportToExcel}
              className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Export to Excel
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              Registered Users: {users.length}
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={searchRollNo}
                onChange={(e) => setSearchRollNo(e.target.value)}
                placeholder="Search by Roll No."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="h-64 overflow-y-scroll border rounded-md p-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <div key={index} className="p-2 border-b last:border-b-0">
                    <p>{index + 1}. {user.firstName} {user.lastName}</p>
                    <p>Roll No: {user.rollNo}</p>
                    <p>Email : {user.email}</p>
                    <p>Branch: {user.branch}</p>
                  </div>
                ))
              ) : (
                <p className="text-center">No users found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}