"use client";

import { NavLink } from "react-router-dom";
import {
  LayoutDashboardIcon,
  FileIcon,
  StarIcon,
  FilePlusIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  HelpCircleIcon,
  ListIcon,
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
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ui/theme-provider";

const navItems = [
  { title: "Overview", url: "/Candidate", icon: LayoutDashboardIcon },
  { title: "Jobs", url: "/jobs", icon: FileIcon },
  { title: "Favoris", url: "/favorites", icon: StarIcon },
  { title: "New Resume", url: "/new-resume", icon: FilePlusIcon },
];

export function UserSidebar() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const nextModeLabel = isDark ? "Light Mode" : "Dark Mode";
  const NextIcon = isDark ? SunIcon : MoonIcon;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="!p-1.5">
              <NavLink to="/" className="flex items-center space-x-2">
                <ListIcon className="h-6 w-6 text-accent-foreground" />
                <span className="text-xl font-bold">
                  Resumy{" "}
                  <span className="text-sm text-muted-foreground">
                    AI-Powered
                  </span>
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <Separator className="my-2 h-px bg-muted" />

      <SidebarContent className="flex flex-col">
        <SidebarMenu className="space-y-1 px-2">
          {navItems.map((item) => (
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
          <SidebarMenu className="space-y-1">
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
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="w-full">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/helpu"
                className="flex items-center w-full p-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <HelpCircleIcon className="h-5 w-5 mr-3" />
                Help
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
