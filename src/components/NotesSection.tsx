
import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const NotesSection = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!user || !newNoteTitle.trim()) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: newNoteTitle.trim(),
          content: newNoteContent.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewNoteTitle('');
      setNewNoteContent('');
      
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content || '');
  };

  const handleSaveEdit = async () => {
    if (!user || !editingId || !editTitle.trim()) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: editTitle.trim(),
          content: editContent.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === editingId ? data : note
      ));
      
      setEditingId(null);
      setEditTitle('');
      setEditContent('');
      
      toast({
        title: "Note Updated",
        description: "Your note has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!user) {
    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center mb-3">
          <StickyNote className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="font-semibold text-gray-800">Notes</h3>
        </div>
        <p className="text-gray-600 text-sm">Please sign in to access your notes.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center mb-3">
        <StickyNote className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="font-semibold text-gray-800">My Notes</h3>
      </div>

      <div className="space-y-4">
        {/* Add New Note Form */}
        <div className="border-b pb-4">
          <Label htmlFor="newNoteTitle" className="text-sm font-medium text-gray-700">
            New Note
          </Label>
          <Input
            id="newNoteTitle"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="Note title..."
            className="mt-1 mb-2"
          />
          <Textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write your note here..."
            rows={3}
            className="mb-2"
          />
          <Button
            onClick={handleAddNote}
            disabled={!newNoteTitle.trim() || isLoading}
            className="w-full text-white hover:opacity-90"
            style={{ backgroundColor: '#245d7a' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Note'}
          </Button>
        </div>

        {/* Notes List */}
        {isLoading && notes.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading notes...</p>
          </div>
        ) : notes.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Your Notes ({notes.length})
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded border">
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Note title..."
                        className="text-sm font-medium"
                      />
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Note content..."
                        rows={3}
                        className="text-sm"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveEdit}
                          disabled={!editTitle.trim() || isLoading}
                          size="sm"
                          className="text-white hover:opacity-90"
                          style={{ backgroundColor: '#245d7a' }}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <h5 className="font-medium text-gray-800 text-sm mb-1">
                          {note.title}
                        </h5>
                        {note.content && (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {note.content}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {formatDate(note.updated_at)}
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => handleEditNote(note)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            disabled={isLoading}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteNote(note.id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No notes yet. Create your first note above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSection;
