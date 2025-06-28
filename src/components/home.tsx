import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  Home,
  BarChart3,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

interface Home {
  id: string;
  name: string;
  type: "children_home" | "supported_accommodation";
  region: string;
  address: string;
  capacity: number;
  lastVisit?: string;
  nextVisit?: string;
  status: "active" | "inactive";
  reportsCount: number;
  lastReportDate?: string;
  lastFormType?: "quick" | "full";
}

const mockHomes: Home[] = [
  {
    id: "1",
    name: "Sunshine Children's Home",
    type: "children_home",
    region: "North West",
    address: "123 Oak Street, Manchester",
    capacity: 8,
    lastVisit: "2024-01-15",
    nextVisit: "2024-02-15",
    status: "active",
    reportsCount: 12,
    lastReportDate: "2024-01-15",
    lastFormType: "quick",
  },
  {
    id: "2",
    name: "Haven Supported Living",
    type: "supported_accommodation",
    region: "Yorkshire",
    address: "456 Elm Avenue, Leeds",
    capacity: 12,
    lastVisit: "2024-01-20",
    status: "active",
    reportsCount: 8,
    lastReportDate: "2023-12-20",
    lastFormType: "full",
  },
  {
    id: "3",
    name: "Meadowbrook House",
    type: "children_home",
    region: "South East",
    address: "789 Pine Road, Brighton",
    capacity: 6,
    status: "active",
    reportsCount: 3,
    lastReportDate: "2023-11-10",
    lastFormType: "quick",
  },
];

const HomeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [homes, setHomes] = useState<Home[]>(mockHomes);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHome, setNewHome] = useState({
    name: "",
    type: "children_home" as const,
    region: "",
    address: "",
    capacity: 0,
  });

  const filteredHomes = homes.filter((home) => {
    const matchesSearch =
      home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      home.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion =
      filterRegion === "all" || home.region === filterRegion;
    const matchesType = filterType === "all" || home.type === filterType;
    return matchesSearch && matchesRegion && matchesType;
  });

  const regions = [...new Set(homes.map((home) => home.region))];

  const handleAddHome = () => {
    if (newHome.name && newHome.region && newHome.address) {
      const home: Home = {
        id: Date.now().toString(),
        ...newHome,
        status: "active",
        reportsCount: 0,
      };
      setHomes([...homes, home]);
      setNewHome({
        name: "",
        type: "children_home",
        region: "",
        address: "",
        capacity: 0,
      });
      setIsAddDialogOpen(false);
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

    // Red badge if past mid-month and no visit this month
    if (dayOfMonth > 15) {
      return { color: "destructive", text: "Overdue" };
    }
    // Yellow badge if visit due but not overdue
    return { color: "secondary", text: "Due" };
  };

  const visitsDueCount = homes.filter(isVisitDue).length;

  const sidebarItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/",
      active: location.pathname === "/",
    },
    {
      name: "Homes",
      icon: Building,
      path: "/",
      active: location.pathname === "/",
    },
    {
      name: "Reports",
      icon: FileText,
      path: "/reports",
      active: location.pathname === "/reports",
    },
    {
      name: "Visits",
      icon: Calendar,
      path: "/visits",
      active: location.pathname === "/visits",
    },
    {
      name: "Insights",
      icon: TrendingUp,
      path: "/insights",
      active: false,
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl border-r border-gray-100 sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Regulation 44</h1>
              <p className="text-xs text-gray-500">Reporting Platform</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => !item.comingSoon && navigate(item.path)}
                  disabled={item.comingSoon}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    item.active
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : item.comingSoon
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${item.active ? "text-white" : ""}`}
                  />
                  <span className="font-medium">{item.name}</span>
                  {item.comingSoon && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="w-full flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            Profile Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Manage homes and create reports with ease
            </p>
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
          </div>

          {filteredHomes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No homes found
              </h3>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
