"use client";

import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  UsersIcon,
  UserPlusIcon,
  SettingsIcon,
  HelpCircleIcon,
  SunIcon,
  MoonIcon,
  LogOutIcon,
  BarChart3
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useTheme } from "@/components/ui/theme-provider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// ✅ Updated icons for these links
const adminLinks = [
  { title: "HR Users", url: "/admin", icon: UsersIcon },
  { title: "Create HR Agent", url: "/signup-hr", icon: UserPlusIcon },
  { title: "Feedback/Monitor", url: "/admin/feedback", icon:BarChart3
},
];

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  React.useEffect(() => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) setTheme("light");
    } else if (theme === "dark") {
      setTheme("light");
    }
  }, []);

  const nextModeLabel = isDark ? "Light Mode" : "Dark Mode";
  const NextIcon = isDark ? SunIcon : MoonIcon;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="!p-1.5">
              <NavLink to="/admin" className="flex items-center space-x-2">
                <span className="text-xl font-bold">Admin Panel</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <Separator className="my-2 h-px bg-muted" />

      <SidebarContent className="flex flex-col">
        <SidebarMenu className="space-y-1 px-2">
          {adminLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-md text-sm font-medium ${
                      isActive
                        ? "bg-muted text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.title}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-6 border-t border-muted pt-6 px-2">
          <SidebarMenu>
            {/* Theme Switch */}
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton asChild>
                    <button className="flex w-full items-center p-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted">
                      <SettingsIcon className="h-5 w-5 mr-3" />
                      Settings
                    </button>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-48 bg-background p-4 shadow-lg border border-border rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <NextIcon className="h-4 w-4 text-foreground" />
                      <span className="text-sm text-foreground">
                        {nextModeLabel}
                      </span>
                    </div>
                    <Switch
                      checked={isDark}
                      onCheckedChange={(val) =>
                        setTheme(val ? "dark" : "light")
                      }
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>

            {/* Help */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/help"
                  className="flex items-center p-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <HelpCircleIcon className="h-5 w-5 mr-3" />
                  Help
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Logout */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center p-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <LogOutIcon className="h-5 w-5 mr-3" />
                  Log out
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
