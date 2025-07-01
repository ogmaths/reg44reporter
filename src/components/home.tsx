import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarLayout from "./SidebarLayout";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Building,
  Calendar,
  FileText,
  Users,
  Settings,
  Home as HomeIcon,
  BarChart3,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../types/supabase";

interface Home {
  id: string;
  name: string;
  address: string;
  capacity: number;
  type?: "children_home" | "supported_accommodation";
  region?: string;
  status?: "active" | "inactive";
  reportsCount?: number;
  lastVisit?: string;
  nextVisit?: string;
  lastReportDate?: string;
  lastFormType?: "quick" | "full";
  organization_id?: string;
  created_by?: string;
  created_at?: string;
}

const HomeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [homes, setHomes] = useState<Home[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHome, setNewHome] = useState({
    name: "",
    type: "children_home" as "children_home" | "supported_accommodation",
    region: "",
    address: "",
    capacity: 0,
  });
  const [loading, setLoading] = useState(true);

  // Get orgId and userId from localStorage (set on login)
  const orgId = localStorage.getItem("organization_id");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  // Fetch homes and subscribe to real-time changes
  useEffect(() => {
    let subscription: any;
    const fetchHomes = async () => {
      if (!orgId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("homes")
        .select("*")
        .eq("organization_id", orgId);
      if (!error && data) setHomes(data);
      setLoading(false);

      // Subscribe to real-time changes
      subscription = supabase
        .channel("public:homes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "homes", filter: `organization_id=eq.${orgId}` },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setHomes((prev) => [...prev, payload.new as Home]);
            } else if (payload.eventType === "UPDATE") {
              setHomes((prev) =>
                prev.map((h) => (h.id === (payload.new as Home).id ? (payload.new as Home) : h))
              );
            } else if (payload.eventType === "DELETE") {
              setHomes((prev) => prev.filter((h) => h.id !== (payload.old as Home).id));
            }
          }
        )
        .subscribe();
    };

    fetchHomes();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [orgId]);

  const filteredHomes = homes.filter((home) => {
    const matchesSearch =
      home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (home.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesRegion =
      filterRegion === "all" || home.region === filterRegion;
    const matchesType = filterType === "all" || home.type === filterType;
    return matchesSearch && matchesRegion && matchesType;
  });

  const regions = [...new Set(homes.map((home) => home.region).filter(Boolean))];

  const handleAddHome = async () => {
    if (!newHome.name || !orgId || !userId) return;
    const { error } = await supabase.from("homes").insert([
      {
        ...newHome,
        organization_id: orgId,
        created_by: userId,
      },
    ]);
    if (!error) {
      setIsAddDialogOpen(false);
      setNewHome({
        name: "",
        type: "children_home",
        region: "",
        address: "",
        capacity: 0,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "children_home"
      ? "Children's Home"
      : "Supported Accommodation";
  };

  const isVisitDue = (home: Home) => {
    if (!home.lastReportDate) return true;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastReportDate = new Date(home.lastReportDate);

    return (
      lastReportDate.getMonth() !== currentMonth ||
      lastReportDate.getFullYear() !== currentYear
    );
  };

  const getVisitStatus = (home: Home) => {
    if (!isVisitDue(home)) return null;

    const now = new Date();
    const dayOfMonth = now.getDate();

    // Red badge if past mid-month and no visit this monthZZZ
    if (dayOfMonth > 15) {
      return { color: "destructive", text: "Overdue" };
    }
    // Yellow badge if visit due but not overdue
    return { color: "secondary", text: "Due" };
  };

  const visitsDueCount = homes.filter(isVisitDue).length;

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage homes and create reports with ease</p>
      </div>
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
              Total
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {homes.length}
          </div>
          <div className="text-sm text-gray-600">Registered Homes</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500 bg-green-50 px-3 py-1 rounded-full">
              Generated
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {homes.reduce((sum, home) => sum + home.reportsCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500 bg-orange-50 px-3 py-1 rounded-full">
              Pending
            </span>
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {visitsDueCount}
          </div>
          <div className="text-sm text-gray-600">Visits Due</div>
        </div>
      </div>
      {/* Search and Add */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search homes by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:shadow-md transition-shadow"
          />
        </div>
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-40 h-12 bg-white border-gray-200 rounded-xl shadow-sm">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-5 w-5 mr-2" />
              Add Home
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Add New Home
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Add a new children's home or supported accommodation to your
                dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Home Name</Label>
                <Input
                  id="name"
                  value={newHome.name}
                  onChange={(e) =>
                    setNewHome({ ...newHome, name: e.target.value })
                  }
                  placeholder="Enter home name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newHome.type}
                  onValueChange={(
                    value: "children_home" | "supported_accommodation",
                  ) => setNewHome({ ...newHome, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="children_home">
                      Children's Home
                    </SelectItem>
                    <SelectItem value="supported_accommodation">
                      Supported Accommodation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={newHome.region}
                  onChange={(e) =>
                    setNewHome({ ...newHome, region: e.target.value })
                  }
                  placeholder="Enter region"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newHome.address}
                  onChange={(e) =>
                    setNewHome({ ...newHome, address: e.target.value })
                  }
                  placeholder="Enter full address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newHome.capacity}
                  onChange={(e) =>
                    setNewHome({
                      ...newHome,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter capacity"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleAddHome}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl"
              >
                Add Home
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Homes Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Homes</h2>
        {loading ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Building className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Loading homes...</h3>
          </div>
        ) : filteredHomes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No homes found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || filterRegion !== "all"
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : "Get started by adding your first home to begin creating reports and managing visits."}
            </p>
            {!searchTerm && filterRegion === "all" && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl px-8 py-3 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Home
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHomes.map((home) => {
              const visitStatus = getVisitStatus(home);
              return (
                <div
                  key={home.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                          {home.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-2" />
                          {home.region}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {home.address}
                        </div>
                      </div>
                      {visitStatus && (
                        <Badge
                          variant={visitStatus.color as any}
                          className="text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {visitStatus.text}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {home.capacity}
                        </div>
                        <div className="text-xs text-gray-500">Capacity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {home.reportsCount}
                        </div>
                        <div className="text-xs text-gray-500">Reports</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {home.lastReportDate
                            ? new Date(
                                home.lastReportDate,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                              })
                            : "None"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last Visit
                        </div>
                      </div>
                    </div>

                    <Button
                      className={`w-full rounded-xl font-medium transition-all duration-200 ${
                        visitStatus
                          ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                      }`}
                      onClick={() =>
                        navigate(
                          `/report/new?homeName=${encodeURIComponent(home.name)}&homeAddress=${encodeURIComponent(home.address)}&homeId=${home.id}`,
                        )
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Visit Report
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default HomeDashboard;
