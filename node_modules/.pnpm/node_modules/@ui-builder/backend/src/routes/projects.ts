import { Router, Response } from 'express';
import { ProjectModel } from '../models/Project';
import { requireAuth, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const projects = await ProjectModel.find({
    $or: [{ ownerId: userId }, { collaboratorIds: userId }],
  }).sort({ updatedAt: -1 });
  return res.json(projects);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });

  const project = await ProjectModel.create({
    name,
    ownerId: new mongoose.Types.ObjectId(req.user!.userId),
    collaboratorIds: [],
  });
  return res.status(201).json(project);
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const project = await ProjectModel.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Not found' });

  const userId = req.user!.userId;
  const isOwner = project.ownerId.toString() === userId;
  const isCollaborator = project.collaboratorIds.some((c) => c.toString() === userId);

  if (!isOwner && !isCollaborator) return res.status(403).json({ message: 'Forbidden' });
  return res.json(project);
});

router.post('/:id/invite', async (req: AuthRequest, res: Response) => {
  const project = await ProjectModel.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Not found' });
  if (project.ownerId.toString() !== req.user!.userId) return res.status(403).json({ message: 'Only owner can invite' });

  const { userId } = req.body;
  const inviteeId = new mongoose.Types.ObjectId(userId);
  if (!project.collaboratorIds.some((c) => c.equals(inviteeId))) {
    project.collaboratorIds.push(inviteeId);
    await project.save();
  }
  return res.json(project);
});

export default router;
