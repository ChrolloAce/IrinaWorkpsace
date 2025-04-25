import { NextRequest, NextResponse } from 'next/server';
import { getPdfData, clearPdfData } from '@/lib/server-state';

// Force Edge runtime to maintain consistent global state
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get the PDF ID from the query parameter
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing PDF ID', { status: 400 });
    }

    // Get the PDF data from the cache
    const pdfData = await getPdfData(id);

    if (!pdfData) {
      return new NextResponse('PDF not found. It may have expired.', { status: 404 });
    }

    // Create the response with the PDF data
    const binaryData = Buffer.from(
      pdfData.data.replace(/^data:application\/pdf;base64,/, ''), 
      'base64'
    );

    // Clear the PDF data from the cache after it's been downloaded
    // This helps with memory management
    setTimeout(() => clearPdfData(id), 60000); // Delete after 1 minute
    
    // Return the PDF with appropriate headers
    return new NextResponse(binaryData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfData.fileName}"`,
        'Content-Length': binaryData.length.toString(),
      }
    });
  } catch (error) {
    console.error('Error retrieving PDF:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 