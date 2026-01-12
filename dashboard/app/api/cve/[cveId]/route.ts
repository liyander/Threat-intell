import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ cveId: string }> }) {
  const { cveId } = await params;

  try {
      const response = await axios.get(`http://localhost:3001/api/cve/${cveId}`, {
          timeout: 30000
      });
      return NextResponse.json(response.data);
  } catch (error: any) {
      console.error('Error proxying single CVE request:', error.message);
      return NextResponse.json({ 
          success: false, 
          error: 'Failed to fetch CVE details'
      }, { status: 500 });
  }
}
