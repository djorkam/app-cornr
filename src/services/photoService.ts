import { supabase } from '../lib/supabase';

export const photoService = {
  async uploadProfilePhoto(userId: string, file: File): Promise<string | null> {
    try {
      // Create a unique filename
      const fileName = `${userId}-${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file exists
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  },

  async deleteAllProfilePhotos(userId: string): Promise<boolean> {
    try {
      // List all files for this user and delete them
      const { data: files, error: listError } = await supabase.storage
        .from('profile-photos')
        .list('', {
          search: userId,
        });

      if (listError) {
        console.error('List error:', listError);
        return false;
      }

      if (files && files.length > 0) {
        const fileNames = files.map(f => f.name);
        const { error: deleteError } = await supabase.storage
          .from('profile-photos')
          .remove(fileNames);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  },

 async deleteProfilePhoto(photoUrl: string): Promise<boolean> {
  try {
    console.log('Attempting to delete photo:', photoUrl);
    
    // Extract filename from URL
    const fileName = photoUrl.split('/').pop();
    console.log('Extracted filename:', fileName);
    
    if (!fileName) {
      console.error('No filename extracted from URL');
      return false;
    }

    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    console.log('Photo deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
},
};