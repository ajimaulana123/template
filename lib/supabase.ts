import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase (for public access)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase with service role (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Helper function to upload avatar (server-side with admin client)
export async function uploadAvatar(fileBuffer: Buffer, fileName: string, contentType: string) {
  try {
    if (!supabaseAdmin) {
      return {
        success: false,
        error: 'Fitur upload foto belum dikonfigurasi. Silakan hubungi administrator.',
        errorCode: 'CONFIG_MISSING'
      }
    }

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, fileBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      // Handle specific Supabase errors
      if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
        return {
          success: false,
          error: 'Penyimpanan foto belum tersedia. Silakan hubungi administrator untuk mengaktifkan fitur ini.',
          errorCode: 'BUCKET_NOT_FOUND'
        }
      }
      
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        return {
          success: false,
          error: 'File dengan nama yang sama sudah ada. Silakan coba lagi.',
          errorCode: 'DUPLICATE_FILE'
        }
      }

      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
      fileName: fileName,
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    
    // Provide user-friendly error messages
    let userMessage = 'Gagal mengupload foto. Silakan coba lagi.'
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = 'Koneksi bermasalah. Periksa internet Anda dan coba lagi.'
    } else if (error.message?.includes('timeout')) {
      userMessage = 'Upload timeout. File terlalu besar atau koneksi lambat.'
    }
    
    return {
      success: false,
      error: userMessage,
      errorCode: 'UNKNOWN_ERROR'
    }
  }
}

// Helper function to delete avatar (server-side with admin client)
export async function deleteAvatar(fileName: string) {
  try {
    if (!supabaseAdmin) {
      console.warn('Supabase admin client not configured, skipping delete')
      return { success: false, error: 'Admin client not configured' }
    }

    console.log('Deleting file from storage:', fileName)

    const { error } = await supabaseAdmin.storage
      .from('avatars')
      .remove([fileName])

    if (error) {
      console.error('Delete error from Supabase:', error)
      throw error
    }

    console.log('File deleted successfully:', fileName)
    return { success: true }
  } catch (error: any) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete file',
    }
  }
}

// Helper to extract filename from URL
export function getFileNameFromUrl(url: string): string | null {
  try {
    // Handle Supabase Storage URL format
    // Example: https://project.supabase.co/storage/v1/object/public/avatars/filename.jpg
    const match = url.match(/\/avatars\/(.+?)(?:\?|$)/)
    if (match && match[1]) {
      return match[1]
    }
    
    // Fallback: try to get last part after avatars/
    const parts = url.split('/avatars/')
    if (parts.length > 1) {
      return parts[1].split('?')[0] // Remove query params if any
    }
    
    return null
  } catch (error) {
    console.error('Error extracting filename from URL:', error)
    return null
  }
}
