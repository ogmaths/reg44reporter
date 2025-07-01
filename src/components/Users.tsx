import React, { useEffect, useState } from "react";
import SidebarLayout from "./SidebarLayout";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Building, BarChart3, ClipboardList, Plus, Search } from "lucide-react";
import { supabase } from "../types/supabase";
import { toast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_freelancer: boolean;
  organization_id?: string;
  created_at: string;
}

const PAGE_SIZE = 10;

const Users = () => {
  // All hooks at the top
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "ip",
    is_freelancer: false,
    password: ""
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get role and orgId from localStorage
    const storedRole = localStorage.getItem('user_role');
    setCurrentUserRole(storedRole || null);
    const storedOrgId = localStorage.getItem('organization_id');
    setOrgId(storedOrgId || null);
  }, []);

  const fetchUsers = async (pageNum = 1, search = "") => {
    setLoading(true);
    let query = supabase.from("users").select("*", { count: "exact" });
    if (currentUserRole === 'admin' && orgId) {
      query = query.eq('organization_id', orgId);
    }
    if (search) {
      query = query.ilike("full_name", `%${search}%`);
    }
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await query.range(from, to);
    if (!error && data) {
      setUsers(data as User[]);
      setTotalPages(count ? Math.ceil(count / PAGE_SIZE) : 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Only fetch users after both currentUserRole and orgId are loaded
    if (currentUserRole === 'admin' && orgId) {
      fetchUsers(page, searchTerm);
    } else if (currentUserRole === 'superadmin') {
      fetchUsers(page, searchTerm); // superadmin sees all users
    }
    // Do not fetch users for admin if orgId is not loaded yet
    // eslint-disable-next-line
  }, [page, searchTerm, currentUserRole, orgId]);

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.full_name || !newUser.password) return;
    setAddLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          full_name: newUser.full_name,
          role: newUser.role,
          is_freelancer: newUser.is_freelancer,
          organization_id: orgId || undefined,
        }
      }
    });
    if (error) {
      setAddLoading(false);
      toast({ title: 'Error', description: error.message });
      return;
    }
    // Insert into custom users table if user is present
    if (data?.user) {
      await supabase.from("users").insert([
        {
          id: data.user.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          is_freelancer: newUser.is_freelancer,
          organization_id: orgId || undefined,
        }
      ]);
    }
    setAddLoading(false);
    toast({
      title: 'User created!',
      description: 'A verification email has been sent to the user.'
    });
    setIsAddDialogOpen(false);
    setNewUser({ email: "", full_name: "", role: "ip", is_freelancer: false, password: "" });
    fetchUsers(page, searchTerm);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalFreelancers = users.filter(u => u.is_freelancer).length;

  // Only do conditional returns after all hooks
  if (!currentUserRole) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid URL or Not Found</h2>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </SidebarLayout>
    );
  }
  if (currentUserRole !== 'admin' && currentUserRole !== 'superadmin') {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid URL or Not Found</h2>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <p className="text-gray-600">Manage users and their roles in your platform</p>
      </div>
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500 bg-blue-50 px-3 py-1 rounded-full">Total</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalUsers}</div>
          <div className="text-sm text-gray-600">Registered Users</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500 bg-green-50 px-3 py-1 rounded-full">Admins</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalAdmins}</div>
          <div className="text-sm text-gray-600">Admin Users</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500 bg-orange-50 px-3 py-1 rounded-full">Freelancers</span>
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-1">{totalFreelancers}</div>
          <div className="text-sm text-gray-600">Freelancer Users</div>
        </div>
      </div>
      {/* Search and Add */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search users by name..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-12 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:shadow-md transition-shadow"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-5 w-5 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Add New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  placeholder="Role (ip/admin)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_freelancer"
                  checked={newUser.is_freelancer}
                  onChange={e => setNewUser({ ...newUser, is_freelancer: e.target.checked })}
                />
                <Label htmlFor="is_freelancer">Is Freelancer</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl" disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Users Table/Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Users</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Freelancer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.is_freelancer ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(user.created_at).toLocaleDateString()}</td>
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

export default Users; 