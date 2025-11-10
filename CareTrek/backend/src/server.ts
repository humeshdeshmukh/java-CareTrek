import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import appointmentRoutes from './routes/appointment.routes';
import healthRoutes from './routes/health.routes';

// Debug: Log current working directory and environment
console.log('Current working directory:', process.cwd());
console.log('Environment variables loaded from .env file');

// Destructure environment variables with defaults
const { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY,
  PORT,
  JWT_SECRET
} = env;

// Debug: Log loaded environment variables (redacting sensitive info)
console.log('Environment configuration:');
console.log('- SUPABASE_URL:', SUPABASE_URL ? '*** (set)' : 'Not set');
console.log('- SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '*** (set)' : 'Not set');
console.log('- JWT_SECRET:', JWT_SECRET ? '*** (set)' : 'Not set');
console.log('- PORT:', PORT);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:19006', 
    'http://localhost:3000', 
    'http://localhost:5000',
    'http://10.0.2.2:5000',  // Android emulator
    'http://192.168.1.6:5000', // Your computer's IP for physical device
    /^http:\/\/192\.168\.1\.\d{1,3}:\d+$/ // Allow any port from your local network
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize Supabase client with better error handling
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required Supabase configuration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

console.log('Supabase client initialized successfully');

// Export supabase for use in other modules
export { supabase };

// API Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/health', healthRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    supabase: {
      connected: !!SUPABASE_URL,
      url: SUPABASE_URL ? 'Connected' : 'Not connected'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const port = parseInt(PORT, 10) || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Supabase connected: ${SUPABASE_URL ? 'Yes' : 'No'}`);
  if (SUPABASE_URL) {
    console.log(`Supabase URL: ${SUPABASE_URL}`);
  }
});
