'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { ShieldCheck } from 'lucide-react';

// Define the form data type
interface PatientSignUpFormData {
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: string; // HTML date input returns string
  medicalId: string;
  allergies?: string;
  bloodType?: string;
  email: string;
  password: string;
}

export default function PatientSignUpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PatientSignUpFormData>();

  const createPatient = api.patient.createPatient.useMutation();
  const email = watch('email'); // Watch email field for OTP generation

  // Timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && !canResendOtp) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer, canResendOtp]);

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation - you can replace with your preferred toast library
    const toastDiv = document.createElement('div');
    toastDiv.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    
    setTimeout(() => {
      document.body.removeChild(toastDiv);
    }, 3000);
  };

  const handleGenerateOtp = () => {
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address first', 'error');
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    setOtp('');
    setIsOtpVerified(false);
    setOtpTimer(60); // 60 second timer
    setCanResendOtp(false);
    
    showToast(`OTP Generated: ${otpCode} (Demo mode - use this code to verify)`, 'success');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only numbers, max 6 digits
    setOtp(value);
  };

  const handleVerifyOtp = () => {
    if (!otp) {
      showToast('Please enter the OTP', 'error');
      return;
    }

    if (otp === generatedOtp) {
      setIsOtpVerified(true);
      showToast('OTP Verified Successfully!', 'success');
    } else {
      showToast('Invalid OTP. Please try again.', 'error');
    }
  };

  const onSubmit = async (data: PatientSignUpFormData) => {
    // Check if OTP is verified
    if (!isOtpVerified) {
      showToast('Please verify your OTP before submitting', 'error');
      return;
    }

    try {
      // Validate required fields
      if (!data.firstName?.trim()) {
        throw new Error('First name is required');
      }
      if (!data.lastName?.trim()) {
        throw new Error('Last name is required');
      }
      if (!data.username?.trim()) {
        throw new Error('Username is required');
      }
      if (!data.dateOfBirth) {
        throw new Error('Date of birth is required');
      }
      if (!data.medicalId?.trim()) {
        throw new Error('Medical ID is required');
      }
      if (!data.email?.trim()) {
        throw new Error('Email is required');
      }
      if (!data.password?.trim()) {
        throw new Error('Password is required');
      }

      // Convert date string to Date object
      const dateOfBirth = new Date(data.dateOfBirth);
      if (isNaN(dateOfBirth.getTime())) {
        throw new Error('Invalid date of birth');
      }

      // Prepare the data for mutation
      const mutationData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: data.username.trim(),
        dateOfBirth,
        medicalId: data.medicalId.trim(),
        email: data.email.trim().toLowerCase(), // Normalize email
        password: data.password,
        // Only include optional fields if they have values
        ...(data.allergies?.trim() && { allergies: data.allergies.trim() }),
        ...(data.bloodType?.trim() && { bloodType: data.bloodType.trim() }),
      };

      await createPatient.mutateAsync(mutationData);
      
      // Success - redirect to sign in
      showToast('Account created successfully! Please sign in with your credentials.', 'success');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'Sign up failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
      }
      
      // Show user-friendly error message
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 px-4">
      <div className="bg-white/80 backdrop-blur-lg p-8 shadow-2xl rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">Create Patient Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { 
              id: 'firstName' as const, 
              label: 'First Name', 
              required: true,
              validation: {
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters'
                }
              }
            },
            { 
              id: 'lastName' as const, 
              label: 'Last Name', 
              required: true,
              validation: {
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Last name must be at least 2 characters'
                }
              }
            },
            { 
              id: 'username' as const, 
              label: 'Username', 
              required: true,
              validation: {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                },
                maxLength: {
                  value: 30,
                  message: 'Username must be less than 30 characters'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_-]+$/,
                  message: 'Username can only contain letters, numbers, underscores, and hyphens'
                }
              }
            },
            { 
              id: 'dateOfBirth' as const, 
              label: 'Date of Birth', 
              type: 'date', 
              required: true,
              validation: {
                required: 'Date of birth is required',
                validate: (value: string) => {
                  const date = new Date(value);
                  const today = new Date();
                  const hundredYearsAgo = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
                  
                  if (isNaN(date.getTime())) {
                    return 'Please enter a valid date';
                  }
                  if (date > today) {
                    return 'Date of birth cannot be in the future';
                  }
                  if (date < hundredYearsAgo) {
                    return 'Please enter a valid date of birth';
                  }
                  return true;
                }
              }
            },
            { 
              id: 'medicalId' as const, 
              label: 'Medical ID', 
              required: true,
              validation: {
                required: 'Medical ID is required',
                minLength: {
                  value: 1,
                  message: 'Medical ID is required'
                }
              }
            },
            { 
              id: 'allergies' as const, 
              label: 'Allergies (optional)',
              validation: {}
            },
            { 
              id: 'bloodType' as const, 
              label: 'Blood Type (optional)',
              validation: {}
            },
            {
              id: 'email' as const,
              label: 'Email',
              type: 'email',
              required: true,
              validation: {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email format',
                },
              }
            },
            {
              id: 'password' as const,
              label: 'Password',
              type: 'password',
              required: true,
              validation: {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }
            },
          ].map(({ id, label, type = 'text', required, validation }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
                {label}
              </label>
              <input
                id={id}
                type={type}
                {...register(id, validation)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                autoComplete={
                  id === 'email' ? 'email' :
                  id === 'password' ? 'new-password' :
                  id === 'firstName' ? 'given-name' :
                  id === 'lastName' ? 'family-name' :
                  id === 'username' ? 'username' :
                  'off'
                }
              />
              {errors[id] && (
                <p className="text-red-500 text-sm mt-1">{errors[id]?.message}</p>
              )}
            </div>
          ))}
          
          {/* OTP Verification Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center mb-3">
              <ShieldCheck className="text-blue-600 mr-2" size={20} />
              <h3 className="font-medium text-gray-800">Email Verification</h3>
              {isOtpVerified && (
                <span className="ml-2 text-green-600 text-sm font-medium">✓ Verified</span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleGenerateOtp}
                disabled={!canResendOtp && otpTimer > 0}
                className={`border border-blue-200 py-2 px-4 rounded-lg transition-colors ${
                  canResendOtp 
                    ? 'bg-white text-blue-600 hover:bg-blue-50' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Generate OTP'}
              </button>
              
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className={`border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isOtpVerified 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={isOtpVerified}
              />
              
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isOtpVerified || !otp || otp.length !== 6}
                className={`py-2 px-4 rounded-lg transition-colors ${
                  isOtpVerified
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
                }`}
              >
                {isOtpVerified ? 'Verified' : 'Verify OTP'}
              </button>
            </div>
            
            {generatedOtp && !isOtpVerified && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Demo Mode:</strong> Your OTP is{' '}
                  <span className="font-mono bg-white px-2 py-1 rounded border text-sm">
                    {generatedOtp}
                  </span>
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  In production, this would be sent to your email.
                </p>
              </div>
            )}

            {!email && (
              <p className="mt-2 text-xs text-gray-500">
                Please enter your email address to generate OTP
              </p>
            )}
          </div>
          
          {createPatient.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">
                {createPatient.error.message || 'Failed to create account. Please try again.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || createPatient.isPending || !isOtpVerified}
            className={`w-full py-3 rounded-lg font-medium transition ${
              (isSubmitting || createPatient.isPending || !isOtpVerified)
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting || createPatient.isPending ? 'Creating account...' : 
             !isOtpVerified ? 'Verify OTP to Continue' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm mt-6 text-gray-700">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/auth/signin')}
            className="text-blue-600 hover:underline cursor-pointer bg-none border-none p-0 font-inherit"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
