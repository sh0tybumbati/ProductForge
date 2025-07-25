import { Router } from 'express';
import { 
  getLines, 
  getLine, 
  createLine, 
  updateLine, 
  deleteLine 
} from '../controllers/lineController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getLines);
router.post('/', createLine);
router.get('/:id', getLine);
router.put('/:id', updateLine);
router.delete('/:id', deleteLine);

export default router;