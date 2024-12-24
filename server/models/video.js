import { db } from '../config/firebase.js';
import { nanoid } from 'nanoid';

const COLLECTION_NAME = 'videos';

export const VideoModel = {
  async initTable() {
    // No need to initialize in Firebase
  },

  async create({ onedriveId, ownerId, downloadUrl }) {
    const id = nanoid();
    const videoRef = db.collection(COLLECTION_NAME).doc(id);
    
    const videoData = {
      onedrive_id: onedriveId,
      owner_id: ownerId,
      download_url: downloadUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Creating video in collection:', COLLECTION_NAME, {
      id,
      data: videoData,
      path: videoRef.path
    });
    
    try {
      await videoRef.set(videoData);
    } catch (error) {
      console.error('Firestore error details:', error);
      throw error;
    }

    return id;
  },

  async findById(id) {
    try {
      // Try primary id first
      let video = await db.collection(COLLECTION_NAME).doc(id).get();

      if (video.exists) {
        return { 
          id: video.id,
          ...video.data()
        };
      }

      // Try onedrive_id
      const querySnapshot = await db
        .collection(COLLECTION_NAME)
        .where('onedrive_id', '==', id)
        .get();

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      }

      return null;
    } catch (error) {
      console.error('Firestore error:', error);
      throw error;
    }
  },

  async updateUrl(id, downloadUrl) {
    await db.collection(COLLECTION_NAME).doc(id).update({
      download_url: downloadUrl,
      url_expiry: new Date(Date.now() + 3600000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}; 