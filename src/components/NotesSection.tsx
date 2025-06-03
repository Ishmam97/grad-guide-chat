
import React, { useState } from 'react';
import { StickyNote, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Note {
  id: string;
  text: string;
  timestamp: Date;
}

const NotesSection = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      text: newNote,
      timestamp: new Date()
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully.",
    });
  };

  const handleEditNote = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveEdit = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, text: editText } : note
    ));
    setEditingId(null);
    setEditText('');
    toast({
      title: "Note Updated",
      description: "Your note has been updated successfully.",
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast({
      title: "Note Deleted",
      description: "Your note has been deleted.",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center mb-3">
        <StickyNote className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="font-semibold text-gray-800">Make Notes</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="newNote" className="text-sm font-medium text-gray-700">
            New Note
          </Label>
          <Textarea
            id="newNote"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write your note here..."
            rows={3}
            className="mt-1"
          />
          <Button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="mt-2 w-full text-white hover:opacity-90"
            style={{ backgroundColor: '#245d7a' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Save Note
          </Button>
        </div>

        {notes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Saved Notes</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded border">
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleSaveEdit(note.id)}
                          size="sm"
                          className="text-white hover:opacity-90"
                          style={{ backgroundColor: '#245d7a' }}
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-800 mb-2">{note.text}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {note.timestamp.toLocaleDateString()} {note.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => handleEditNote(note.id, note.text)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteNote(note.id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
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
        )}
      </div>
    </div>
  );
};

export default NotesSection;
