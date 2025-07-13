import React, { useEffect, useState } from "react";
import SidebarLayout from "./SidebarLayout";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "../types/supabase";
import { toast } from "./ui/use-toast";

interface Report {
  id: string;
  home_id: string | null;
  visit_id: string | null;
  created_by: string | null;
  organization_id: string | null;
  status: string | null;
  created_at: string | null;
  summary_pdf: string | null;
  report_pdf: string | null;
  home_name?: string | null;
  user_name?: string | null;
}

const PAGE_SIZE = 10;

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log("localStorage.getItem('user_role') ",localStorage.getItem('user_role'));
    setRole(localStorage.getItem('user_role'));
    setOrganizationId(localStorage.getItem('organization_id'));
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const fetchReports = async (pageNum = 1, search = "") => {
    setLoading(true);
    let query = supabase
      .from("reports")
      .select(`*, homes(name), users:created_by(full_name)`, { count: "exact" });

    if (role === 'admin' && organizationId) {
      query = query.eq('organization_id', organizationId);
    } else if (role === 'ip' && userId) {
      query = query.eq('created_by', userId);
    }

    console.log("userId ",userId);

    // superadmin: no filter, gets all

    if (search) {
      query = query.or(`home_id.ilike.%${search}%,visit_id.ilike.%${search}%,homes.name.ilike.%${search}%,users.full_name.ilike.%${search}%`);
    }
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await query.range(from, to);
    if (!error && data) {
      const mapped = data.map((r: any) => ({
        ...r,
        home_name: r.homes?.name || null,
        user_name: r.users?.full_name || null,
      }));
      setReports(mapped);
      setTotalPages(count ? Math.ceil(count / PAGE_SIZE) : 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (role && (role === 'superadmin' || (role === 'admin' && organizationId) || (role === 'ip' && userId))) {
      fetchReports(page, searchTerm);
    }
    // eslint-disable-next-line
  }, [page, searchTerm, role, organizationId, userId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Browse and manage all reports</p>
      </div>
      {/* Search */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by Home, User, Home ID or Visit ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-4 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:shadow-md transition-shadow"
          />
        </div>
      </div>
      {/* Reports Table */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Reports</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Home</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary PDF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report PDF</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-6">Loading...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-6">No reports found.</td></tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{report.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.home_name || report.home_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.visit_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.user_name || report.created_by}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.organization_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.created_at ? new Date(report.created_at).toLocaleString() : ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    {/* https://ip44reporter.s3.eu-west-2.amazonaws.com/Child_Friendly_Summary_Haven_Supported_Living_2025-07-03_20250703_151811.pdf */}
                      {report.summary_pdf ? (
                        <a
                          href={`https://ip44reporter.s3.eu-west-2.amazonaws.com/${report.summary_pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {report.summary_pdf}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.report_pdf ? (
                        <a
                          href={`https://ip44reporter.s3.eu-west-2.amazonaws.com/${report.report_pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {report.report_pdf}
                        </a>
                      ) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </SidebarLayout>
  );
};

export default Reports; 