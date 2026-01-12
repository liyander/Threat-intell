import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  try {
      const response = await axios.get(`http://localhost:3001/api/cve`, {
          params: { query },
          timeout: 30000
      });
      return NextResponse.json(response.data);
  } catch (error: any) {
      console.error('Error proxying CVE request:', error.message);
      return NextResponse.json({ 
          success: false, 
          error: 'Failed to fetch CVE data', 
          cves: [] 
      }, { status: 500 });
  }
}
