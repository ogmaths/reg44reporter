import React, { useEffect, useState } from "react";
import SidebarLayout from "./SidebarLayout";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "../types/supabase";

interface Visit {
  id: string;
  home_id: string | null;
  scheduled_for: string | null;
  created_by: string | null;
  status: string | null;
  created_at: string | null;
  home_name?: string | null;
  user_name?: string | null;
  home_organization_id?: string | null;
}

const PAGE_SIZE = 10;

const Visits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('user_role'));
    setOrganizationId(localStorage.getItem('organization_id'));
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const fetchVisits = async (pageNum = 1, search = "") => {
    setLoading(true);
    let query = supabase
      .from("visits")
      .select(`*, homes(name, organization_id), users:created_by(full_name)`, { count: "exact" });

    // Role-based filtering
    if (role === 'admin' && organizationId) {
      // Filter by homes.organization_id
      // We'll filter in JS after fetching, since Supabase doesn't support deep filter in select
    } else if (role === 'ip' && userId) {
      query = query.eq('created_by', userId);
    }
    // superadmin: no filter

    if (search) {
      query = query.or(`id.ilike.%${search}%,homes.name.ilike.%${search}%,users.full_name.ilike.%${search}%`);
    }
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await query.range(from, to);
    if (!error && data) {
      let mapped = data.map((v: any) => ({
        ...v,
        home_name: v.homes?.name || null,
        user_name: v.users?.full_name || null,
        home_organization_id: v.homes?.organization_id || null,
      }));
      // JS filter for admin by home organization
      if (role === 'admin' && organizationId) {
        mapped = mapped.filter((v) => v.home_organization_id === organizationId);
      }
      setVisits(mapped);
      setTotalPages(count ? Math.ceil(count / PAGE_SIZE) : 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (role && (role === 'superadmin' || (role === 'admin' && organizationId) || (role === 'ip' && userId))) {
      fetchVisits(page, searchTerm);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Visits</h1>
        <p className="text-gray-600">Browse and manage all visits</p>
      </div>
      {/* Search */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by Visit ID, Home, or User..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-4 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:shadow-md transition-shadow"
          />
        </div>
      </div>
      {/* Visits Table */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Visits</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Home</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled For</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Done By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-6">Loading...</td></tr>
              ) : visits.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6">No visits found.</td></tr>
              ) : (
                visits.map(visit => (
                  <tr key={visit.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{visit.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{visit.home_name || visit.home_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{visit.scheduled_for ? new Date(visit.scheduled_for).toLocaleDateString() : ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{visit.user_name || visit.created_by}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{visit.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{visit.created_at ? new Date(visit.created_at).toLocaleString() : ""}</td>
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

export default Visits; 