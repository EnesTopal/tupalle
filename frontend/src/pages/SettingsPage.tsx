import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Settings, User, Palette, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { user, changeUsername, deleteAccount, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'visual'>('account');
  
  // Account settings state
  const [newUsername, setNewUsername] = useState('');
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Visual settings state
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setIsChangingUsername(true);

    try {
      const result = await changeUsername(newUsername);
      if (result.success) {
        alert('Username changed successfully!');
        setNewUsername('');
      } else {
        setUsernameError(result.message);
      }
    } catch (error) {
      setUsernameError('Failed to change username. Please try again.');
    } finally {
      setIsChangingUsername(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);

    try {
      const result = await deleteAccount();
      if (result.success) {
        alert('Account deleted successfully. You will be logged out.');
        await logout();
        window.location.href = '/login';
      } else {
        alert(result.message || 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement theme switching
    console.log('Dark mode toggled:', !isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/"
              className="text-2xl font-bold text-primary-600 hover:text-primary-700"
            >
              Tupalle
            </Link>
            <div className="ml-6">
              <h1 className="text-xl font-semibold text-gray-700">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('account')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Account
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'visual'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Palette className="h-4 w-4 inline mr-2" />
              Visual
            </button>
          </nav>
        </div>

        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-8">
            {/* Change Username */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Username</h3>
              <p className="text-sm text-gray-600 mb-4">
                Current username: <span className="font-medium">{user}</span>
              </p>
              
              <form onSubmit={handleUsernameChange} className="space-y-4">
                <div>
                  <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 mb-1">
                    New Username
                  </label>
                  <input
                    id="newUsername"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter new username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                
                {usernameError && (
                  <div className="text-red-600 text-sm">{usernameError}</div>
                )}
                
                <button
                  type="submit"
                  disabled={isChangingUsername || !newUsername.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingUsername ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isChangingUsername ? 'Changing...' : 'Change Username'}
                </button>
              </form>
            </div>

            {/* Delete Account */}
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-400">
              <h3 className="text-lg font-medium text-red-900 mb-4">Delete Account</h3>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Visual Settings */}
        {activeTab === 'visual' && (
          <div className="space-y-8">
            {/* Theme Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                </div>
                
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    isDarkMode ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Account Deletion</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete your account and all associated data including:
              </p>
              <ul className="text-sm text-gray-600 mb-4 list-disc list-inside">
                <li>Your profile and settings</li>
                <li>All your shared code snippets</li>
                <li>All your likes and interactions</li>
                <li>Your authentication data</li>
              </ul>
              
              <div className="mb-4">
                <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Type "DELETE" to confirm:
                </label>
                <input
                  id="deleteConfirmation"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETE"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccountDeletion}
                  disabled={isDeletingAccount || deleteConfirmation !== 'DELETE'}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
