import { NextRequest, NextResponse } from 'next/server';

const SEMANTIC_SCHOLAR_URL = 'https://api.semanticscholar.org/graph/v1/paper/search';

export async function POST(req: NextRequest) {
  try {
    const { query, scientific, userId } = await req.json();

    const response = await fetch(
      `${SEMANTIC_SCHOLAR_URL}?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,abstract,url,year,citationCount`,
      {
        headers: {
          'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY || ''
        }
      }
    );

    const data = await response.json();
    
    const papers = data.data?.map((paper: any) => ({
      id: paper.paperId,
      title: paper.title,
      authors: paper.authors?.map((author: any) => author.name) || [],
      abstract: scientific 
        ? paper.abstract 
        : simplifyAbstract(paper.abstract),
      url: paper.url,
      year: paper.year,
      citations: paper.citationCount || 0
    })) || [];

    return NextResponse.json({
      papers,
      success: true
    });
  } catch (error) {
    console.error('Papers search error:', error);
    return NextResponse.json(
      { error: 'Failed to search papers' },
      { status: 500 }
    );
  }
}

function simplifyAbstract(abstract: string): string {
  if (!abstract) return 'No abstract available.';
  
  // Simple text simplification - in production, use a proper API
  const simplified = abstract
    .replace(/\b(methodology|statistical|empirical|quantitative)\b/gi, '')
    .replace(/\b(p < 0\.05|significant|correlation)\b/gi, 'shows connection')
    .replace(/complex medical terms/gi, 'medical concepts')
    .substring(0, 200);
    
  return simplified + '...';
}
