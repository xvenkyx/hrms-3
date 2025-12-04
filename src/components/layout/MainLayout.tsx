import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Clock,
  CalendarDays,
  Briefcase,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // In MainLayout.tsx, update the getNavigationItems function
  const getNavigationItems = () => {
    const baseItems = [
      {
        path: "/",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        path: "/attendance",
        label: "Attendance",
        icon: <Calendar className="h-5 w-5" />,
      },
    ];

    if (!user) return baseItems;

    if (user.role === "employee") {
      return [
        ...baseItems,
        {
          path: "/my-profile",
          label: "My Profile",
          icon: <User className="h-5 w-5" />,
        },
        {
          path: "/my-leave-requests",
          label: "My Leaves",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          path: "/my-salary",
          label: "My Salary",
          icon: <FileText className="h-5 w-5" />,
        }, // Add this
      ];
    }

    return [
      ...baseItems,
      {
        path: "/employees",
        label: "Employees",
        icon: <Users className="h-5 w-5" />,
      },
      {
        path: "/leave-requests",
        label: "Leave Requests",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        path: "/salary/generate",
        label: "Salary Slip",
        icon: <FileText className="h-5 w-5" />,
        // Or use a dollar icon if you have it: <DollarSign className="h-5 w-5" />
      },
      {
        path: "/salary/history",
        label: "Salary History",
        icon: <FileText className="h-5 w-5" />,
        // Or use a different icon: <History className="h-5 w-5" />
      },
      {
        path: "/my-profile",
        label: "My Profile",
        icon: <User className="h-5 w-5" />,
      },
      {
        path: "/settings",
        label: "Settings",
        icon: <Settings className="h-5 w-5" />,
      },
    ];
  };

  const navItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white px-6 py-4">
          <div className="flex h-16 shrink-0 items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">JHEX HRMS</h1>
              <p className="text-xs text-gray-500">v3</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      <span
                        className={`${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto pt-4">
              <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {user?.role}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        • {user?.department}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{currentTime.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3 w-3" />
                    <span>{currentTime.toLocaleDateString()}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 justify-end gap-x-4">
            <div className="flex items-center gap-x-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
                <Briefcase className="h-4 w-4" />
                <span className="font-medium">{user?.department}</span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{user?.role}</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Clock className="h-3 w-3" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
                <div className="flex h-16 items-center justify-between border-b px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">J</span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      JHEX HRMS
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`
                            flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium
                            ${
                              isActive
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }
                          `}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span
                            className={`${
                              isActive ? "text-blue-600" : "text-gray-400"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
