import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { shareApi } from '../services/api';
import { Plus, Code, Image } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CreateSharePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeContent, setCodeContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const shareData = {
        title,
        description,
        codeSnippets: codeContent.trim() ? [{
          language: codeLanguage,
          content: codeContent,
          filename: `${title.toLowerCase().replace(/\s+/g, '_')}.${codeLanguage}`
        }] : [],
        imageUrls: imageUrls.filter(url => url.trim())
      };

      await shareApi.createShare(shareData);
      navigate('/');
    } catch (error: any) {
      console.error('Failed to create share:', error);
      let errorMessage = 'Failed to create share. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data || 'Invalid data. Please check your input.';
      } else if (error.response?.status === 401) {
        errorMessage = 'You must be logged in to create a share.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to create shares.';
      } else if (error.response?.data) {
        errorMessage = error.response.data;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700">
              Tupalle
            </Link>
            <div className="ml-6">
              <h1 className="text-xl font-semibold text-gray-700">Create Share</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Plus className="h-6 w-6 text-primary-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Create New Share</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter a descriptive title for your share"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your code, what it does, or any additional context"
              />
            </div>

            {/* Code Section */}
            <div>
              <div className="flex items-center mb-3">
                <Code className="h-5 w-5 text-gray-600 mr-2" />
                <label className="block text-sm font-medium text-gray-700">
                  Code Snippet
                </label>
              </div>
              
              <div className="flex gap-4 mb-3">
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="typescript">TypeScript</option>
                  <option value="css">CSS</option>
                  <option value="html">HTML</option>
                  <option value="sql">SQL</option>
                  <option value="bash">Bash</option>
                </select>
              </div>
              
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                placeholder="Paste your code here..."
              />
            </div>

            {/* Images Section */}
            <div>
              <div className="flex items-center mb-3">
                <Image className="h-5 w-5 text-gray-600 mr-2" />
                <label className="block text-sm font-medium text-gray-700">
                  Image URLs
                </label>
              </div>
              
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com/image.png"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImageUrl}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                + Add another image URL
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Share'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSharePage;
