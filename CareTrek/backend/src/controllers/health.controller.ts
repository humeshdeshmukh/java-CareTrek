import { Request, Response } from 'express';
import { HealthModel, HealthMetric, MetricType } from '../models/health.model';

export const HealthController = {
  // Add a new health metric
  async addMetric(req: Request, res: Response) {
    try {
      // We know user is defined because of the auth middleware
      const userId = (req as any).user.id;
      const { metric_type, value, unit, recorded_at, notes } = req.body;

      // Validate required fields
      if (!metric_type || value === undefined || !unit) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate metric type
      const validTypes: MetricType[] = ['steps', 'heart_rate', 'blood_pressure', 'glucose'];
      if (!validTypes.includes(metric_type)) {
        return res.status(400).json({ error: 'Invalid metric type' });
      }

      // Create the metric
      const metric = await HealthModel.create({
        user_id: userId,
        metric_type,
        value: value.toString(),
        unit,
        recorded_at: recorded_at || new Date().toISOString(),
        notes,
      });

      res.status(201).json(metric);
    } catch (error) {
      console.error('Error adding health metric:', error);
      res.status(500).json({ error: 'Failed to add health metric' });
    }
  },

  // Get health metrics with optional filters
  async getMetrics(req: Request, res: Response) {
    try {
      // We know user is defined because of the auth middleware
      const userId = (req as any).user.id;
      const { 
        type, 
        start_date, 
        end_date, 
        limit = '100' 
      } = req.query;

      const metrics = await HealthModel.getMetrics(
        userId,
        {
          metric_type: type as MetricType,
          start_date: start_date as string,
          end_date: end_date as string,
          limit: parseInt(limit as string, 10)
        }
      );

      res.json(metrics);
    } catch (error) {
      console.error('Error getting health metrics:', error);
      res.status(500).json({ error: 'Failed to get health metrics' });
    }
  },

  // Get health metrics summary for dashboard
  async getSummary(req: Request, res: Response) {
    try {
      // We know user is defined because of the auth middleware
      const userId = (req as any).user.id;
      const summary = await HealthModel.getMetricsSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error('Error getting health summary:', error);
      res.status(500).json({ error: 'Failed to get health summary' });
    }
  },

  // Update a health metric
  async updateMetric(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Don't allow updating user_id or metric_type
      if ('user_id' in updates || 'metric_type' in updates) {
        return res.status(400).json({ error: 'Cannot update user_id or metric_type' });
      }

      const updatedMetric = await HealthModel.update(id, updates);
      
      if (!updatedMetric) {
        return res.status(404).json({ error: 'Health metric not found' });
      }

      res.json(updatedMetric);
    } catch (error) {
      console.error('Error updating health metric:', error);
      res.status(500).json({ error: 'Failed to update health metric' });
    }
  },

  // Delete a health metric
  async deleteMetric(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await HealthModel.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting health metric:', error);
      res.status(500).json({ error: 'Failed to delete health metric' });
    }
  },

  // Get metrics for a family member (requires permission)
  async getFamilyMemberMetrics(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      // We know user is defined because of the auth middleware
      const userId = (req as any).user.id;
      
      // TODO: Verify that the user has permission to view this senior's data
      // This would involve checking the family_connections table
      
      const { 
        type, 
        start_date, 
        end_date, 
        limit = '100' 
      } = req.query;

      const metrics = await HealthModel.getMetrics(
        seniorId,
        {
          metric_type: type as MetricType,
          start_date: start_date as string,
          end_date: end_date as string,
          limit: parseInt(limit as string, 10)
        }
      );

      res.json(metrics);
    } catch (error) {
      console.error('Error getting family member metrics:', error);
      res.status(500).json({ error: 'Failed to get family member metrics' });
    }
  },

  // Get summary for a family member (requires permission)
  async getFamilyMemberSummary(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      // We know user is defined because of the auth middleware
      const userId = (req as any).user.id;
      
      // TODO: Verify that the user has permission to view this senior's data
      // This would involve checking the family_connections table
      
      const summary = await HealthModel.getMetricsSummary(seniorId);
      res.json(summary);
    } catch (error) {
      console.error('Error getting family member summary:', error);
      res.status(500).json({ error: 'Failed to get family member summary' });
    }
  },
};
