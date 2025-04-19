'use server';

// Type for PDF data
export type PdfData = {
  fileName: string;
  contentType: string;
  data: string;
  createdAt: string;
};

// Simple memory cache for server-side data
// This will be reset on deployments but works for temporary storage
let pdfCache: Record<string, PdfData> = {};

// Function to store PDF data
export async function storePdfData(pdfId: string, data: PdfData): Promise<void> {
  pdfCache[pdfId] = data;
  
  // Clean up old PDFs (keeping only last 10)
  const pdfIds = Object.keys(pdfCache);
  if (pdfIds.length > 10) {
    const oldestIds = pdfIds
      .sort((a, b) => pdfCache[a].createdAt.localeCompare(pdfCache[b].createdAt))
      .slice(0, pdfIds.length - 10);
    
    oldestIds.forEach(id => {
      delete pdfCache[id];
    });
  }
}

// Function to get PDF data
export async function getPdfData(pdfId: string): Promise<PdfData | null> {
  return pdfCache[pdfId] || null;
}

// Function to clear a specific PDF
export async function clearPdfData(pdfId: string): Promise<void> {
  delete pdfCache[pdfId];
}

// Function to get all PDF IDs
export async function getAllPdfIds(): Promise<string[]> {
  return Object.keys(pdfCache);
} 