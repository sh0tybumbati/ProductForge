import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import lineRoutes from './routes/lines';
import productRoutes from './routes/products';
import versionRoutes from './routes/versions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'ProductForge API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/lines', lineRoutes);
app.use('/api/products', productRoutes);
app.use('/api', versionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});