import express from 'express';

const router = express.Router();

router.get('/ping', (req, res) => {
  res.send({ message: 'pong' });
});

export default router;
