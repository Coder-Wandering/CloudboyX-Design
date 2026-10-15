import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  MessageSquareCode,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Clock,
  Tag,
  User,
  Shield,
  EyeOff,
  Filter,
  Search,
  AlertCircle,
  FileCode,
  Layers,
  ChevronDown,
  Edit2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { BlockInstance, BlockComment, CommentTag } from '../types';

interface BlockCommentsPanelProps {
  blocks: BlockInstance[];
  selectedBlock: BlockInstance | null;
  onSelectBlock: (blockId: string) => void;
  onUpdateComments: (blockId: string, comments: BlockComment[]) => void;
  isDark?: boolean;
}

const TAG_CONFIG: Record<
  CommentTag,
  { label: string; bg: string; text: string; border: string }
> = {
  TODO: {
    label: 'TODO',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700/60',
  },
  FIXME: {
    label: 'FIXME',
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700/60',
  },
  NOTE: {
    label: 'NOTE',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700/60',
  },
  REVIEW: {
    label: 'REVIEW',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700/60',
  },
  DESIGN: {
    label: 'DESIGN',
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-300 dark:border-pink-700/60',
  },
  API: {
    label: 'API',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700/60',
  },
};

const DEFAULT_AUTHORS = [
  'Lead Developer',
  'Frontend Engineer',
  'UI/UX Designer',
  'Technical Architect',
  'QA Specialist',
  'Client Reviewer',
];

export const BlockCommentsPanel: React.FC<BlockCommentsPanelProps> = ({
  blocks,
  selectedBlock,
  onSelectBlock,
  onUpdateComments,
  isDark = false,
}) => {
  const [viewScope, setViewScope] = useState<'current' | 'all'>('current');
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState<CommentTag>('TODO');
  const [authorName, setAuthorName] = useState('Frontend Engineer');
  const [filterTag, setFilterTag] = useState<'ALL' | CommentTag>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Target block for adding new comments
  const activeBlock = selectedBlock || blocks[0] || null;

  // Aggregate all comments across project
  const allComments = useMemo(() => {
    const list: { comment: BlockComment; block: BlockInstance }[] = [];
    blocks.forEach((b) => {
      if (b.comments && Array.isArray(b.comments)) {
        b.comments.forEach((c) => {
          list.push({ comment: c, block: b });
        });
      }
    });
    return list;
  }, [blocks]);

  // Comments for current active block
  const currentBlockComments = useMemo(() => {
    if (!activeBlock || !activeBlock.comments) return [];
    return activeBlock.comments;
  }, [activeBlock]);

  // Filtered comments based on current scope
  const filteredComments = useMemo(() => {
    let list: { comment: BlockComment; block: BlockInstance }[] = [];

    if (viewScope === 'current') {
      if (activeBlock) {
        (activeBlock.comments || []).forEach((c) => {
          list.push({ comment: c, block: activeBlock });
        });
      }
    } else {
      list = allComments;
    }

    return list.filter(({ comment }) => {
      // Filter by tag
      if (filterTag !== 'ALL' && comment.tag !== filterTag) return false;
      // Filter by status
      if (filterStatus === 'ACTIVE' && comment.resolved) return false;
      if (filterStatus === 'RESOLVED' && !comment.resolved) return false;
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          comment.text.toLowerCase().includes(q) ||
          comment.author.toLowerCase().includes(q) ||
          (comment.blockName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [viewScope, activeBlock, allComments, filterTag, filterStatus, searchQuery]);

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeBlock || !newCommentText.trim()) return;

    const newComment: BlockComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      blockId: activeBlock.id,
      blockName: activeBlock.name || activeBlock.type,
      text: newCommentText.trim(),
      author: authorName.trim() || 'Developer',
      tag: selectedTag,
      createdAt: Date.now(),
      resolved: false,
    };

    const existing = activeBlock.comments || [];
    onUpdateComments(activeBlock.id, [newComment, ...existing]);
    setNewCommentText('');
  };

  const handleToggleResolved = (blockId: string, commentId: string) => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock || !targetBlock.comments) return;

    const updated = targetBlock.comments.map((c) =>
      c.id === commentId ? { ...c, resolved: !c.resolved, updatedAt: Date.now() } : c
    );
    onUpdateComments(blockId, updated);
  };

  const handleDeleteComment = (blockId: string, commentId: string) => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock || !targetBlock.comments) return;

    const updated = targetBlock.comments.filter((c) => c.id !== commentId);
    onUpdateComments(blockId, updated);
  };

  const handleSaveEdit = (blockId: string, commentId: string) => {
    if (!editingText.trim()) return;
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock || !targetBlock.comments) return;

    const updated = targetBlock.comments.map((c) =>
      c.id === commentId ? { ...c, text: editingText.trim(), updatedAt: Date.now() } : c
    );
    onUpdateComments(blockId, updated);
    setEditingCommentId(null);
    setEditingText('');
  };

  return (
    <div className="h-full flex flex-col space-y-3.5 text-xs select-none" id="developer-comments-panel">
      {/* Top Banner: Hidden Developer Notes Guarantee */}
      <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-2xs ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-300'
          : 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950'
      }`}>
        <div className="flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-indigo-500 shrink-0" />
          <div className="leading-tight">
            <span className="font-bold text-[11px] block">Hidden Developer Notes</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Internal annotations only · Never rendered in public HTML
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 shrink-0">
          Private
        </span>
      </div>

      {/* Target Block Selector & Scope Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setViewScope('current')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
              viewScope === 'current'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Selected Block ({currentBlockComments.length})
          </button>
          <button
            type="button"
            onClick={() => setViewScope('all')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
              viewScope === 'all'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Blocks ({allComments.length})
          </button>
        </div>

        {/* Block Selector Dropdown if multiple blocks exist */}
        {blocks.length > 0 && (
          <div className="relative">
            <select
              value={activeBlock?.id || ''}
              onChange={(e) => onSelectBlock(e.target.value)}
              className={`text-[11px] font-semibold py-1 px-2 rounded-lg border outline-none cursor-pointer max-w-[140px] truncate ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {blocks.map((b, idx) => (
                <option key={b.id} value={b.id}>
                  #{idx + 1} {b.name || b.type}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Add New Comment Box */}
      <form
        onSubmit={handleAddComment}
        className={`p-3 rounded-xl border space-y-2.5 shadow-2xs ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <MessageSquareCode className="w-3.5 h-3.5 text-blue-500" />
            <span>Attach Developer Note to #{blocks.findIndex((b) => b.id === activeBlock?.id) + 1} {activeBlock?.name || 'Block'}</span>
          </span>
          <span className="text-[10px] text-slate-400">Ctrl+Enter to save</span>
        </div>

        <textarea
          rows={2}
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleAddComment();
            }
          }}
          placeholder="e.g., TODO: Replace temporary hero image with client-approved SVG icon set..."
          className={`w-full text-xs p-2 rounded-lg border outline-none resize-none transition ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500'
              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500'
          }`}
        />

        {/* Metadata Selectors: Tag, Author, and Submit */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Tag Pills */}
            <div className="flex items-center gap-1">
              {(['TODO', 'FIXME', 'NOTE', 'REVIEW', 'DESIGN', 'API'] as CommentTag[]).map((t) => {
                const conf = TAG_CONFIG[t];
                const isSelected = selectedTag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTag(t)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                      isSelected
                        ? `${conf.bg} ${conf.text} ${conf.border} ring-1 ring-current`
                        : 'opacity-50 hover:opacity-100 border-transparent text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Author Dropdown */}
            <select
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={`text-[10px] font-medium px-2 py-0.5 rounded border outline-none ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {DEFAULT_AUTHORS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3 h-3" />
            <span>Add Note</span>
          </button>
        </div>
      </form>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-1.5 pt-1">
        <div className={`flex-1 flex items-center gap-1 px-2 py-1 rounded-lg border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className="w-3 h-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full text-[11px] bg-transparent outline-none"
          />
        </div>

        {/* Tag Filter */}
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value as any)}
          className={`text-[10px] font-semibold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <option value="ALL">All Tags</option>
          <option value="TODO">TODO</option>
          <option value="FIXME">FIXME</option>
          <option value="NOTE">NOTE</option>
          <option value="REVIEW">REVIEW</option>
          <option value="DESIGN">DESIGN</option>
          <option value="API">API</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className={`text-[10px] font-semibold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="RESOLVED">Resolved Only</option>
        </select>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredComments.length === 0 ? (
          <div className="p-6 text-center space-y-2 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-7 h-7 mx-auto text-slate-400 opacity-50" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              No developer comments found
            </p>
            <p className="text-[11px] text-slate-400">
              Attach internal notes or TODOs to this section to guide team members or keep design decisions documented.
            </p>
          </div>
        ) : (
          filteredComments.map(({ comment, block }) => {
            const conf = TAG_CONFIG[comment.tag] || TAG_CONFIG.NOTE;
            const isEditing = editingCommentId === comment.id;

            return (
              <div
                key={comment.id}
                className={`p-3 rounded-xl border transition-all space-y-2 ${
                  comment.resolved
                    ? isDark
                      ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                      : 'bg-slate-50 border-slate-200/60 opacity-70'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 shadow-2xs'
                    : 'bg-white border-slate-200/90 shadow-2xs'
                }`}
              >
                {/* Header: Tag, Section, Author, Time, Actions */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                    >
                      {conf.label}
                    </span>

                    {/* Target block badge */}
                    <button
                      type="button"
                      onClick={() => onSelectBlock(block.id)}
                      className="text-[10px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{block.name || block.type}</span>
                    </button>
                  </div>

                  {/* Actions: Resolve Toggle, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleResolved(block.id, comment.id)}
                      className={`p-1 rounded transition cursor-pointer ${
                        comment.resolved
                          ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={comment.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingText(comment.text);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                      title="Edit note"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteComment(block.id, comment.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Body: Note text or Edit Input */}
                {isEditing ? (
                  <div className="space-y-1.5">
                    <textarea
                      rows={2}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className={`w-full text-xs p-2 rounded border outline-none ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingCommentId(null)}
                        className="px-2 py-0.5 rounded text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(block.id, comment.id)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`text-xs whitespace-pre-wrap leading-relaxed ${
                      comment.resolved
                        ? 'line-through text-slate-400'
                        : isDark
                        ? 'text-slate-200'
                        : 'text-slate-800'
                    }`}
                  >
                    {comment.text}
                  </p>
                )}

                {/* Footer: Author & Timestamp */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{comment.author}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
