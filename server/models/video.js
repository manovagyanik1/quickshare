import { supabase } from '../config/supabase.js';
import { URL_EXPIRY_MS } from '../constants/index.js';

export const VideoModel = {
  async initTable() {
    // Table should be created via Supabase dashboard or migration
  },

  async create({ onedriveId, ownerId, downloadUrl, shareId }) {
    const { data, error } = await supabase
      .from('videos')
      .insert({
        onedrive_id: onedriveId,
        share_id: shareId,
        owner_id: ownerId,
        download_url: downloadUrl,
        url_expiry: new Date(Date.now() + URL_EXPIRY_MS).toISOString(),
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

    if (!error && video) {
      return video;
    }

    // Try share_id
    ({ data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('share_id', id)
      .single());

    if (!error && video) {
      return video;
    }

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Supabase error:', error);
      throw error;
    }

    return null;
  },

  async updateUrl(id, downloadUrl) {
    const { error } = await supabase
      .from('videos')
      .update({
        download_url: downloadUrl,
        url_expiry: new Date(Date.now() + URL_EXPIRY_MS).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  }
};
