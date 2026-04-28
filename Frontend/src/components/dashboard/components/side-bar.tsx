"use client";

import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowUpCircleIcon,
  LayoutDashboardIcon,
  BarChartBigIcon,
  BriefcaseIcon,
  UsersIcon,
  ClipboardListIcon,
  HelpCircleIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { NavDocuments } from "./nav-documents";
import { NavUser } from "./nav-user";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ui/theme-provider";

const data = {
  navMain: [
    { title: "Dashboard", url: "/", icon: LayoutDashboardIcon },
    { title: "Decisions", url: "/decisionsDashboard", icon: BarChartBigIcon },
    { title: "Jobs", url: "/jobpostings", icon: BriefcaseIcon },
    { title: "Interviews", url: "/interviews", icon: UsersIcon },
  ],
  documents: [
    { name: "Reports", url: "/report", icon: ClipboardListIcon },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  React.useEffect(() => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setTheme("light");
      }
    } else if (theme === "dark") {
      setTheme("light");
    }
  }, []);

  const nextModeLabel = isDark ? "Light Mode" : "Dark Mode";
  const NextIcon = isDark ? SunIcon : MoonIcon;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="!p-1.5">
              <NavLink to="/" className="flex items-center space-x-2">
                <ArrowUpCircleIcon className="h-6 w-6 text-accent-foreground" />
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
          {data.navMain.map((item) => (
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
          <NavDocuments items={data.documents} />

          <SidebarMenu className="mt-4 space-y-1">
            {/* Settings popover */}
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

            {/* Help link */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/Help"
                  className="flex items-center p-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <HelpCircleIcon className="h-5 w-5 mr-3" />
                  Help
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
