import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  ClipboardList,
  FileText,
  Settings,
  Users,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ActionItem {
  id: string;
  action: string;
  assignedTo: string;
  deadline: string;
  status: "Not Started" | "In Progress" | "Completed";
}

interface ReportItem {
  id: string;
  homeName: string;
  visitDate: string;
  status: "Draft" | "Submitted" | "Reviewed";
}

interface VisitItem {
  id: string;
  homeName: string;
  visitDate: string;
  visitType: "Announced" | "Unannounced";
}

const Home = () => {
  // Mock data - in a real app this would come from an API or state management
  const userRole = "Independent Person"; // This would be determined by authentication
  const userName = "Jane Smith";

  const recentReports: ReportItem[] = [
    {
      id: "1",
      homeName: "Sunshine House",
      visitDate: "2023-05-15",
      status: "Submitted",
    },
    {
      id: "2",
      homeName: "Rainbow Lodge",
      visitDate: "2023-05-02",
      status: "Draft",
    },
    {
      id: "3",
      homeName: "Harmony Home",
      visitDate: "2023-04-20",
      status: "Reviewed",
    },
  ];

  const upcomingVisits: VisitItem[] = [
    {
      id: "1",
      homeName: "Sunshine House",
      visitDate: "2023-06-10",
      visitType: "Announced",
    },
    {
      id: "2",
      homeName: "Rainbow Lodge",
      visitDate: "2023-06-15",
      visitType: "Unannounced",
    },
  ];

  const pendingActions: ActionItem[] = [
    {
      id: "1",
      action: "Update fire safety procedures",
      assignedTo: "Registered Manager",
      deadline: "2023-06-20",
      status: "In Progress",
    },
    {
      id: "2",
      action: "Staff training on new safeguarding policy",
      assignedTo: "Registered Manager",
      deadline: "2023-06-25",
      status: "Not Started",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Submitted":
        return "bg-blue-100 text-blue-800";
      case "Reviewed":
        return "bg-green-100 text-green-800";
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Regulation 44 Reporting Platform
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <Avatar>
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
                alt="User avatar"
              />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Welcome back, {userName}
          </h2>
          <p className="text-gray-600">
            Here's an overview of your Regulation 44 reporting activities.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/report-builder" className="no-underline">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium">Create Report</h3>
              </CardContent>
            </Card>
          </Link>

          <Link to="/visit-scheduler" className="no-underline">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <CalendarIcon className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium">Schedule Visit</h3>
              </CardContent>
            </Card>
          </Link>

          <Link to="/action-tracker" className="no-underline">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <ClipboardList className="h-8 w-8 text-amber-600 mb-2" />
                <h3 className="font-medium">Track Actions</h3>
              </CardContent>
            </Card>
          </Link>

          <Link to="/settings" className="no-underline">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Settings className="h-8 w-8 text-gray-600 mb-2" />
                <h3 className="font-medium">Settings</h3>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="reports" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="reports">Recent Reports</TabsTrigger>
            <TabsTrigger value="visits">Upcoming Visits</TabsTrigger>
            <TabsTrigger value="actions">Pending Actions</TabsTrigger>
          </TabsList>

          <TabsContent
            value="reports"
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            {recentReports.length > 0 ? (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium">{report.homeName}</h4>
                      <p className="text-sm text-gray-500">
                        Visit Date: {report.visitDate}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant="outline"
                        className={getStatusColor(report.status)}
                      >
                        {report.status}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/reports/${report.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent reports found.</p>
                <Button className="mt-4" asChild>
                  <Link to="/report-builder">Create a Report</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="visits"
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            {upcomingVisits.length > 0 ? (
              <div className="space-y-4">
                {upcomingVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium">{visit.homeName}</h4>
                      <p className="text-sm text-gray-500">
                        Visit Date: {visit.visitDate}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={
                          visit.visitType === "Announced"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {visit.visitType}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/visits/${visit.id}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming visits scheduled.</p>
                <Button className="mt-4" asChild>
                  <Link to="/visit-scheduler">Schedule a Visit</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="actions"
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            {pendingActions.length > 0 ? (
              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium">{action.action}</h4>
                      <p className="text-sm text-gray-500">
                        Assigned to: {action.assignedTo} | Deadline:{" "}
                        {action.deadline}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant="outline"
                        className={getStatusColor(action.status)}
                      >
                        {action.status}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/actions/${action.id}`}>Update</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending actions found.</p>
                <Button className="mt-4" asChild>
                  <Link to="/action-tracker">Create an Action</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Notifications */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <p className="text-sm text-blue-800">
                  A new report template is available for use.{" "}
                  <a href="#" className="font-medium underline">
                    View details
                  </a>
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-md border border-amber-100">
                <p className="text-sm text-amber-800">
                  Reminder: 2 actions are due this week.{" "}
                  <Link to="/action-tracker" className="font-medium underline">
                    Review now
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; 2023 Regulation 44 Reporting Platform
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Help
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
