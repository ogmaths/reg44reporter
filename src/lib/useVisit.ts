import { supabase } from '../types/supabase';

export async function createVisit({ home_id, scheduled_for, created_by, status }: {
  home_id: string;
  scheduled_for: string;
  created_by: string;
  status?: string;
}) {
  const { data, error } = await supabase.from('visits').insert([
    {
      home_id,
      scheduled_for,
      created_by,
      status: status || 'completed',
    },
  ]).select();
  if (error || !data || !data[0] || !data[0].id) {
    return { error, id: null };
  }
  return { error: null, id: data[0].id };
}

export async function getVisitById(visit_id: string) {
  const { data, error } = await supabase.from('visits').select('*').eq('id', visit_id).single();
  return { data, error };
} 