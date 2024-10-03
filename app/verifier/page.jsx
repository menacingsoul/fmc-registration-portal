'use client';
import { useState, useRef, useEffect } from 'react';
import { CheckCircle, X, Camera } from 'lucide-react';
import Image from 'next/image';
import QrScanner from 'qr-scanner';

const Spinner = () => (
  <div className="w-5 h-5 border-4 border-blue-400 border-solid border-t-transparent rounded-full animate-spin"></div>
);

export default function VerifierDashboard() {
  const [isVerifierAuthenticated, setIsVerifierAuthenticated] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
      }
    };
  }, []);

  const handleVerifierAuthentication = async (entryPin) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/verifier-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryPin }),
      });

      if (response.ok) {
        setIsVerifierAuthenticated(true);
      } else {
        setError('Invalid verifier PIN');
      }
    } catch (error) {
      setError('An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (pin) => {
    setIsLoading(true);
    setError('');
    setVerificationResult(null);

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
      setError('An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = () => {
    if (!videoRef.current) {
      setError('Camera not ready. Please try again.');
      return;
    }
  
    setIsScanning(true);
    setError('');
    setVerificationResult(null);
  
    qrScannerRef.current = new QrScanner(
      videoRef.current,
      (result) => {
        stopScanning();
        handleVerify(result.data);
      },
      { returnDetailedScanResult: true }
    );
  
    qrScannerRef.current
      .start()
      .then(() => console.log('QR scanner started'))
      .catch((err) => {
        setError('Error starting camera. Please check permissions and try again.');
        setIsScanning(false);
      });
  };
  
  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleVerifyAnother = () => {
    setVerificationResult(null);
    setError('');
    startScanning();
  };

  if (!isVerifierAuthenticated) {
    return (
      <VerifierLogin
        onLogin={handleVerifierAuthentication}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <Image src="/logo.png" alt="FMC Logo" width={100} height={100} className="mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-6 text-center">Verifier Dashboard</h1>
        
        {!isScanning && !verificationResult && !isLoading && (
          <button
            onClick={startScanning}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Camera className="mr-2" /> Scan QR Code
          </button>
        )}

        {isScanning && (
          <div className="mt-4">
            <video ref={videoRef} className="w-full rounded-md" />
            <button
              onClick={stopScanning}
              className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Stop Scanning
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center">
            <Spinner />
            <span className="ml-2">Verifying...</span>
          </div>
        )}

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

        {verificationResult && (
          <div className="mt-4 p-4 bg-green-100 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Verification Result:</h2>
            <p>Name: {verificationResult.firstName} {verificationResult.lastName}</p>
            <p>Roll No: {verificationResult.rollNo}</p>
            <p>Branch: {verificationResult.branch}</p>
            <p>Year of Admission: {verificationResult.yearOfAdmission}</p>
            <div className="flex items-center mt-2">
              <CheckCircle className="w-5 h-5 mr-1 text-green-600" />
              <span className="text-green-600 font-semibold">Verified</span>
            </div>
            <button
              onClick={handleVerifyAnother}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Verify Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VerifierLogin({ onLogin, isLoading, error }) {
  const [entryPin, setEntryPin] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(entryPin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <Image src="/logo.png" alt="FMC Logo" width={100} height={100} className="mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-6 text-center">Verifier Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : 'Login'}
          </button>
        </form>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}