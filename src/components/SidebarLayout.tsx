import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Building, FileText, Calendar, Settings, Home as HomeIcon, BarChart3, ClipboardList, TrendingUp } from "lucide-react";

const sidebarItemsBase = [
  { name: "Dashboard", icon: HomeIcon, path: "/" },
  { name: "Reports", icon: FileText, path: "/reports" },
  { name: "Visits", icon: Calendar, path: "/visits" },
  { name: "Insights", icon: TrendingUp, path: "/insights", comingSoon: true },
];

const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    setRole(storedRole || null);
  }, []);

  const sidebarItems = [
    sidebarItemsBase[0],
    ...(localStorage.getItem('user_role') === 'admin' || localStorage.getItem('user_role') === 'superadmin' ? [{ name: "Users", icon: Building, path: "/users" }] : []),
    ...sidebarItemsBase.slice(1)
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
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => !item.comingSoon && navigate(item.path)}
                  disabled={item.comingSoon}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : item.comingSoon
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-white" : ""}`} />
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
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
};

export default SidebarLayout; 