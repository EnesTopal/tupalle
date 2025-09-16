import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { shareApi } from '../services/api';
import { Plus, Code, Image, X, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  hasNameError: boolean;
}

const CreateSharePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([{
    id: '1',
    name: '',
    language: 'kotlin',
    content: '',
    hasNameError: false
  }]);
  const [selectedFileId, setSelectedFileId] = useState('1');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate file names
    let hasErrors = false;
    const validatedFiles = codeFiles.map(file => {
      const hasError = !!(file.content.trim() && !file.name.trim());
      if (hasError) hasErrors = true;
      return { ...file, hasNameError: hasError };
    });
    
    setCodeFiles(validatedFiles);
    
    if (hasErrors) {
      setError('Please provide names for all code files that have content.');
      return;
    }
    
    setLoading(true);

    // First, update filenames with extensions if needed
    const updatedFiles = codeFiles.map(file => {
      if (file.content.trim() && file.name.trim() && !file.name.includes('.')) {
        const extension = getFileExtension(file.language);
        if (extension) {
          return { ...file, name: file.name + extension };
        }
      }
      return file;
    });
    
    setCodeFiles(updatedFiles);

    try {
      const shareData = {
        title,
        description,
        codeSnippets: updatedFiles
          .filter(file => file.content.trim() && file.name.trim())
          .map(file => ({
            language: file.language,
            content: file.content,
            filename: file.name
          })),
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

  // Helper functions for managing code files
  const addCodeFile = () => {
    const newId = Date.now().toString();
    const newFile: CodeFile = {
      id: newId,
      name: '',
      language: 'kotlin',
      content: '',
      hasNameError: false
    };
    setCodeFiles([...codeFiles, newFile]);
    setSelectedFileId(newId);
  };

  const removeCodeFile = (fileId: string) => {
    if (codeFiles.length > 1) {
      const filteredFiles = codeFiles.filter(file => file.id !== fileId);
      setCodeFiles(filteredFiles);
      if (selectedFileId === fileId) {
        setSelectedFileId(filteredFiles[0].id);
      }
    }
  };

  // Helper function to get file extension from language
  const getFileExtension = (language: string): string => {
    const extensions: { [key: string]: string } = {
      'kotlin': '.kt',
      'xml': '.xml',
      'gradle': '.gradle',
      'proguard': '.pro',
      'dart': '.dart',
      'yaml': '.yaml',
      'javascript': '.js',
      'typescript': '.ts',
      'jsx': '.jsx',
      'tsx': '.tsx',
      'json': '.json',
      'css': '.css',
      'html': '.html',
      'bash': '.sh'
    };
    return extensions[language] || '';
  };

  // Helper function to detect language from file extension
  const detectLanguageFromExtension = (filename: string): string | null => {
    const extension = filename.toLowerCase().match(/\.([^.]+)$/)?.[1];
    const languageMap: { [key: string]: string } = {
      'kt': 'kotlin',
      'xml': 'xml',
      'gradle': 'gradle',
      'pro': 'proguard',
      'dart': 'dart',
      'yaml': 'yaml',
      'yml': 'yaml',
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'json': 'json',
      'css': 'css',
      'html': 'html',
      'sh': 'bash'
    };
    return extension ? languageMap[extension] || null : null;
  };

  // Helper function to get placeholder based on language
  const getPlaceholder = (language: string): string => {
    const placeholders: { [key: string]: string } = {
      'kotlin': 'MainActivity.kt',
      'xml': 'activity_main.xml',
      'gradle': 'build.gradle',
      'proguard': 'proguard-rules.pro',
      'dart': 'main.dart',
      'yaml': 'pubspec.yaml',
      'javascript': 'App.js',
      'typescript': 'App.ts',
      'jsx': 'App.jsx',
      'tsx': 'App.tsx',
      'json': 'package.json',
      'css': 'styles.css',
      'html': 'index.html',
      'bash': 'build.sh'
    };
    return placeholders[language] || 'filename';
  };

  const updateCodeFile = (fileId: string, updates: Partial<CodeFile>) => {
    setCodeFiles(files => files.map(file => {
      if (file.id === fileId) {
        const updatedFile = { ...file, ...updates, hasNameError: false };
        
        // If name is being updated, check for file extension and auto-detect language
        if (updates.name !== undefined) {
          const detectedLanguage = detectLanguageFromExtension(updates.name);
          if (detectedLanguage) {
            updatedFile.language = detectedLanguage;
          }
        }
        
        // If language is being updated and filename doesn't have extension, add it
        if (updates.language !== undefined && updatedFile.name && !updatedFile.name.includes('.')) {
          const extension = getFileExtension(updates.language);
          if (extension) {
            updatedFile.name = updatedFile.name + extension;
          }
        }
        
        return updatedFile;
      }
      return file;
    }));
  };

  const moveCodeFile = (fileId: string, direction: 'up' | 'down') => {
    const currentIndex = codeFiles.findIndex(file => file.id === fileId);
    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < codeFiles.length - 1)
    ) {
      const newFiles = [...codeFiles];
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      [newFiles[currentIndex], newFiles[newIndex]] = [newFiles[newIndex], newFiles[currentIndex]];
      setCodeFiles(newFiles);
    }
  };

  const selectedFile = codeFiles.find(file => file.id === selectedFileId) || codeFiles[0];

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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Code className="h-5 w-5 text-gray-600 mr-2" />
                  <label className="block text-sm font-medium text-gray-700">
                    Code Files
                  </label>
                </div>
                <button
                  type="button"
                  onClick={addCodeFile}
                  className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add File
                </button>
              </div>
              
              {/* File Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 border-b">
                {codeFiles.map((file, index) => (
                  <div key={file.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedFileId(file.id)}
                      className={`px-3 py-2 text-sm border-b-2 flex items-center ${
                        selectedFileId === file.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {file.name || `File ${index + 1}`}
                      {file.hasNameError && <span className="ml-1 text-red-500">*</span>}
                    </button>
                    {codeFiles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCodeFile(file.id)}
                        className="ml-1 p-1 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* File Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Name *
                  </label>
                  <input
                    type="text"
                    value={selectedFile.name}
                    onChange={(e) => updateCodeFile(selectedFile.id, { name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      selectedFile.hasNameError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={getPlaceholder(selectedFile.language)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={selectedFile.language}
                    onChange={(e) => updateCodeFile(selectedFile.id, { language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <optgroup label="Kotlin">
                      <option value="kotlin">Kotlin</option>
                      <option value="xml">XML (Android Layout)</option>
                      <option value="gradle">Gradle</option>
                      <option value="proguard">ProGuard</option>
                    </optgroup>
                    <optgroup label="Flutter">
                      <option value="dart">Dart</option>
                      <option value="yaml">YAML (pubspec.yaml)</option>
                    </optgroup>
                    <optgroup label="React Native">
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="jsx">JSX</option>
                      <option value="tsx">TSX</option>
                      <option value="json">JSON</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="css">CSS</option>
                      <option value="html">HTML</option>
                      <option value="bash">Shell Script</option>
                    </optgroup>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => moveCodeFile(selectedFile.id, 'up')}
                    disabled={codeFiles.findIndex(f => f.id === selectedFile.id) === 0}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCodeFile(selectedFile.id, 'down')}
                    disabled={codeFiles.findIndex(f => f.id === selectedFile.id) === codeFiles.length - 1}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Code Editor */}
              <textarea
                value={selectedFile.content}
                onChange={(e) => updateCodeFile(selectedFile.id, { content: e.target.value })}
                rows={12}
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
