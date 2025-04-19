import { NextRequest, NextResponse } from 'next/server';
import { getPdfData } from '@/lib/server-state';

// Force Edge runtime to maintain consistent global state
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get the PDF ID from the URL
    const url = new URL(request.url);
    const pdfId = url.searchParams.get('id');
    
    if (!pdfId) {
      return new NextResponse('PDF ID is required', { status: 400 });
    }
    
    // Check if the PDF exists in our cache
    const pdfData = await getPdfData(pdfId);
    
    if (!pdfData) {
      console.error(`PDF not found in cache: ${pdfId}`);
      return new NextResponse('PDF not found or expired', { status: 404 });
    }
    
    // Log the found PDF data for debugging
    console.log(`Found PDF in cache: ${pdfId}, filename: ${pdfData.fileName}`);
    
    // Extract the binary data from the data URI
    const base64Data = pdfData.data.split('base64,')[1];
    const binaryData = Buffer.from(base64Data, 'base64');
    
    // Set the appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', pdfData.contentType);
    headers.set('Content-Disposition', `attachment; filename="${pdfData.fileName}"`);
    
    // Return the file
    return new NextResponse(binaryData, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return new NextResponse('Error downloading file', { status: 500 });
  }
} 