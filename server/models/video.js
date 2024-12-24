import { supabase } from '../config/supabase.js';

export const VideoModel = {
  async initTable() {
    // Table should be created via Supabase dashboard or migration
  },

  async create({ onedriveId, ownerId, downloadUrl }) {
    const { data, error } = await supabase
      .from('videos')
      .insert({
        onedrive_id: onedriveId,
        owner_id: ownerId,
        download_url: downloadUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return data.id;
  },

  async findById(id) {
    // Try primary id first
    let { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && video) {
      return video;
    }

    // Try onedrive_id
    ({ data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('onedrive_id', id)
      .single());

    if (error) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error('Supabase error:', error);
        throw error;
      }
      return null;
    }

    return video;
  },

  async updateUrl(id, downloadUrl) {
    const { error } = await supabase
      .from('videos')
      .update({
        download_url: downloadUrl,
        url_expiry: new Date(Date.now() + 3600000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  }
}; 