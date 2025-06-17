'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '~/trpc/react';

export default function AdminMedicalIdGenerator() {
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [showCopied, setShowCopied] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      count: 1,
      prefix: 'MED',
      description: '',
    },
  });

  const generateMedicalIds = api.medicalId.generateMedicalIds.useMutation();
  const getAllMedicalIds = api.medicalId.getAllMedicalIds.useQuery();

  const onSubmit = async (data: any) => {
    try {
      const result = await generateMedicalIds.mutateAsync({
        count: parseInt(data.count),
        prefix: data.prefix,
        description: data.description,
      });
      setGeneratedIds(result.medicalIds);
      reset();
      // Refetch the list to show updated data
      getAllMedicalIds.refetch();
    } catch (error: any) {
      alert(error?.message || 'Failed to generate Medical IDs');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(text);
      setTimeout(() => setShowCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyAllIds = async () => {
    const allIds = generatedIds.join('\n');
    await copyToClipboard(allIds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-indigo-700 text-center mb-8">
            Medical ID Generator - Admin Panel
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generator Form */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generate New Medical IDs</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="count" className="block text-sm font-semibold text-gray-700">
                    Number of IDs to Generate
                  </label>
                  <input
                    id="count"
                    type="number"
                    min="1"
                    max="50"
                    {...register('count', {
                      required: 'Count is required',
                      min: { value: 1, message: 'Minimum 1 ID' },
                      max: { value: 50, message: 'Maximum 50 IDs per batch' },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  {errors.count && (
                    <p className="text-red-500 text-sm">{errors.count.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="prefix" className="block text-sm font-semibold text-gray-700">
                    ID Prefix
                  </label>
                  <input
                    id="prefix"
                    type="text"
                    maxLength={5}
                    {...register('prefix', {
                      required: 'Prefix is required',
                      maxLength: { value: 5, message: 'Prefix must be 5 characters or less' },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="e.g., MED, PAT, ICU"
                  />
                  {errors.prefix && (
                    <p className="text-red-500 text-sm">{errors.prefix.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="Purpose or notes for this batch of IDs"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? 'Generating...' : 'Generate Medical IDs'}
                </button>
              </form>
            </div>

            {/* Generated IDs Display */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recently Generated IDs</h2>
              
              {generatedIds.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {generatedIds.length} ID{generatedIds.length > 1 ? 's' : ''} generated
                    </span>
                    <button
                      onClick={copyAllIds}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                    >
                      Copy All
                    </button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-3">
                    {generatedIds.map((id, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded group"
                      >
                        <code className="font-mono text-sm text-gray-800">{id}</code>
                        <button
                          onClick={() => copyToClipboard(id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          {showCopied === id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No IDs generated yet. Use the form to generate new Medical IDs.
                </div>
              )}
            </div>
          </div>

          {/* Existing Medical IDs List */}
          <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Medical IDs Status</h2>
            
            {getAllMedicalIds.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : getAllMedicalIds.data ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Medical ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Created</th>
                      <th className="text-left py-3 px-4 font-semibold">Used By</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAllMedicalIds.data.map((medicalId: any) => (
                      <tr key={medicalId.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs">{medicalId.medicalId}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              medicalId.isUsed
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {medicalId.isUsed ? 'Used' : 'Available'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(medicalId.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {medicalId.patientId ? `Patient: ${medicalId.patientId.slice(0, 8)}...` : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {medicalId.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No Medical IDs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
