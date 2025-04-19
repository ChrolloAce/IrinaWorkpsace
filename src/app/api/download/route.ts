import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the filename from the URL
    const url = new URL(request.url);
    const fileName = url.searchParams.get('file');
    
    if (!fileName) {
      return new NextResponse('File name is required', { status: 400 });
    }
    
    // Construct the file path
    const filePath = path.join(process.cwd(), 'temp', fileName);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Set the appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Return the file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return new NextResponse('Error downloading file', { status: 500 });
  }
} 