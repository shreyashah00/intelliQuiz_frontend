'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../utils/api';

function VerifyOTPPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value.slice(-1);
    setOTP(newOTP);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOTP = pastedData.split('');
    setOTP([...newOTP, ...Array(6 - newOTP.length).fill('')]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP({ Email: email, OTP: otpValue });
      if (response.data.success) {
        setSuccess('Email verified successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.resendOTP({ Email: email });
      if (response.data.success) {
        setSuccess('New OTP sent to your email');
        setOTP(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-gray-200/50 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Verify Your Email
              </h1>
              <p className="text-gray-600">
                We've sent a 6-digit code to<br />
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-16 text-center text-2xl font-bold bg-gray-50/80 backdrop-blur-xl border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="text-center space-y-2">
            <p className="text-gray-600 text-sm">Didn't receive the code?</p>
            <button
              onClick={handleResendOTP}
              disabled={resending}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm disabled:opacity-50 transition-colors"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Check your email (including spam folder) for the verification code
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"><div className="text-white">Loading...</div></div>}>
      <VerifyOTPPageContent />
    </Suspense>
  );
}
