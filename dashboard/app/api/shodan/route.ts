import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
  }

  try {
      // Proxy to the backend scraping service
      const response = await axios.get(`http://localhost:3001/api/shodan/search`, {
          params: { query },
          timeout: 60000 
      });
      return NextResponse.json(response.data);
  } catch (error: any) {
      console.error('Error proxying to backend:', error.message);
      return NextResponse.json({ 
          error: 'Failed to fetch from backend', 
          details: error.message,
          matches: [],
          total: 0
      }, { status: 500 });
  }
}

