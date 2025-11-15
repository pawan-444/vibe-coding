import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse comma-separated tags into a text array
const parseTags = (tags: string | null): string[] => {
  if (!tags) return [];
  return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string | null;
    const anonymity = formData.get('anonymity') === 'true';
    const contact_info = formData.get('contact_info') as string | null;
    const source = (formData.get('source') as string) || 'web';
    const location = formData.get('location') as string | null;
    const files = formData.getAll('files') as File[];

    // 1. Validate required fields
    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Title and description are required.' }, { status: 400 });
    }

    const media_urls: string[] = [];
    const media_types: string[] = [];
    let voice_transcript: string | null = null;

    const useSupabaseStorage = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_BUCKET_NAME;

    // 2. Handle file uploads
    if (files && files.length > 0) {
      for (const file of files) {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${uuidv4()}-${file.name}`;
        media_types.push(file.type);

        if (useSupabaseStorage) {
          // Upload to Supabase Storage
          const { data, error } = await supabaseAdmin.storage
            .from(process.env.SUPABASE_BUCKET_NAME!)
            .upload(fileName, fileBuffer, {
              contentType: file.type,
              upsert: false,
            });

          if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json({ success: false, error: 'Failed to upload file to storage.' }, { status: 500 });
          }

          const { data: { publicUrl } } = supabaseAdmin.storage
            .from(process.env.SUPABASE_BUCKET_NAME!)
            .getPublicUrl(data.path);

          media_urls.push(publicUrl);
        } else {
          // Fallback to local storage
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.mkdir(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, fileName);
          await fs.writeFile(filePath, fileBuffer);

          const publicUrl = `/uploads/${fileName}`;
          media_urls.push(publicUrl);
        }

        // Check for audio files for transcription stub
        if (file.type.startsWith('audio/')) {
          // TODO: Integrate Whisper for transcription
          voice_transcript = null; // As per instructions
        }
      }
    }

    // 3. Prepare data for database insertion
    const submissionData = {
      title,
      description,
      media_urls: media_urls,
      media_types: media_types,
      voice_transcript,
      location: location ? JSON.parse(location) : null,
      tags: parseTags(tags),
      anonymity,
      contact_info: anonymity ? null : contact_info,
      source,
    };

    // 4. Insert into Supabase database
    const { data: submission, error: dbError } = await supabaseAdmin
      .from('submissions')
      .insert([submissionData])
      .select()
      .single();

    if (dbError) {
      console.error('Database insertion error:', dbError);
      return NextResponse.json({ success: false, error: 'Failed to save submission.' }, { status: 500 });
    }

    // 5. Return success response
    return NextResponse.json({ success: true, submission }, { status: 201 });

  } catch (error) {
    console.error('Error in /api/submit:', error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ success: false, error: 'Invalid JSON in location field.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
