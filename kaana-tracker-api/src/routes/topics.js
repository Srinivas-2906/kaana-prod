import {
  addTopicReply,
  createTopic,
  getTopic,
  getTopicUnreadSummary,
  listTopics,
  markTopicRead,
  updateTopicStatus,
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
      const result = await updateTopicStatus(
        Number(req.params.id),
        Number(req.params.topicId),
        req.body?.status,
        req.user.sub,
      );
      if (result.error) return res.status(result.status || 400).json({ error: result.error });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update topic' });
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
