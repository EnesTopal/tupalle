import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userApi, shareApi } from '../services/api';
import { Share } from '../types';
import { User, Code, Heart, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-shares' | 'liked'>('my-shares');
  const [myShares, setMyShares] = useState<Share[]>([]);
  const [likedShares, setLikedShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadMyShares = async (page = 0) => {
    setLoading(true);
    try {
      const response = await userApi.getMyShares(page, 20);
      setMyShares(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);
    } catch (error) {
      console.error('Failed to load my shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedShares = async (page = 0) => {
    setLoading(true);
    try {
      const response = await userApi.getMyLikedShares(page, 20);
      setLikedShares(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);
    } catch (error) {
      console.error('Failed to load liked shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    if (window.confirm('Are you sure you want to delete this share? This action cannot be undone.')) {
      try {
        await shareApi.deleteShare(shareId);
        // Reload the shares to reflect the deletion
        if (activeTab === 'my-shares') {
          loadMyShares(currentPage);
        }
      } catch (error) {
        console.error('Failed to delete share:', error);
        alert('Failed to delete share. Please try again.');
      }
    }
  };

  const handleEditShare = (shareId: string) => {
    navigate(`/shares/${shareId}/edit`);
  };

  useEffect(() => {
    if (activeTab === 'my-shares') {
      loadMyShares();
    } else if (activeTab === 'liked') {
      loadLikedShares();
    }
  }, [activeTab]);


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
              <h1 className="text-xl font-semibold text-gray-700">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">{user}</h2>
              <p className="text-gray-600">Code Enthusiast</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('my-shares')}
                className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'my-shares'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Code className="h-5 w-5 mr-2" />
                My Shares
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'liked'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Heart className="h-5 w-5 mr-2" />
                Liked
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'my-shares' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Shares</h3>
                  <Link
                    to="/create"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Create Share
                  </Link>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myShares.length === 0 ? (
                      <div className="text-center py-12">
                        <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No shares yet</p>
                        <p className="text-gray-400 mt-2">Create your first share to get started!</p>
                      </div>
                    ) : (
                      myShares.map((share) => (
                        <div key={share.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <Link to={`/shares/${share.id}`}>
                                <h4 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                                  {share.title}
                                </h4>
                              </Link>
                              <p className="text-sm text-gray-600">
                                {new Date().toLocaleDateString()} • {share.likeCount} likes
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditShare(share.id)}
                                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                                title="Edit share"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteShare(share.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                title="Delete share"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {share.description && (
                            <p className="text-gray-700 mb-3">{share.description}</p>
                          )}

                          <div className="flex items-center text-sm text-gray-500">
                            <Code className="h-4 w-4 mr-1" />
                            {share.codeSnippets.length} code snippet{share.codeSnippets.length !== 1 ? 's' : ''}
                            {share.imageUrls.length > 0 && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{share.imageUrls.length} image{share.imageUrls.length !== 1 ? 's' : ''}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Pagination for my shares */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => loadMyShares(i)}
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
            )}

            {activeTab === 'liked' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Liked Shares</h3>
                
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {likedShares.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No liked shares yet</p>
                        <p className="text-gray-400 mt-2">Like some shares to see them here!</p>
                      </div>
                    ) : (
                      likedShares.map((share) => (
                        <div key={share.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <Link to={`/shares/${share.id}`}>
                                <h4 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                                  {share.title}
                                </h4>
                              </Link>
                              <p className="text-sm text-gray-600">
                                by {share.ownerUsername} • {share.likeCount} likes
                              </p>
                            </div>
                            <Heart className="h-5 w-5 text-red-500 fill-current" />
                          </div>
                          
                          {share.description && (
                            <p className="text-gray-700 mb-3">{share.description}</p>
                          )}

                          <div className="flex items-center text-sm text-gray-500">
                            <Code className="h-4 w-4 mr-1" />
                            {share.codeSnippets.length} code snippet{share.codeSnippets.length !== 1 ? 's' : ''}
                            {share.imageUrls.length > 0 && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{share.imageUrls.length} image{share.imageUrls.length !== 1 ? 's' : ''}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Pagination for liked shares */}
                {totalPages > 1 && activeTab === 'liked' && (
                  <div className="mt-6 flex justify-center">
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => loadLikedShares(i)}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

