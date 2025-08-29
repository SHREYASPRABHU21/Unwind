import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query, userId } = await req.json();
    
    // Using a combination of APIs - Amazon Product API, Google Books, etc.
    // For demo purposes, using a mock response structure
    
    const mentalHealthBooks = [
      {
        id: 'book-1',
        title: 'The Anxiety and Worry Workbook',
        authors: ['David A. Clark', 'Aaron T. Beck'],
        description: 'A comprehensive guide to understanding and managing anxiety through cognitive behavioral techniques.',
        amazonUrl: `https://amazon.com/s?k=${encodeURIComponent(query)}+mental+health+book`,
        imageUrl: 'https://images.amazon.com/images/placeholder-book.jpg',
        rating: 4.5
      },
      {
        id: 'book-2', 
        title: 'Feeling Good: The New Mood Therapy',
        authors: ['David D. Burns'],
        description: 'Revolutionary approach to treating depression through cognitive behavioral therapy techniques.',
        amazonUrl: `https://amazon.com/s?k=${encodeURIComponent(query)}+depression+therapy+book`,
        imageUrl: 'https://images.amazon.com/images/placeholder-book.jpg',
        rating: 4.7
      }
    ];

    // In production, implement actual Amazon Product Advertising API
    const books = mentalHealthBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.description.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
      books,
      success: true
    });
  } catch (error) {
    console.error('Books search error:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}
