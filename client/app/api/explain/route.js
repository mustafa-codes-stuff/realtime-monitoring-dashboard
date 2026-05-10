import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const anomalyData = await req.json();
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const res = await fetch(`${backendUrl}/api/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(anomalyData)
    });
    
    if (!res.ok) {
      throw new Error(`Backend returned status: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Next API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI explanation request' }, 
      { status: 500 }
    );
  }
}
