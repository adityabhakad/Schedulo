import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

let PORT = process.env.PORT || 5000;

// Connect Database and Start Express Server
connectDB().then(() => {
  const startServer = (port) => {
    const server = app
      .listen(port, () => {
        console.log(`=================================================`);
        console.log(` Schedulo Server running in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(` REST API Server listening on port: ${port}`);
        console.log(` Health Check endpoint: http://localhost:${port}/api/health`);
        console.log(`=================================================`);
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} is occupied. Retrying on port ${Number(port) + 1}...`);
          startServer(Number(port) + 1);
        } else {
          console.error('Server error:', err);
        }
      });
  };

  startServer(PORT);
});
