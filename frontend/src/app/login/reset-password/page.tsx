'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

import { resetPassword } from '../../../networks/auth_networks';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [new_password, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      console.error('Token is missing');
      alert('Token is missing');
    }
  }, [token]);

  const handleResetPassword = () => {
    if (!new_password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (new_password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    toast.promise(resetPassword({ token, new_password }), {
        loading: 'Resetting password...',
        success: 'Password reset successfully',
        error: 'Failed to reset password',
    });
    router.push('/login');
  };

  return (
    
    <div className="flex items-center justify-center min-h-screen bg-white">
        <Toaster position="top-center" reverseOrder={false} />
      <div className="relative bg-blue-50 rounded-lg shadow-lg p-10 w-full max-w-md">
        <h2 className="text-center text-xl font-semibold text-orange-500 mb-6">Reset Password</h2>
        <div >
          <div className="mb-4">
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              value={new_password}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <button
            onClick={handleResetPassword}
            className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
