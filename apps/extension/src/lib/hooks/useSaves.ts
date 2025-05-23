import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { SavedItem } from '../../types';
import { authService } from '../auth';

// Query key for saves
const SAVES_QUERY_KEY = 'saves';

// Fetch all saves
const fetchSaves = async (): Promise<SavedItem[]> => {
  const { data, error } = await supabase
    .from('saves')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Create a new save
const createSave = async (save: Omit<SavedItem, 'id'>): Promise<SavedItem> => {
  const session = await authService.getSession();
  if (!session) {
    throw new Error('No active session');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Failed to get user');
  }

  const { data, error } = await supabase
    .from('saves')
    .insert([{ ...save, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a save
const updateSave = async ({ id, ...save }: SavedItem): Promise<SavedItem> => {
  const { data, error } = await supabase
    .from('saves')
    .update(save)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a save
const deleteSave = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('saves')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export function useSaves() {
  const queryClient = useQueryClient();

  // Query for fetching saves
  const { data: saves, isLoading, error } = useQuery({
    queryKey: [SAVES_QUERY_KEY],
    queryFn: fetchSaves,
  });

  // Mutation for creating a save
  const createMutation = useMutation({
    mutationFn: createSave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVES_QUERY_KEY] });
    },
  });

  // Mutation for updating a save
  const updateMutation = useMutation({
    mutationFn: updateSave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVES_QUERY_KEY] });
    },
  });

  // Mutation for deleting a save
  const deleteMutation = useMutation({
    mutationFn: deleteSave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVES_QUERY_KEY] });
    },
  });

  return {
    saves,
    isLoading,
    error,
    createSave: createMutation.mutate,
    updateSave: updateMutation.mutate,
    deleteSave: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
} 