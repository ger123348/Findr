import { supabase } from './supabase';

const BUCKET_NAME = 'findr-docs';

export interface UploadResult {
  file_url: string;
  file_name: string;
}

/**
 * Uploads a PDF file to Supabase Storage (findr-docs bucket),
 * then inserts a record into the 'documents' table.
 * Returns the public URL and file name on success.
 */
export async function uploadPdf(file: File): Promise<UploadResult> {
  // Generate a unique file path to avoid collisions
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${timestamp}_${safeName}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 2. Get the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const file_url = urlData.publicUrl;

  // 3. Insert record into 'documents' table
  const { error: dbError } = await supabase
    .from('documents')
    .insert({
      file_name: file.name,
      file_url,
    });

  if (dbError) {
    // Non-fatal: file is uploaded but DB record failed. Log and continue.
    console.error('DB insert failed:', dbError.message);
  }

  return { file_url, file_name: file.name };
}
