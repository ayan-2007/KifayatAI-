import { NextResponse } from 'next/server';
import { analyzeProduct } from '@/lib/analyze';

interface AnalyzeRequest {
  imageData: string;
  askingPrice: number;
  details?: string;
}

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.imageData || typeof body.askingPrice !== 'number' || body.askingPrice <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields: imageData, askingPrice' },
        { status: 400 }
      );
    }

    const result = await analyzeProduct({
      imageData: body.imageData,
      askingPrice: body.askingPrice,
      details: body.details,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}
