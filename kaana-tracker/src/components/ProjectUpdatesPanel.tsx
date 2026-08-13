import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bell, MessageSquare, Pencil, Plus, SmilePlus } from 'lucide-react';
import {
  createProjectTopic,
  fetchDiscussions,
  fetchMe,
  fetchProjectTopic,
  fetchProjectTopicEdits,
  fetchProjectTopicUnreadSummary,
  fetchProjectTopics,
  markProjectTopicRead,
  pokeProjectTeam,
  postProjectTopicReply,
  toggleDiscussionReaction,
  updateProjectTopicReply,
  updateProjectTopicStatus,
  updateProjectTopicTitle,
} from '../lib/api';
import { formatRelativeTime } from '../lib/dates';
import { FormattedContent } from './FormattedContent';
import { FormattedTextarea } from './FormattedTextarea';
import {
  MessageAttachments,
  MessageFilePicker,
  uploadFilesToDiscussion,
} from './MessageAttachments';
import { ProjectVibeBar } from './ProjectVibeBar';
import type {
  Discussion, DiscussionReaction, DiscussionTopic, TopicContentEdit, TopicUnreadSummary, WorkItem,
} from '../types';

type StatusFilter = 'all' | 'open' | 'answered' | 'closed';

const STATUS_LABELS: Record<DiscussionTopic['status'], string> = {
  open: 'Open',
  answered: 'Answered',
  closed: 'Closed',
};

const FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  open: 'Open',
  answered: 'Answered',
  closed: 'Closed',
};

const SUGGESTED_PROMPTS = [
  { title: 'Timeline update', content: 'Could you share an updated timeline for the next milestones?' },
  { title: 'Go-live date', content: 'When do you expect the next feature to go live?' },
  { title: 'Issue or blocker', content: 'We hit an issue — can you take a look when you have a moment?' },
  { title: 'Review request', content: 'We have something ready for review. Can you take a look?' },
];

const REACTION_EMOJI = ['👍', '👀', '✅', '💡'] as const;

const REACTION_LABELS: Record<(typeof REACTION_EMOJI)[number], string> = {
  '👍': 'Acknowledge',
  '👀': 'Seen',
  '✅': 'Resolved',
  '💡': 'Noted',
};

const AVATAR_COLORS = ['#475569', '#64748b', '#334155', '#1e40af', '#0f766e', '#4f46e5'];

function statusClass(status: DiscussionTopic['status']) {
  return `topic-status topic-status-${status}`;
}

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function TopicListItem({
  topic,
  active,
  onSelect,
}: {
  topic: DiscussionTopic;
  active: boolean;
  onSelect: () => void;
}) {
  const unread = topic.unread_count || 0;
  return (
    <button
      type="button"
      className={`topic-list-item${active ? ' active' : ''}${unread ? ' has-unread' : ''}`}
      onClick={onSelect}
    >
      <div className="topic-list-item-head">
        <strong>{topic.title}</strong>
        <span className={statusClass(topic.status)}>{STATUS_LABELS[topic.status]}</span>
      </div>
      <p className="muted topic-list-item-meta">
        {topic.created_by_name}
        {' · '}
        {topic.reply_count} message{topic.reply_count === 1 ? '' : 's'}
        {topic.last_reply_at ? ` · ${formatRelativeTime(topic.last_reply_at)}` : ''}
      </p>
      {unread > 0 && (
        <span className="topic-unread-badge">{unread} new</span>
      )}
    </button>
  );
}

function ReactionSummary({ reactions }: { reactions: DiscussionReaction[] }) {
  const active = reactions.filter((r) => r.count > 0);
  if (!active.length) return null;
  return (
    <div className="reply-reaction-summary">
      {active.map((r) => (
        <span
          key={r.emoji}
          className={`reply-reaction-chip${r.mine ? ' mine' : ''}`}
          title={r.users.join(', ')}
        >
          <span className="reply-reaction-emoji">{r.emoji}</span>
          {r.count > 1 && <span className="reply-reaction-count">{r.count}</span>}
        </span>
      ))}
    </div>
  );
}

function ReactionPicker({
  replyId,
  reactions,
  onToggle,
}: {
  replyId: number;
  reactions: DiscussionReaction[];
  onToggle: (emoji: string) => void;
}) {
  if (replyId < 0) return null;
  return (
    <div className="reply-reaction-picker">
      <span className="reply-reaction-picker-label">
        <SmilePlus size={14} />
        React
      </span>
      <div className="reply-reaction-picker-row">
        {REACTION_EMOJI.map((emoji) => {
          const existing = reactions.find((r) => r.emoji === emoji);
          return (
            <button
              key={emoji}
              type="button"
              className={`reply-reaction-btn${existing?.mine ? ' mine' : ''}`}
              onClick={() => onToggle(emoji)}
              title={REACTION_LABELS[emoji]}
              aria-label={REACTION_LABELS[emoji]}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReplyBubble({
  reply,
  isQuestion,
  canEditMessage,
  editing,
  editDraft,
  onEditDraftChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onReact,
  busy,
  canManageFiles,
  onAttachmentsChange,
}: {
  reply: Discussion;
  isQuestion?: boolean;
  canEditMessage: boolean;
  editing: boolean;
  editDraft: string;
  onEditDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onReact: (discussionId: number, emoji: string) => void;
  busy: boolean;
  canManageFiles: boolean;
  onAttachmentsChange?: () => void;
}) {
  const reactions = reply.reactions || [];
  return (
    <article className={`project-updates-item${isQuestion ? ' is-question' : ''}`}>
      <div
        className="project-updates-avatar"
        style={{ background: avatarColor(reply.created_by_name) }}
        aria-hidden
      >
        {reply.created_by_name.charAt(0).toUpperCase()}
      </div>
      <div className="project-updates-body">
        <header>
          <strong>{reply.created_by_name}</strong>
          <span className="muted"> · {formatRelativeTime(reply.created_at)}</span>
          {reply.edited_at && (
            <span className="content-edited-label" title={`Edited ${formatRelativeTime(reply.edited_at)}`}>
              edited
            </span>
          )}
          {isQuestion && <span className="topic-question-label">Original question</span>}
          {canEditMessage && !editing && (
            <button type="button" className="content-edit-btn" onClick={onStartEdit} title="Edit message">
              <Pencil size={13} />
            </button>
          )}
        </header>
        {editing ? (
          <div className="content-edit-form">
            <FormattedTextarea
              value={editDraft}
              onChange={onEditDraftChange}
              rows={4}
            />
            <div className="content-edit-actions">
              <button type="button" className="btn btn-primary btn-compact" disabled={busy || !editDraft.trim()} onClick={onSaveEdit}>
                Save
              </button>
              <button type="button" className="btn btn-ghost btn-compact" disabled={busy} onClick={onCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="project-updates-body-text">
            <FormattedContent text={reply.content} />
          </div>
        )}
        {reply.id > 0 && (
          <MessageAttachments
            discussionId={reply.id}
            initialAttachments={reply.attachments || []}
            canUpload={canManageFiles && !editing}
            canRemove={canEditMessage && !editing}
            onChange={onAttachmentsChange}
          />
        )}
        {!editing && (
          <>
            <ReactionSummary reactions={reactions} />
            <ReactionPicker
              replyId={reply.id}
              reactions={reactions}
              onToggle={(emoji) => onReact(reply.id, emoji)}
            />
          </>
        )}
      </div>
    </article>
  );
}

function summaryText(summary: TopicUnreadSummary | null) {
  if (!summary) return null;
  const parts = [
    summary.open_count > 0 ? `${summary.open_count} open` : null,
    summary.unread_count > 0 ? `${summary.unread_count} unread` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

export function ProjectUpdatesPanel({
  projectId,
  projectName: _projectName,
  stories = [],
  canEdit = true,
  vibeEmoji,
  vibeMessage,
  onVibeUpdate,
  onUnreadChange,
}: {
  projectId: number;
  projectName: string;
  stories?: WorkItem[];
  canEdit?: boolean;
  vibeEmoji?: string | null;
  vibeMessage?: string | null;
  onVibeUpdate?: (emoji: string, message: string) => void;
  onUnreadChange?: (count: number) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(null);
  const [replies, setReplies] = useState<Discussion[]>([]);
  const [legacyMessages, setLegacyMessages] = useState<Discussion[]>([]);
  const [summary, setSummary] = useState<TopicUnreadSummary | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newStoryId, setNewStoryId] = useState<number | ''>('');
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [newTopicFiles, setNewTopicFiles] = useState<File[]>([]);
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [editHistory, setEditHistory] = useState<TopicContentEdit[]>([]);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const statsLine = summaryText(summary);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  const loadSummary = useCallback(() => {
    fetchProjectTopicUnreadSummary(projectId)
      .then((r) => {
        setSummary(r);
        onUnreadChange?.(r.unread_count);
      })
      .catch(() => {});
  }, [projectId, onUnreadChange]);

  const loadTopics = useCallback(() => {
    const status = filter === 'all' ? undefined : filter;
    fetchProjectTopics(projectId, status)
      .then((r) => setTopics(r.topics))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load topics'));
    loadSummary();
  }, [projectId, filter, loadSummary]);

  const loadLegacy = useCallback(() => {
    fetchDiscussions({ entityType: 'cluster', entityId: projectId, limit: 100 })
      .then((r) => setLegacyMessages([...r.discussions].reverse()))
      .catch(() => setLegacyMessages([]));
  }, [projectId]);

  const loadTopicDetail = useCallback((topicId: number, markRead = true) => {
    fetchProjectTopic(projectId, topicId)
      .then((r) => {
        setSelectedTopic(r.topic);
        setReplies(r.replies);
        setEditingTitle(false);
        setEditingReplyId(null);
        if (markRead) {
          markProjectTopicRead(projectId, topicId)
            .then(() => { loadTopics(); loadSummary(); })
            .catch(() => {});
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load topic'));
  }, [projectId, loadTopics, loadSummary]);

  const loadEditHistory = useCallback((topicId: number) => {
    fetchProjectTopicEdits(projectId, topicId)
      .then((r) => setEditHistory(r.edits))
      .catch(() => setEditHistory([]));
  }, [projectId]);

  useEffect(() => { loadTopics(); }, [loadTopics]);
  useEffect(() => { loadLegacy(); }, [loadLegacy]);
  useEffect(() => {
    fetchMe().then((r) => setCurrentUserId(r.user.id)).catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      const id = Number(topicParam);
      if (id) setSelectedId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedId) {
      loadTopicDetail(selectedId);
      loadEditHistory(selectedId);
    } else {
      setSelectedTopic(null);
      setReplies([]);
      setEditHistory([]);
    }
  }, [selectedId, loadTopicDetail, loadEditHistory]);

  useEffect(() => {
    if (!selectedId && topics.length > 0 && !searchParams.get('topic')) {
      setSelectedId(topics[0].id);
    }
  }, [topics, selectedId, searchParams]);

  function selectTopic(id: number) {
    setSelectedId(id);
    const next = new URLSearchParams(searchParams);
    next.set('topic', String(id));
    setSearchParams(next, { replace: true });
  }

  function applyPrompt(prompt: { title: string; content: string }) {
    setNewTitle(prompt.title);
    setNewContent(prompt.content);
    setShowNewForm(true);
  }

  async function onCreateTopic(e: FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    const content = newContent.trim();
    if (!title || !content) return;
    setError('');
    setBusy(true);
    try {
      const result = await createProjectTopic(projectId, {
        title,
        content,
        work_item_id: newStoryId ? Number(newStoryId) : null,
      });
      const firstReplyId = result.replies?.[0]?.id;
      if (firstReplyId && newTopicFiles.length) {
        await uploadFilesToDiscussion(firstReplyId, newTopicFiles);
      }
      setNewTitle('');
      setNewContent('');
      setNewStoryId('');
      setNewTopicFiles([]);
      setShowNewForm(false);
      selectTopic(result.topic.id);
      loadTopics();
      loadLegacy();
      showToast('Topic created');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic');
    } finally {
      setBusy(false);
    }
  }

  async function onReply(e: FormEvent) {
    e.preventDefault();
    if (!selectedId || !replyContent.trim()) return;
    const text = replyContent.trim();
    const filesToUpload = [...replyFiles];
    setError('');
    setBusy(true);

    const optimistic: Discussion = {
      id: -Date.now(),
      entity_type: 'cluster',
      entity_id: projectId,
      topic_id: selectedId,
      content: text,
      created_by: 0,
      created_by_name: 'You',
      created_at: new Date().toISOString(),
      reactions: [],
      attachments: [],
    };
    setReplies((prev) => [...prev, optimistic]);
    setReplyContent('');
    setReplyFiles([]);

    try {
      const result = await postProjectTopicReply(projectId, selectedId, text);
      if (result.reply?.id && filesToUpload.length) {
        await uploadFilesToDiscussion(result.reply.id, filesToUpload);
      }
      loadTopicDetail(selectedId, true);
      loadTopics();
    } catch (err) {
      setReplies((prev) => prev.filter((r) => r.id !== optimistic.id));
      setReplyContent(text);
      setReplyFiles(filesToUpload);
      setError(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setBusy(false);
    }
  }

  async function onStatusChange(status: DiscussionTopic['status']) {
    if (!selectedId || !selectedTopic) return;
    setBusy(true);
    try {
      const result = await updateProjectTopicStatus(projectId, selectedId, status);
      setSelectedTopic(result.topic);
      setReplies(result.replies);
      loadTopics();
      if (status === 'answered') showToast('Marked as answered');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setBusy(false);
    }
  }

  async function onReact(discussionId: number, emoji: string) {
    if (discussionId < 0) return;
    try {
      await toggleDiscussionReaction(discussionId, emoji);
      if (selectedId) loadTopicDetail(selectedId, false);
    } catch {
      showToast('Could not add reaction');
    }
  }

  async function onNotifyTeam() {
    setNotifying(true);
    try {
      const result = await pokeProjectTeam(projectId);
      showToast(result.message || 'Team notified');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not notify team');
    } finally {
      setNotifying(false);
    }
  }

  function canEditMessage(authorId: number) {
    if (currentUserId == null) return false;
    return authorId === currentUserId || canEdit;
  }

  function canEditTopicTitle() {
    if (!selectedTopic || currentUserId == null) return false;
    return selectedTopic.created_by === currentUserId || canEdit;
  }

  function canAttachFiles() {
    return currentUserId != null;
  }

  async function onSaveTitle() {
    if (!selectedId || !titleDraft.trim()) return;
    setBusy(true);
    try {
      const result = await updateProjectTopicTitle(projectId, selectedId, titleDraft.trim());
      setSelectedTopic(result.topic);
      setReplies(result.replies);
      setEditingTitle(false);
      loadTopics();
      loadEditHistory(selectedId);
      showToast('Title updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update title');
    } finally {
      setBusy(false);
    }
  }

  async function onSaveReplyEdit(replyId: number) {
    if (!selectedId || !replyDraft.trim()) return;
    setBusy(true);
    try {
      const result = await updateProjectTopicReply(projectId, selectedId, replyId, replyDraft.trim());
      setSelectedTopic(result.topic);
      setReplies(result.replies);
      setEditingReplyId(null);
      loadEditHistory(selectedId);
      showToast('Message updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
    } finally {
      setBusy(false);
    }
  }

  function editHistoryLabel(edit: TopicContentEdit) {
    if (edit.target_type === 'topic_title') return 'Topic title';
    return 'Message';
  }

  function editHistoryPreview(value: string | null, max = 120) {
    if (!value) return '(empty)';
    const flat = value.replace(/\s+/g, ' ').trim();
    return flat.length > max ? `${flat.slice(0, max)}…` : flat;
  }

  return (
    <div className="project-updates-layout">
      {toast && <div className="app-toast">{toast}</div>}

      <div className="card project-updates-panel">
        <div className="project-updates-head project-updates-head-compact">
          <div className="updates-toolbar">
            <h3 className="updates-panel-title">
              <MessageSquare size={16} />
              Updates &amp; Q&amp;A
            </h3>
            <div className="updates-panel-actions">
              <button
                type="button"
                className="btn btn-ghost btn-notify btn-compact"
                onClick={onNotifyTeam}
                disabled={notifying}
                title="Notify team"
              >
                <Bell size={15} />
                <span className="btn-compact-label">Notify</span>
              </button>
              <button type="button" className="btn btn-primary btn-compact" onClick={() => setShowNewForm((v) => !v)}>
                <Plus size={15} /> New
              </button>
            </div>
          </div>

          <div className="updates-meta-row">
            <ProjectVibeBar
              projectId={projectId}
              emoji={vibeEmoji}
              message={vibeMessage}
              onUpdate={onVibeUpdate}
              compact
            />
            {statsLine && (
              <span className="topic-summary-inline">{statsLine}</span>
            )}
            <div className="topic-filter-row topic-filter-row-inline">
              {(['all', 'open', 'answered', 'closed'] as StatusFilter[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`btn btn-ghost topic-filter-btn${filter === value ? ' active' : ''}`}
                  onClick={() => setFilter(value)}
                >
                  {FILTER_LABELS[value]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="updates-panel-error">{error}</p>}

        {showNewForm && (
          <form className="topic-new-form" onSubmit={onCreateTopic}>
            <input
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Topic title — e.g. App Store submission timeline"
            />
            {stories.length > 0 && (
              <select
                value={newStoryId}
                onChange={(e) => setNewStoryId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Link to story (optional)</option>
                {stories.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            )}
            <FormattedTextarea
              required
              value={newContent}
              onChange={setNewContent}
              placeholder="Describe your question or update…"
              rows={3}
            />
            <MessageFilePicker
              id="new-topic-files"
              files={newTopicFiles}
              onChange={setNewTopicFiles}
              disabled={busy}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={busy}>Create topic</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNewForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {!topics.length && !showNewForm && (
          <div className="topic-suggested-prompts">
            <p className="muted">Suggested starters:</p>
            <div className="topic-prompt-chips">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  className="topic-prompt-chip"
                  onClick={() => applyPrompt(p)}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="topic-master-detail">
          <div className="topic-list">
            {topics.map((topic) => (
              <TopicListItem
                key={topic.id}
                topic={topic}
                active={topic.id === selectedId}
                onSelect={() => selectTopic(topic.id)}
              />
            ))}
            {!topics.length && (
              <p className="muted topic-list-empty">No topics yet — start one for each question.</p>
            )}
          </div>

          <div className="topic-detail">
            {selectedTopic ? (
              <>
                <div className="topic-detail-head">
                  <div>
                    {editingTitle ? (
                      <div className="topic-title-edit">
                        <input
                          value={titleDraft}
                          onChange={(e) => setTitleDraft(e.target.value)}
                          maxLength={200}
                        />
                        <div className="content-edit-actions">
                          <button type="button" className="btn btn-primary btn-compact" disabled={busy || !titleDraft.trim()} onClick={onSaveTitle}>
                            Save
                          </button>
                          <button type="button" className="btn btn-ghost btn-compact" disabled={busy} onClick={() => setEditingTitle(false)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="topic-title-row">
                        <h4 style={{ margin: '0 0 0.25rem' }}>{selectedTopic.title}</h4>
                        {canEditTopicTitle() && (
                          <button
                            type="button"
                            className="content-edit-btn"
                            title="Edit title"
                            onClick={() => {
                              setTitleDraft(selectedTopic.title);
                              setEditingTitle(true);
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="muted" style={{ margin: 0 }}>
                      Started by {selectedTopic.created_by_name}
                      {' · '}
                      <span className={statusClass(selectedTopic.status)}>
                        {STATUS_LABELS[selectedTopic.status]}
                      </span>
                      {selectedTopic.title_edited_at && (
                        <>
                          {' · '}
                          <span className="content-edited-label" title={`Title edited ${formatRelativeTime(selectedTopic.title_edited_at)}`}>
                            title edited
                          </span>
                        </>
                      )}
                    </p>
                    {selectedTopic.work_item_id && selectedTopic.work_item_title && (
                      <p className="muted" style={{ margin: '0.375rem 0 0' }}>
                        Linked story:{' '}
                        <Link to={`/work/${selectedTopic.work_item_id}`}>{selectedTopic.work_item_title}</Link>
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="topic-status-actions">
                      {selectedTopic.status !== 'open' && (
                        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => onStatusChange('open')}>
                          Reopen
                        </button>
                      )}
                      {selectedTopic.status !== 'answered' && (
                        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => onStatusChange('answered')}>
                          Mark answered
                        </button>
                      )}
                      {selectedTopic.status !== 'closed' && (
                        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => onStatusChange('closed')}>
                          Close
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="project-updates-thread">
                  {replies.map((reply, idx) => (
                    <ReplyBubble
                      key={reply.id}
                      reply={reply}
                      isQuestion={idx === 0}
                      canEditMessage={canEditMessage(reply.created_by)}
                      editing={editingReplyId === reply.id}
                      editDraft={replyDraft}
                      onEditDraftChange={setReplyDraft}
                      onStartEdit={() => {
                        setEditingReplyId(reply.id);
                        setReplyDraft(reply.content);
                      }}
                      onSaveEdit={() => onSaveReplyEdit(reply.id)}
                      onCancelEdit={() => setEditingReplyId(null)}
                      onReact={onReact}
                      busy={busy}
                      canManageFiles={canAttachFiles()}
                      onAttachmentsChange={() => selectedId && loadTopicDetail(selectedId, false)}
                    />
                  ))}
                </div>

                {editHistory.length > 0 && (
                  <details
                    className="topic-edit-history"
                    open={showEditHistory}
                    onToggle={(e) => setShowEditHistory((e.target as HTMLDetailsElement).open)}
                  >
                    <summary>Edit history ({editHistory.length})</summary>
                    <ul className="topic-edit-history-list">
                      {editHistory.map((edit) => (
                        <li key={edit.id} className="topic-edit-history-item">
                          <div className="topic-edit-history-head">
                            <strong>{edit.actor_name}</strong>
                            <span className="muted"> · {editHistoryLabel(edit)} · {formatRelativeTime(edit.created_at)}</span>
                          </div>
                          <p className="muted topic-edit-history-diff">
                            <span>{editHistoryPreview(edit.old_value)}</span>
                            {' → '}
                            <span>{editHistoryPreview(edit.new_value)}</span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                <form onSubmit={onReply} className="topic-reply-form">
                  <FormattedTextarea
                    value={replyContent}
                    onChange={setReplyContent}
                    placeholder="Write a reply…"
                    rows={3}
                  />
                  <MessageFilePicker
                    id="topic-reply-files"
                    files={replyFiles}
                    onChange={setReplyFiles}
                    disabled={busy}
                  />
                  <button type="submit" className="btn btn-primary" disabled={busy || !replyContent.trim()}>
                    Reply
                  </button>
                </form>
              </>
            ) : (
              <p className="muted topic-detail-empty">Select a topic or create a new one.</p>
            )}
          </div>
        </div>
      </div>

      {legacyMessages.length > 0 && (
        <details className="card project-updates-legacy">
          <summary>
            <span>Earlier general updates</span>
            <span className="muted"> ({legacyMessages.length})</span>
          </summary>
          <p className="muted">Messages posted before topics were enabled.</p>
          <div className="project-updates-thread">
            {legacyMessages.map((d) => (
              <ReplyBubble
                key={d.id}
                reply={d}
                canEditMessage={false}
                editing={false}
                editDraft=""
                onEditDraftChange={() => {}}
                onStartEdit={() => {}}
                onSaveEdit={() => {}}
                onCancelEdit={() => {}}
                onReact={onReact}
                busy={false}
                canManageFiles={canAttachFiles()}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
