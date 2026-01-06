import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, Trash2, Search, Moon, Sun, Palette, Eye, Pen } from 'lucide-react';

const themes = {
    monterey: {
        name: 'Monterey',
        bg: 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400',
        glass: 'bg-white/70 backdrop-blur-2xl',
        darkGlass: 'bg-gray-900/80 backdrop-blur-2xl',
        text: 'text-gray-900',
        darkText: 'text-white',
        accent: 'from-blue-500 to-purple-500',
        border: 'border-white/50',
        darkBorder: 'border-white/20'
    },
    ventura: {
        name: 'Ventura',
        bg: 'bg-gradient-to-br from-orange-300 via-rose-300 to-purple-400',
        glass: 'bg-white/75 backdrop-blur-2xl',
        darkGlass: 'bg-gray-900/85 backdrop-blur-2xl',
        text: 'text-gray-900',
        darkText: 'text-white',
        accent: 'from-orange-500 to-rose-500',
        border: 'border-white/60',
        darkBorder: 'border-white/20'
    },
    sonoma: {
        name: 'Sonoma',
        bg: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500',
        glass: 'bg-white/70 backdrop-blur-2xl',
        darkGlass: 'bg-gray-900/80 backdrop-blur-2xl',
        text: 'text-gray-900',
        darkText: 'text-white',
        accent: 'from-emerald-500 to-teal-500',
        border: 'border-white/50',
        darkBorder: 'border-white/20'
    },
    sequoia: {
        name: 'Sequoia',
        bg: 'bg-gradient-to-br from-indigo-400 via-blue-400 to-cyan-400',
        glass: 'bg-white/75 backdrop-blur-2xl',
        darkGlass: 'bg-gray-900/85 backdrop-blur-2xl',
        text: 'text-gray-900',
        darkText: 'text-white',
        accent: 'from-indigo-500 to-blue-500',
        border: 'border-white/60',
        darkBorder: 'border-white/20'
    }
};

export default function WilerNotepad() {
    // Persistence Logic: Load from localStorage or use default
    const [notes, setNotes] = useState(() => {
        try {
            const saved = localStorage.getItem('wiler-notes-data');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to load notes", e);
        }
        // Default welcome note
        return [{
            id: 1,
            title: 'Notes',
            content: '# Bienvenue sur WilerNotes 📝\n\nCeci est votre espace de notes **enrichi**.\n\n- Support Markdown\n- Sauvegarde automatique\n- Design Wiler\n\nEssayez de changer le thème !',
            folder: 'Personnel',
            date: new Date().toISOString()
        }];
    });

    const [selectedNote, setSelectedNote] = useState(notes[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDark, setIsDark] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('monterey');
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [isPreview, setIsPreview] = useState(false); // New: Preview Mode

    const theme = themes[currentTheme];

    // Persistence: Save on any change to notes
    useEffect(() => {
        localStorage.setItem('wiler-notes-data', JSON.stringify(notes));
    }, [notes]);

    // Ensure selected note stays in sync with persistence list
    useEffect(() => {
        if (selectedNote) {
            const current = notes.find(n => n.id === selectedNote.id);
            if (current && (current.title !== selectedNote.title || current.content !== selectedNote.content)) {
                // This is redundant if we update specific fields, but safety check.
                // Actually, if we switch notes, we just set selectedNote.
            }
        }
    }, [notes]);

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addNote = () => {
        const newNote = {
            id: Date.now(),
            title: 'Nouvelle note',
            content: '',
            folder: 'Personnel',
            date: new Date().toISOString()
        };
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
        setIsPreview(false); // Switch to edit mode for new note
    };

    const deleteNote = (id, e) => {
        e.stopPropagation();
        const filtered = notes.filter(n => n.id !== id);
        setNotes(filtered);
        if (selectedNote?.id === id) {
            setSelectedNote(filtered[0] || null);
        }
    };

    const updateNote = (field, value) => {
        const updatedNotes = notes.map(n =>
            n.id === selectedNote.id ? { ...n, [field]: value, date: new Date().toISOString() } : n
        );
        setNotes(updatedNotes);
        // Important: Update selectedNote local state too so input reflects change immediately
        setSelectedNote(prev => ({ ...prev, [field]: value, date: new Date().toISOString() }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (hours < 1) return 'À l\'instant';
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const getPreview = (content) => {
        // Strip markdown chars roughly for preview
        const text = content.replace(/[#*`_]/g, '');
        const firstLine = text.split('\n')[0];
        return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
    };

    const handleWindowControl = (action) => {
        if (window.electronAPI) {
            window.electronAPI.send('window-controls', action);
        }
    };

    return (
        <div className={`min-h-screen ${theme.bg} transition-all duration-700 ease-in-out font-sans overflow-hidden rounded-xl`}>
            <div className="h-screen flex">
                {/* Sidebar */}
                <div className={`w-64 ${isDark ? theme.darkGlass : theme.glass} ${isDark ? theme.darkBorder : theme.border} border-r flex flex-col`}>

                    {/* Custom Drag Region */}
                    <div className="h-10 flex items-center px-4 gap-2 select-none" style={{ WebkitAppRegion: 'drag' }}>
                        <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
                            <button onClick={() => handleWindowControl('close')} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 shadow-sm group flex items-center justify-center">
                                <span className="hidden group-hover:block text-[8px] text-black/50 font-bold">x</span>
                            </button>
                            <button onClick={() => handleWindowControl('minimize')} className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-sm group flex items-center justify-center">
                                <span className="hidden group-hover:block text-[8px] text-black/50 font-bold">-</span>
                            </button>
                            <button onClick={() => handleWindowControl('maximize')} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 shadow-sm group flex items-center justify-center">
                                <span className="hidden group-hover:block text-[8px] text-black/50 font-bold">+</span>
                            </button>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="px-4 pb-4 border-b border-black/5">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className={`text-2xl font-semibold ${isDark ? theme.darkText : theme.text}`}>Notes</h1>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors relative`}
                                >
                                    <Palette className={`w-5 h-5 ${isDark ? theme.darkText : theme.text}`} />
                                    {showThemeMenu && (
                                        <div className={`absolute top-full right-0 mt-2 ${isDark ? theme.darkGlass : theme.glass} rounded-xl shadow-2xl border ${isDark ? theme.darkBorder : theme.border} p-2 w-40 z-50`}>
                                            {Object.entries(themes).map(([key, t]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        setCurrentTheme(key);
                                                        setShowThemeMenu(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors ${isDark ? theme.darkText : theme.text} text-sm`}
                                                >
                                                    {t.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsDark(!isDark)}
                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors`}
                                >
                                    {isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className={`w-5 h-5 ${theme.text}`} />}
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={addNote}
                            className={`w-full bg-gradient-to-r ${theme.accent} text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2`}
                        >
                            <Plus className="w-5 h-5" />
                            Nouvelle note
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 pt-2">
                        <div className={`flex items-center gap-2 ${isDark ? 'bg-white/10' : 'bg-black/5'} rounded-lg px-3 py-2`}>
                            <Search className={`w-4 h-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
                            <input
                                type="text"
                                placeholder="Rechercher"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder-white/40' : 'text-gray-900 placeholder-gray-500'} text-sm`}
                            />
                        </div>
                    </div>

                    {/* Notes List */}
                    <div className="flex-1 overflow-y-auto px-2">
                        {filteredNotes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => { setSelectedNote(note); if (window.innerWidth < 768) setIsPreview(true); }}
                                className={`group mb-1 px-3 py-3 rounded-lg cursor-pointer transition-all ${selectedNote?.id === note.id
                                        ? isDark ? 'bg-white/15' : 'bg-black/10'
                                        : isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className={`font-semibold text-sm ${isDark ? theme.darkText : theme.text} truncate flex-1`}>
                                        {note.title}
                                    </h3>
                                    <button
                                        onClick={(e) => deleteNote(note.id, e)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                    >
                                        <Trash2 className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                                    </button>
                                </div>
                                <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'} mb-1`}>
                                    {formatDate(note.date)}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'} truncate`}>
                                    {getPreview(note.content) || 'Aucun contenu'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className={`flex-1 ${isDark ? theme.darkGlass : theme.glass} flex flex-col`}>
                    <div className="h-10 w-full" style={{ WebkitAppRegion: 'drag' }}></div>

                    {selectedNote ? (
                        <>
                            {/* Note Header */}
                            <div className={`px-8 py-2 border-b ${isDark ? 'border-white/10' : 'border-black/5'} flex justify-between items-start`}>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={selectedNote.title}
                                        onChange={(e) => updateNote('title', e.target.value)}
                                        className={`w-full text-3xl font-bold bg-transparent outline-none ${isDark ? theme.darkText : theme.text} mb-2`}
                                    />
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className={`${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                            {formatDate(selectedNote.date)}
                                        </span>
                                        <span className={`${isDark ? 'text-white/40' : 'text-gray-400'}`}>•</span>
                                        <span className={`${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                            {selectedNote.content.length} caractères
                                        </span>
                                    </div>
                                </div>

                                {/* View/Edit Toggle */}
                                <button
                                    onClick={() => setIsPreview(!isPreview)}
                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors ml-4`}
                                    title={isPreview ? "Modifier" : "Aperçu"}
                                >
                                    {isPreview ?
                                        <Pen className={`w-5 h-5 ${isDark ? theme.darkText : theme.text}`} /> :
                                        <Eye className={`w-5 h-5 ${isDark ? theme.darkText : theme.text}`} />
                                    }
                                </button>
                            </div>

                            {/* Note Content */}
                            <div className="flex-1 overflow-y-auto p-8 relative">
                                {isPreview ? (
                                    <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none ${isDark ? theme.darkText : theme.text}`}>
                                        <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <textarea
                                        value={selectedNote.content}
                                        onChange={(e) => updateNote('content', e.target.value)}
                                        placeholder="Commencez à écrire... (Markdown supporté)"
                                        className={`w-full h-full bg-transparent outline-none resize-none ${isDark ? theme.darkText : theme.text} ${isDark ? 'placeholder-white/30' : 'placeholder-gray-400'} text-base leading-relaxed font-mono`}
                                        autoFocus
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'} flex items-center justify-center`}>
                                    <Plus className={`w-12 h-12 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                                </div>
                                <p className={`text-xl ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                    Sélectionnez une note ou créez-en une nouvelle
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
