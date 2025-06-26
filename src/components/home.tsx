import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Home Management Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your assigned children's homes and supported accommodation
            services
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Homes</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{homes.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {homes.reduce((sum, home) => sum + home.reportsCount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visits Due</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {visitsDueCount}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search homes by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by region" />
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
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="children_home">Children's Homes</SelectItem>
              <SelectItem value="supported_accommodation">
                Supported Accommodation
              </SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Add Home
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>Add New Home</DialogTitle>
                <DialogDescription>
                  Add a new children's home or supported accommodation unit to
                  your dashboard.
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
                <Button type="submit" onClick={handleAddHome}>
                  Add Home
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Homes List */}
        <div className="space-y-4">
          {filteredHomes.map((home) => {
            const visitStatus = getVisitStatus(home);
            return (
              <Card
                key={home.id}
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {home.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {home.region} • {getTypeLabel(home.type)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {visitStatus && (
                            <Badge variant={visitStatus.color as any}>
                              Visit {visitStatus.text}
                            </Badge>
                          )}
                          {home.lastFormType && (
                            <Badge variant="outline" className="text-xs">
                              {home.lastFormType === "quick"
                                ? "Quick Form Used"
                                : "Full Form Used"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Address:</span>
                          <p className="font-medium truncate">{home.address}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Capacity:</span>
                          <p className="font-medium">
                            {home.capacity} residents
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Reports:</span>
                          <p className="font-medium">{home.reportsCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Report:</span>
                          <p className="font-medium">
                            {home.lastReportDate
                              ? new Date(
                                  home.lastReportDate,
                                ).toLocaleDateString()
                              : "No reports"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Reports
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                      <Button
                        size="sm"
                        className={
                          visitStatus ? "bg-orange-600 hover:bg-orange-700" : ""
                        }
                        onClick={() =>
                          navigate(
                            `/report/new?homeName=${encodeURIComponent(home.name)}&homeAddress=${encodeURIComponent(home.address)}&homeId=${home.id}`,
                          )
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New Visit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredHomes.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No homes found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterRegion !== "all" || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first home"}
            </p>
            {!searchTerm && filterRegion === "all" && filterType === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Home
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeDashboard;
