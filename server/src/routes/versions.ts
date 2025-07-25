import { Router } from 'express';
import { 
  getVersions, 
  createVersion, 
  updateVersion, 
  deleteVersion,
  setActiveVersion
} from '../controllers/versionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/products/:productId/versions', getVersions);
router.post('/products/:productId/versions', createVersion);
router.put('/versions/:id', updateVersion);
router.delete('/versions/:id', deleteVersion);
router.patch('/versions/:id/activate', setActiveVersion);

export default router;