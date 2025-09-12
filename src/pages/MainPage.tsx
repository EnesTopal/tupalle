import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { shareApi } from '../services/api';
import { Share, ApiResponse } from '../types';
import { Search, Heart, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const MainPage: React.FC = () => {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'most-liked'>('recent');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  
  const { user, logout } = useAuth();

  const loadShares = async (page = 0, sort = sortBy, search = '') => {
    setLoading(true);
    try {
      let response: ApiResponse<Share>;
      if (search) {
        response = await shareApi.searchShares(search, page, 20);
      } else {
        response = await shareApi.getShares(page, 20, sort);
      }
      setShares(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);
    } catch (error) {
      console.error('Failed to load shares:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
  }, [sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchMode(true);
      loadShares(0, sortBy, searchQuery);
    } else {
      setSearchMode(false);
      loadShares();
    }
  };

  const handleLike = async (shareId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await shareApi.unlikeShare(shareId);
      } else {
        await shareApi.likeShare(shareId);
      }
      // Reload shares to update like counts and status
      loadShares(currentPage, sortBy, searchMode ? searchQuery : '');
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search shares by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
            >
              Search
            </button>
          </form>

          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg ${
                  sortBy === 'recent' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSortBy('most-liked')}
                className={`px-4 py-2 rounded-lg ${
                  sortBy === 'most-liked' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Most Liked
              </button>
            </div>
            
            {searchMode && (
              <button
                onClick={() => {
                  setSearchMode(false);
                  setSearchQuery('');
                  loadShares();
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Shares Feed */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {shares.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No shares found</p>
                {searchMode && (
                  <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              shares.map((share) => (
                <div key={share.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link to={`/shares/${share.id}`}>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600 cursor-pointer">
                          {share.title}
                        </h2>
                      </Link>
                      <p className="text-gray-600 mb-2">by {share.ownerUsername}</p>
                    </div>
                    <button
                      onClick={() => handleLike(share.id, share.isLiked)}
                      className={`flex items-center ${
                        share.isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-5 w-5 mr-1 ${share.isLiked ? 'fill-current' : ''}`} />
                      {share.likeCount}
                    </button>
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
                  onClick={() => loadShares(i, sortBy, searchMode ? searchQuery : '')}
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
  );
};

export default MainPage;

