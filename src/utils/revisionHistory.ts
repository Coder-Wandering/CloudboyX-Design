import { BlockInstance, SiteTheme, SeoSettings, ProjectRevision, REVISIONS_STORAGE_KEY } from '../types';

const MAX_STORED_REVISIONS = 50;

/**
 * Safely retrieves all stored project revisions from the browser's localStorage.
 */
export function getStoredRevisions(): ProjectRevision[] {
  try {
    const raw = localStorage.getItem(REVISIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.warn('Failed to load project revisions from localStorage:', err);
    return [];
  }
}

/**
 * Persists the array of revisions into localStorage.
 */
function persistRevisions(revisions: ProjectRevision[]): void {
  try {
    const pruned = revisions.slice(0, MAX_STORED_REVISIONS);
    localStorage.setItem(REVISIONS_STORAGE_KEY, JSON.stringify(pruned));
  } catch (err) {
    console.warn('Failed to persist project revisions to localStorage:', err);
  }
}

/**
 * Saves a new revision snapshot into the browser's localStorage.
 */
export function createRevisionSnapshot(params: {
  blocks: BlockInstance[];
  theme: SiteTheme;
  title: string;
  seoSettings?: SeoSettings;
  type?: 'autosave' | 'manual' | 'restore_point';
  label?: string;
  description?: string;
}): ProjectRevision {
  const currentRevisions = getStoredRevisions();
  const timestamp = Date.now();
  const id = `rev-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

  const sectionNames = params.blocks.map((b) => b.name || b.type);

  const newRevision: ProjectRevision = {
    id,
    timestamp,
    title: params.title || 'Untitled Project',
    blockCount: params.blocks.length,
    blocks: JSON.parse(JSON.stringify(params.blocks)),
    theme: JSON.parse(JSON.stringify(params.theme)),
    seoSettings: params.seoSettings ? JSON.parse(JSON.stringify(params.seoSettings)) : undefined,
    type: params.type || 'autosave',
    label: params.label,
    description: params.description,
    sectionNames,
  };

  const updatedList = [newRevision, ...currentRevisions];
  persistRevisions(updatedList);
  return newRevision;
}

/**
 * Checks whether the current state differs significantly from the most recent revision.
 * Prevents spamming duplicate snapshots if nothing meaningful changed.
 */
export function hasStateChanged(
  latestRevision: ProjectRevision | null,
  blocks: BlockInstance[],
  theme: SiteTheme,
  title: string
): boolean {
  if (!latestRevision) return true;
  if (latestRevision.title !== title) return true;
  if (latestRevision.blockCount !== blocks.length) return true;
  if (latestRevision.theme?.primaryColor !== theme.primaryColor) return true;
  if (latestRevision.theme?.fontFamily !== theme.fontFamily) return true;

  // Compare block ids and names
  for (let i = 0; i < blocks.length; i++) {
    const curr = blocks[i];
    const prev = latestRevision.blocks[i];
    if (!prev || curr.id !== prev.id || curr.type !== prev.type || curr.name !== prev.name) {
      return true;
    }
  }

  // Quick JSON length check or serialization comparison
  const currJson = JSON.stringify({ blocks, theme, title });
  const prevJson = JSON.stringify({
    blocks: latestRevision.blocks,
    theme: latestRevision.theme,
    title: latestRevision.title,
  });

  return currJson !== prevJson;
}

/**
 * Deletes a single revision by ID.
 */
export function deleteStoredRevision(id: string): ProjectRevision[] {
  const current = getStoredRevisions();
  const filtered = current.filter((rev) => rev.id !== id);
  persistRevisions(filtered);
  return filtered;
}

/**
 * Clears all stored revisions.
 */
export function clearAllStoredRevisions(): void {
  try {
    localStorage.removeItem(REVISIONS_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear revisions:', err);
  }
}

/**
 * Formats relative timestamp for user-friendly display.
 */
export function formatRevisionRelativeTime(timestamp: number, currentNow: number = Date.now()): string {
  const diffSec = Math.max(0, Math.floor((currentNow - timestamp) / 1000));
  if (diffSec < 20) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Formats exact timestamp.
 */
export function formatRevisionExactTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
