import React, { createContext, useContext, useEffect, useState } from 'react';
import { FamilyConnection } from '../services/family.service';
import { useAuth } from './AuthContext';
import { FamilyService } from '../services/family.service';

interface FamilyContextType {
  connections: FamilyConnection[];
  loading: boolean;
  error: string | null;
  refreshConnections: () => Promise<void>;
  sendRequest: (seniorId: string, relationship: string) => Promise<void>;
  respondToRequest: (connectionId: string, status: 'accepted' | 'rejected' | 'blocked') => Promise<void>;
  removeConnection: (connectionId: string) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<FamilyConnection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchConnections = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await FamilyService.getConnectedSeniors();
      setConnections(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
      setError('Failed to load family connections');
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (seniorId: string, relationship: string) => {
    try {
      await FamilyService.sendRequest(seniorId, relationship);
      await fetchConnections();
    } catch (err) {
      console.error('Failed to send request:', err);
      throw err;
    }
  };

  const respondToRequest = async (connectionId: string, status: 'accepted' | 'rejected' | 'blocked') => {
    try {
      await FamilyService.respondToRequest(connectionId, status);
      await fetchConnections();
    } catch (err) {
      console.error('Failed to respond to request:', err);
      throw err;
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      await FamilyService.removeConnection(connectionId);
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    } catch (err) {
      console.error('Failed to remove connection:', err);
      throw err;
    }
  };

  // Auto-refresh connections when the component mounts and when user changes
  useEffect(() => {
    if (user) {
      // Initial fetch
      fetchConnections();
      
      // Set up interval for auto-refresh (every 30 seconds)
      const intervalId = setInterval(() => {
        fetchConnections();
      }, 30000);
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [user]);
  
  // Add pull-to-refresh functionality
  const handleRefresh = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await fetchConnections();
    } catch (err) {
      console.error('Refresh failed:', err);
      setError('Failed to refresh connections');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FamilyContext.Provider
      value={{
        connections,
        loading,
        error,
        refreshConnections: handleRefresh, 
        sendRequest,
        respondToRequest,
        removeConnection,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = (): FamilyContextType => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
