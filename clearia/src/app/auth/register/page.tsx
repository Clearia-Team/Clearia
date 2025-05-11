'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';

export default function PatientSignUpPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const createPatient = api.patient.createPatient.useMutation();

  const onSubmit = async (data: any) => {
    try {
      await createPatient.mutateAsync({
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
      });
      router.push('/auth/signin');
    } catch (error: any) {
      alert(error?.message || 'Sign up failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 px-4">
      <div className="bg-white/80 backdrop-blur-lg p-8 shadow-2xl rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">Create Patient Account</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { id: 'firstName', label: 'First Name', required: true },
            { id: 'lastName', label: 'Last Name', required: true },
            { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
            { id: 'medicalId', label: 'Medical ID', required: true },
            { id: 'allergies', label: 'Allergies (optional)' },
            { id: 'bloodType', label: 'Blood Type (optional)' },
            {
              id: 'email',
              label: 'Email',
              type: 'email',
              required: true,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format',
              },
            },
            {
              id: 'password',
              label: 'Password',
              type: 'password',
              required: true,
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            },
          ].map(({ id, label, type = 'text', required, ...rest }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
                {label}
              </label>
              <input
                id={id}
                type={type}
                {...register(id, {
                  required: required ? `${label} is required` : false,
                  ...rest,
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {errors[id] && (
                <p className="text-red-500 text-sm">{(errors as any)[id]?.message}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-700">
          Already have an account?{' '}
          <span
            onClick={() => router.push('/auth/signin')}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

