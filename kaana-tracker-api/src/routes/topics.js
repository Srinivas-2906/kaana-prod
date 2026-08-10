import {
  addTopicReply,
  createTopic,
  getTopic,
  getTopicEditHistory,
  getTopicUnreadSummary,
  listTopics,
  markTopicRead,
  updateDiscussionContent,
  updateTopicStatus,
  updateTopicTitle,
} from '../services/topicService.js';

export function mountProjectTopicRoutes(projectsRouter) {
  projectsRouter.get('/:id/topics', async (req, res) => {
    try {
      const result = await listTopics(
        Number(req.params.id),
        req.user.sub,
        req.query.status || null,
      );
      if (result.error) return res.status(result.status || 403).json({ error: result.error });
      res.json({ topics: result.topics });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load topics' });
    }
  });

  projectsRouter.post('/:id/topics', async (req, res) => {
    try {
      const result = await createTopic(Number(req.params.id), req.body || {}, req.user.sub);
      if (result.error) return res.status(result.status || 400).json({ error: result.error });
      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create topic' });
    }
  });

  projectsRouter.get('/:id/topics/:topicId', async (req, res) => {
    try {
      const result = await getTopic(
        Number(req.params.id),
        Number(req.params.topicId),
        req.user.sub,
      );
      if (result.error) return res.status(result.status || 404).json({ error: result.error });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load topic' });
    }
  });

  projectsRouter.post('/:id/topics/:topicId/replies', async (req, res) => {
    try {
      const result = await addTopicReply(
        Number(req.params.id),
        Number(req.params.topicId),
        req.body?.content,
        req.user.sub,
      );
      if (result.error) return res.status(result.status || 400).json({ error: result.error });
      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to post reply' });
    }
  });

  projectsRouter.patch('/:id/topics/:topicId', async (req, res) => {
    try {
      const projectId = Number(req.params.id);
      const topicId = Number(req.params.topicId);
      const body = req.body || {};
      let result;

      if (body.title !== undefined) {
        result = await updateTopicTitle(projectId, topicId, body.title, req.user.sub);
        if (result.error) return res.status(result.status || 400).json({ error: result.error });
      }
      if (body.status !== undefined) {
        result = await updateTopicStatus(projectId, topicId, body.status, req.user.sub);
        if (result.error) return res.status(result.status || 400).json({ error: result.error });
      }
      if (!result) {
        return res.status(400).json({ error: 'Provide title or status to update' });
      }
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update topic' });
    }
  });

  projectsRouter.patch('/:id/topics/:topicId/replies/:replyId', async (req, res) => {
    try {
      const result = await updateDiscussionContent(
        Number(req.params.id),
        Number(req.params.topicId),
        Number(req.params.replyId),
        req.body?.content,
        req.user.sub,
      );
      if (result.error) return res.status(result.status || 400).json({ error: result.error });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update message' });
    }
  });

  projectsRouter.get('/:id/topics/:topicId/edits', async (req, res) => {
    try {
      const result = await getTopicEditHistory(
        Number(req.params.id),
        Number(req.params.topicId),
        req.user.sub,
      );
      if (result.error) return res.status(result.status || 404).json({ error: result.error });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load edit history' });
    }
  });

  projectsRouter.post('/:id/topics/:topicId/read', async (req, res) => {
    try {
      const result = await markTopicRead(
        Number(req.params.id),
        Number(req.params.topicId),
        req.user.sub,
      );
      if (result.error) return res.status(result.status || 400).json({ error: result.error });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to mark topic read' });
    }
  });

  projectsRouter.get('/:id/topics-unread', async (req, res) => {
    try {
      const result = await getTopicUnreadSummary(Number(req.params.id), req.user.sub);
      if (result.error) return res.status(result.status || 403).json({ error: result.error });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load unread summary' });
    }
  });
}
