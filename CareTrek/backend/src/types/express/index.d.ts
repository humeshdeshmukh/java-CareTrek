// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      role?: string;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
