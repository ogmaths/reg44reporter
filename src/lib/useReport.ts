import { useState } from 'react';
import { supabase } from '../types/supabase';
import { generateAiReportSummary } from './api';

export function useReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new report
  const createReport = async ({
    home_id,
    visit_id,
    created_by,
    organization_id,
    data,
    status = 'draft',
  }: {
    home_id: string;
    visit_id: string;
    created_by: string;
    organization_id: string;
    data: any;
    status?: string;
  }) => {
    setLoading(true);
    setError(null);
    console.log('Creating report', { home_id, visit_id, created_by, organization_id, data, status });
    const { error } = await supabase.from('reports').insert([
      { home_id, visit_id, created_by, organization_id, data, status },
    ]);
    setLoading(false);
    if (error) setError(error.message);
    return !error;
  };

  // Fetch reports by visit_id
  const fetchReportsByVisit = async (visit_id: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('visit_id', visit_id);
    setLoading(false);
    if (error) setError(error.message);
    return data;
  };

  // Fetch reports by home_id
  const fetchReportsByHome = async (home_id: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('home_id', home_id);
    setLoading(false);
    if (error) setError(error.message);
    return data;
  };

  // Fetch reports by organization_id
  const fetchReportsByOrganization = async (organization_id: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('organization_id', organization_id);
    setLoading(false);
    if (error) setError(error.message);
    return data;
  };

  // Generate child-friendly summary using AI
  const generateChildFriendlySummaryFromAi = async (reportData: any) => {
    alert("generarting ")
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('user_id');
      const organizationId = localStorage.getItem('organization_id');
      const result = await generateAiReportSummary(
        JSON.stringify(reportData),
        userId || undefined,
        organizationId || undefined
      );
      setLoading(false);
      return result.summary || result.content || result.response || JSON.stringify(result);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI summary';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    createReport,
    fetchReportsByVisit,
    fetchReportsByHome,
    fetchReportsByOrganization,
    generateChildFriendlySummaryFromAi,
    loading,
    error,
  };
} 