import React, { useState } from "react";
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
  status: "active" | "pending" | "inactive";
  reportsCount: number;
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
  },
  {
    id: "3",
    name: "Meadowbrook House",
    type: "children_home",
    region: "South East",
    address: "789 Pine Road, Brighton",
    capacity: 6,
    status: "pending",
    reportsCount: 3,
  },
];

const HomeDashboard = () => {
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
      case "pending":
        return "bg-yellow-100 text-yellow-800";
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                Active Homes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {homes.filter((h) => h.status === "active").length}
              </div>
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
              <div className="text-2xl font-bold">
                {homes.filter((h) => h.nextVisit).length}
              </div>
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

        {/* Homes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHomes.map((home) => (
            <Card
              key={home.id}
              className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{home.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {home.region}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(home.status)}>
                    {home.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">{home.address}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">
                      {getTypeLabel(home.type)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">
                      {home.capacity} residents
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reports:</span>
                    <span className="font-medium">{home.reportsCount}</span>
                  </div>
                  {home.lastVisit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Visit:</span>
                      <span className="font-medium">
                        {new Date(home.lastVisit).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {home.nextVisit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Next Visit:</span>
                      <span className="font-medium text-blue-600">
                        {new Date(home.nextVisit).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-1" />
                    Reports
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Plus className="h-4 w-4 mr-1" />
                    New Visit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
