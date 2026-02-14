import { z } from 'zod';

export const CreateIncidentSchema = z.object({
  title: z.string().min(1).max(500),
  status: z.enum(['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED']).optional(),
  severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']).optional(),
  message: z.string().min(1),
  componentIds: z.array(z.string().uuid()).optional(),
  componentStatus: z.enum(['OPERATIONAL', 'DEGRADED_PERFORMANCE', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE', 'UNDER_MAINTENANCE']).optional(),
});

export const UpdateIncidentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  status: z.enum(['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED']).optional(),
  severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']).optional(),
});

export const AddIncidentUpdateSchema = z.object({
  status: z.enum(['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED']),
  message: z.string().min(1),
});
