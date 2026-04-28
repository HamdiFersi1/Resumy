// src/components/UserDashboard/UserNavbar.tsx
import { NavLink } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserNavbar() {
  return (
    <Tabs defaultValue="overview" className="bg-background px-6">
      <TabsList>
        <TabsTrigger value="overview" asChild>
          <NavLink to="/dashboard">Overview</NavLink>
        </TabsTrigger>
        <TabsTrigger value="applications" asChild>
          <NavLink to="/dashboard/applications">Applications</NavLink>
        </TabsTrigger>
        <TabsTrigger value="recommended" asChild>
          <NavLink to="/dashboard/recommended">Recommended</NavLink>
        </TabsTrigger>
        <TabsTrigger value="settings" asChild>
          <NavLink to="/dashboard/settings">Settings</NavLink>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
