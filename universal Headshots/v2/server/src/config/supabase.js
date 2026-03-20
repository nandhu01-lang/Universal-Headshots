import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Database schema tables:
// - users (id, email, tier, image_credits, refine_credits, push_token, created_at)
// - batches (id, user_id, status, progress, tier, image_count, created_at)
// - refinements (id, user_id, original_image, results, status, created_at)
// - fraud_prevention (device_id, free_used, last_seen)

export const db = {
  /**
   * Users table operations
   */
  users: {
    async get(userId) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) return null;
      return data;
    },

    async create(userId, email) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          tier: 'FREE',
          image_credits: 0,
          refine_credits: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      return { data, error };
    },

    async update(userId, updates) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },

    async incrementCredits(userId, imageCredits = 0, refineCredits = 0) {
      const updates = {};
      if (imageCredits > 0) {
        updates.image_credits = supabase.raw(`image_credits + ${imageCredits}`);
      }
      if (refineCredits > 0) {
        updates.refine_credits = supabase.raw(`refine_credits + ${refineCredits}`);
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    }
  },

  /**
   * Batches table operations
   */
  batches: {
    async create(batchId, userId, data) {
      const { data: result, error } = await supabase
        .from('batches')
        .insert({
          id: batchId,
          user_id: userId,
          status: 'PROCESSING',
          progress: 0,
          ...data,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      return { data: result, error };
    },

    async get(batchId) {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('id', batchId)
        .single();
      return { data, error };
    },

    async update(batchId, updates) {
      const { data, error } = await supabase
        .from('batches')
        .update(updates)
        .eq('id', batchId)
        .select()
        .single();
      return { data, error };
    }
  },

  /**
   * Fraud prevention operations
   */
  fraudPrevention: {
    async check(deviceId) {
      const { data, error } = await supabase
        .from('fraud_prevention')
        .select('*')
        .eq('device_id', deviceId)
        .single();
      
      if (data?.free_used) {
        return { allowed: false, message: 'Free tier already claimed on this device' };
      }
      return { allowed: true };
    },

    async markFreeUsed(deviceId) {
      const { error } = await supabase
        .from('fraud_prevention')
        .upsert({
          device_id: deviceId,
          free_used: true,
          last_seen: new Date().toISOString()
        });
      return { error };
    }
  }
};

export default db;
