import express, { Request, Response } from 'express';
import User from '../schemas/user';
import Count from '../schemas/count';

const router = express.Router();

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id/count', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const user = await Count.findById(id);

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/new', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.query;

    const user = new User({ username, email, password });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { username, email, password } = req.query;

    const user = await User.findByIdAndUpdate(
      id,
      { username, email, password },
      { new: true }
    );
    await user?.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
