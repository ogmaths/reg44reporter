import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { supabase } from '../types/supabase';

const api = axios.create({
  // You can set a baseURL here if needed
  // baseURL: 'http://localhost:3000',
});

// Add a request interceptor to include the access token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  let token = localStorage.getItem('access_token');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.access_token) {
      token = session.access_token;
    }
  } catch (e) {
    // fallback to localStorage token
  }
  if (token && config.headers && typeof (config.headers as AxiosHeaders).set === 'function') {
    (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Get AWS signed URL for S3 upload
type SignedUrlResponse = {
  url: string;
  fields?: Record<string, string>;
};

export async function getS3SignedUrl(key: string, contentType: string): Promise<SignedUrlResponse> {
  const response = await api.post('http://localhost:3000/aws/signed-url', {
    key,
    contentType,
  });
  return response.data;
}

// Upload PDF to S3 using the signed URL
export async function uploadPdfToS3(signedUrl: string, pdfBlob: Blob) {
  // For a PUT signed URL
  console.log("signedUrlsignedUrl ",signedUrl)
  const response = await axios.put(signedUrl, pdfBlob);
  console.log("responseresponseresponse ",response.data);
  return response;
}

// Generate AI report summary
export async function generateAiReportSummary(reportData: string, userId?: string, organizationId?: string) {
  const requestBody = {
    reportData,
    userId,
    organizationId,
  };

  const response = await api.post('http://localhost:3000/ai-report-summary', requestBody);
  return response.data;
}

export default api; 