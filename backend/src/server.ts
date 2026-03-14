import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`🚀 CIVWATCH Backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Env:    ${process.env.NODE_ENV ?? 'development'}`);
});
