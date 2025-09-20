import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/api';
import { Share, UserProfile, ApiResponse } from '../types';
import { User, Heart, ArrowLeft, LogOut } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userShares, setUserShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharesLoading, setSharesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { user: currentUser, logout } = useAuth();

  useEffect(() => {
    if (username) {
      loadUserProfile(username);
      loadUserShares(username);
    }
  }, [username]);

  const loadUserProfile = async (username: string) => {
    try {
      const profile = await userApi.getUserProfile(username);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  const loadUserShares = async (username: string, page = 0) => {
    setSharesLoading(true);
    try {
      const response: ApiResponse<Share> = await userApi.getUserShares(username, page, 20);
      setUserShares(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);
    } catch (error) {
      console.error('Failed to load user shares:', error);
    } finally {
      setSharesLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getTitleColor = (title: string) => {
    switch (title) {
      case 'Code Master':
        return 'text-yellow-600 bg-yellow-100';
      case 'Code Enthusiast':
        return 'text-blue-600 bg-blue-100';
      case 'Newbie Coder':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700">
                  Tupalle
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <User className="h-5 w-5 mr-1" />
                  {currentUser}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700">
                  Tupalle
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <User className="h-5 w-5 mr-1" />
                  {currentUser}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || 'User not found'}</p>
            <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
              ← Back to main feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700">
                Tupalle
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center text-gray-700 hover:text-primary-600"
              >
                <User className="h-5 w-5 mr-1" />
                {currentUser}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-red-600"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to main feed
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">{userProfile.username}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTitleColor(userProfile.title)}`}>
                  {userProfile.title}
                </span>
                <div className="flex items-center text-gray-600">
                  <Heart className="h-4 w-4 mr-1 text-red-500" />
                  <span>{userProfile.totalLikes} total likes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Shares */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{userProfile.username}'s Shares</h2>
          </div>
          
          <div className="p-6">
            {sharesLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {userShares.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No shares yet</p>
                    <p className="text-gray-400 mt-2">This user hasn't shared any code yet</p>
                  </div>
                ) : (
                  userShares.map((share) => (
                    <div key={share.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <Link to={`/shares/${share.id}`}>
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                              {share.title}
                            </h3>
                          </Link>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTitleColor(share.ownerTitle)}`}>
                              {share.ownerTitle}
                            </span>
                            <div className="flex items-center text-gray-600">
                              <Heart className="h-4 w-4 mr-1 text-red-500" />
                              <span>{share.likeCount} likes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {share.description && (
                        <p className="text-gray-700 mb-4">{share.description}</p>
                      )}

                      {share.imageUrls.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {share.imageUrls.map((url: string, index: number) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Share image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => loadUserShares(username!, i)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === i
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
