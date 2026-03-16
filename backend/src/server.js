import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { bootstrapOwner } from './controllers/authController.js';

const port = Number(process.env.PORT || 5000);

async function startServer() {
  await connectDatabase(process.env.MONGODB_URI);
  await bootstrapOwner();

  const app = createApp();
  app.listen(port, () => {
    console.log(`Loan Manager API running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
