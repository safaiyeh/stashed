import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { authService } from '../auth';

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

// Query key for tags
const TAGS_QUERY_KEY = 'tags';

// Fetch all tags
const fetchTags = async (): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

// Create a new tag
const createTag = async (name: string): Promise<Tag> => {
  const session = await authService.getSession();
  if (!session) throw new Error('No active session');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Failed to get user');
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete a tag
const deleteTag = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Batch add tags to saves
const addTagsToSave = async (pairs: { save_id: string, tag_id: string }[]): Promise<void> => {
  const session = await authService.getSession();
  if (!session) throw new Error('No active session');
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Failed to get user');

  // Get all unique save_ids from the pairs
  const saveIds = Array.from(new Set(pairs.map(p => p.save_id)));
  // Fetch all saves for these IDs that belong to the user
  const { data: saves, error: savesError } = await supabase
    .from('saves')
    .select('id, user_id')
    .in('id', saveIds);
  if (savesError) throw savesError;

  // Build a set of save_ids the user owns
  const userSaveIds = new Set((saves || []).filter(s => s.user_id === user.id).map(s => s.id));

  // Filter pairs to only those the user owns
  const allowedPairs = pairs.filter(p => userSaveIds.has(p.save_id));
  if (allowedPairs.length === 0) return;

  const { error } = await supabase
    .from('saves_tags')
    .upsert(
      allowedPairs,
      { onConflict: 'save_id,tag_id' }
    );
  if (error) throw error;
};

// Remove tags from a save
const removeTagsFromSave = async (saveId: string, tagIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('saves_tags')
    .delete()
    .eq('save_id', saveId)
    .in('tag_id', tagIds);

  if (error) throw error;
};

// Get tags for a save
export const getTagsForSave = async (saveId: string): Promise<Tag[]> => {
  const { data: tagIds, error: tagIdsError } = await supabase
    .from('saves_tags')
    .select('tag_id')
    .eq('save_id', saveId);

  if (tagIdsError) throw tagIdsError;

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .in('id', tagIds.map(t => t.tag_id));

  if (error) throw error;
  return data;
};

export function useTags() {
  const queryClient = useQueryClient();

  // Query for fetching all tags
  const { data: tags, isLoading, error } = useQuery({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: fetchTags,
  });

  // Mutation for creating a tag
  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });

  // Mutation for deleting a tag
  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });

  // Mutation for adding tags to a save
  const addTagsMutation = useMutation({
    mutationFn: addTagsToSave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });

  // Mutation for removing tags from a save
  const removeTagsMutation = useMutation({
    mutationFn: ({ saveId, tagIds }: { saveId: string; tagIds: string[] }) =>
      removeTagsFromSave(saveId, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });

  return {
    tags,
    isLoading,
    error,
    createTag: createMutation.mutateAsync,
    deleteTag: deleteMutation.mutateAsync,
    addTagsToSave: addTagsMutation.mutateAsync,
    removeTagsFromSave: removeTagsMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingTags: addTagsMutation.isPending,
    isRemovingTags: removeTagsMutation.isPending,
  };
} 