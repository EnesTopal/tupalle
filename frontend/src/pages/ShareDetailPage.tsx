import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { shareApi } from '../services/api';
import { Share } from '../types';
import { Heart, User, LogOut, ArrowLeft, FileText } from 'lucide-react';

const ShareDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [share, setShare] = useState<Share | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    if (id) {
      loadShare(id);
    }
  }, [id]);

  const loadShare = async (shareId: string) => {
    setLoading(true);
    setError(null);
    try {
      const shareData = await shareApi.getShare(shareId);
      setShare(shareData);
    } catch (error) {
      console.error('Failed to load share:', error);
      setError('Failed to load share details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!share) return;
    
    try {
      if (share.isLiked) {
        await shareApi.unlikeShare(share.id);
      } else {
        await shareApi.likeShare(share.id);
      }
      // Reload share to update like count and status
      loadShare(share.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
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
                  {user}
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

  if (error || !share) {
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
                  {user}
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
            <p className="text-red-600 text-lg">{error || 'Share not found'}</p>
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
                {user}
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
        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to main feed
        </Link>

        {/* Share Details */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {share.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <User className="h-5 w-5 mr-2" />
                <span>by {share.ownerUsername}</span>
              </div>
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center px-4 py-2 rounded-lg ${
                share.isLiked 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`h-5 w-5 mr-2 ${share.isLiked ? 'fill-current' : ''}`} />
              {share.likeCount} {share.likeCount === 1 ? 'like' : 'likes'}
            </button>
          </div>
          
          {share.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{share.description}</p>
            </div>
          )}

          {share.codeSnippets.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Files</h2>
              
              {/* File Selection Tabs */}
              {share.codeSnippets.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4 border-b">
                  {share.codeSnippets.map((snippet, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFileIndex(index)}
                      className={`px-3 py-2 text-sm border-b-2 flex items-center ${
                        selectedFileIndex === index
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {snippet.filename || `File ${index + 1}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected File Display */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between bg-gray-100 px-4 py-2">
                  <span className="font-medium text-gray-700">
                    {share.codeSnippets[selectedFileIndex]?.filename || `${share.codeSnippets[selectedFileIndex]?.language} Code`}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {share.codeSnippets[selectedFileIndex]?.language}
                  </span>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                  <code>{share.codeSnippets[selectedFileIndex]?.content}</code>
                </pre>
              </div>
            </div>
          )}

          {share.imageUrls.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {share.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-auto object-cover rounded-lg shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareDetailPage;
