import { NextRequest, NextResponse } from 'next/server';

// Define the cache structure in global scope
declare global {
  var __PDF_CACHE: {
    [key: string]: {
      fileName: string;
      contentType: string;
      data: string;
      createdAt: string;
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get the PDF ID from the URL
    const url = new URL(request.url);
    const pdfId = url.searchParams.get('id');
    
    if (!pdfId) {
      return new NextResponse('PDF ID is required', { status: 400 });
    }
    
    // Check if the PDF exists in our cache
    if (!global.__PDF_CACHE || !global.__PDF_CACHE[pdfId]) {
      console.error(`PDF not found in cache: ${pdfId}`);
      return new NextResponse('PDF not found or expired', { status: 404 });
    }
    
    const pdfData = global.__PDF_CACHE[pdfId];
    
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