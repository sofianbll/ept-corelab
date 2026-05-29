const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 4242;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Corelab] API running on http://localhost:${PORT}`);
    console.log(`[Corelab] Swagger docs on http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
