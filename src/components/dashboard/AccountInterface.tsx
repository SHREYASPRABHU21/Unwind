'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AccountInterface() {
  const [user] = useAuthState(auth);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const updateUserProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateProfile(user, {
        displayName: name
      });
      
      // Update in Supabase
      await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          name,
          email
        })
      });
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    
    try {
      // Delete user data from Supabase first
      await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      
      // Delete Firebase account
      await user.delete();
      router.push('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      alert('Failed to delete account');
    }
  };

  return (
    <div className="h-full p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h3>
      
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <button
              onClick={updateUserProfile}
              disabled={isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Privacy & Data</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Data Export</p>
                <p className="text-sm text-gray-500">Download all your data</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                Export Data
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Session History</p>
                <p className="text-sm text-gray-500">Clear all session data</p>
              </div>
              <button className="text-red-500 hover:text-red-700 text-sm font-medium">
                Clear History
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h4>
          
          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Sign Out
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your data, including sessions, journals, and bookmarks will be permanently deleted.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
