'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  year: number;
  citations: number;
}

interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  amazonUrl: string;
  imageUrl: string;
  rating: number;
}

export default function ResearchInterface() {
  const [isScientific, setIsScientific] = useState(true);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);

  const searchResources = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Search papers
      const papersResponse = await fetch('/api/papers/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          scientific: isScientific,
          userId: user?.uid 
        })
      });
      
      // Search books
      const booksResponse = await fetch('/api/books/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          userId: user?.uid 
        })
      });
      
      const papersData = await papersResponse.json();
      const booksData = await booksResponse.json();
      
      setPapers(papersData.papers || []);
      setBooks(booksData.books || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const bookmarkResource = async (type: 'paper' | 'book', resourceId: string) => {
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          resourceType: type,
          resourceId
        })
      });
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Search Header */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchResources(searchQuery)}
            placeholder="Search mental health resources..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => searchResources(searchQuery)}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {/* Scientific Toggle */}
        <div className="flex items-center justify-center">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setIsScientific(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isScientific 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Scientific
            </button>
            <button
              onClick={() => setIsScientific(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !isScientific 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Simplified
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Research Papers Section */}
        {papers.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Research Papers</h3>
            <div className="space-y-3">
              {papers.map((paper) => (
                <div key={paper.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1">{paper.title}</h4>
                    <button
                      onClick={() => bookmarkResource('paper', paper.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-blue-500"
                    >
                      📚
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {paper.authors.join(', ')} ({paper.year})
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    {isScientific 
                      ? paper.abstract 
                      : paper.abstract.substring(0, 150) + '...'
                    }
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {paper.citations} citations
                    </span>
                    <a 
                      href={paper.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm hover:underline"
                    >
                      Read Full Paper
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Books Section */}
        {books.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Recommended Books</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((book) => (
                <div key={book.id} className="bg-white p-4 rounded-lg shadow-sm border flex">
                  <img 
                    src={book.imageUrl} 
                    alt={book.title}
                    className="w-16 h-20 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{book.title}</h4>
                      <button
                        onClick={() => bookmarkResource('book', book.id)}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        📚
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {book.authors.join(', ')}
                    </p>
                    <p className="text-xs text-gray-700 mb-2">
                      {book.description.substring(0, 100)}...
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-yellow-500">{'★'.repeat(Math.floor(book.rating))}</span>
                        <span className="text-xs text-gray-500 ml-1">({book.rating})</span>
                      </div>
                      <a 
                        href={book.amazonUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 text-xs hover:underline"
                      >
                        View on Amazon
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
