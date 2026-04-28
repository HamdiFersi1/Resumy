"use client";

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/hooks/context/AuthContext";
import { useUserNotifications } from "@/hooks/user/useUserNotifications";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ui/theme-provider"; // ✅ Add this

export function UserHeader() {
  const { user, logout } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const { theme } = useTheme(); // ✅ Use theme
  const name = user?.first_name || user?.username || "User";

  const { notifications, setNotifications } = useUserNotifications();
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const clearNotifications = () => setNotifications([]);
  const handleDelete = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const applicationUpdates = notifications.filter(
    (n) =>
      n.application?.status === "accepted" ||
      n.application?.status === "declined"
  );

  const interviewUpdates = notifications.filter(
    (n) => n.interview?.scheduled_at
  );

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-6 space-y-4 md:space-y-0">
        <div className="flex-1">
          <h1 className="text-3xl font-light text-foreground tracking-tight">
            Hello, {name}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back to your dashboard.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded hover:bg-muted transition">
                <Bell className="w-6 h-6 text-foreground" />
                {(applicationUpdates.length > 0 ||
                  interviewUpdates.length > 0) && (
                  <>
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 animate-ping" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-96 max-h-96 overflow-auto space-y-2 p-2 bg-popover text-popover-foreground"
            >
              <div className="flex justify-between items-center px-2 pb-1">
                <p className="text-sm font-semibold">Notifications</p>
                <button
                  className="text-xs text-muted-foreground hover:underline"
                  onClick={clearNotifications}
                >
                  Clear All
                </button>
              </div>

              {applicationUpdates.length === 0 &&
              interviewUpdates.length === 0 ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <>
                  {/* Applications */}
                  {applicationUpdates.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold px-2 pb-1">
                        Application Status
                      </p>
                      {applicationUpdates.map((notif) => (
                        <motion.div
                          key={`app-${notif.id}`}
                          className="relative overflow-hidden"
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          onDragStart={() => {
                            setIsDragging(true);
                            setDraggedId(notif.id);
                          }}
                          onDrag={(_, info) => setDragX(info.point.x)}
                          onDragEnd={() => {
                            setIsDragging(false);
                            if (dragX < -50) handleDelete(notif.id);
                            setDraggedId(null);
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-end pr-4">
                            <motion.div
                              className="bg-red-500 rounded-full p-2"
                              animate={{
                                opacity:
                                  isDragging && draggedId === notif.id ? 1 : 0,
                                scale:
                                  isDragging && draggedId === notif.id ? 1 : 0.5,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </motion.div>
                          </div>
                          <DropdownMenuItem className="relative z-10 whitespace-normal bg-card border border-border shadow-sm rounded-md hover:bg-muted transition">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {notif.application.job.title}{" "}
                                <span className="text-xs text-muted-foreground">
                                  ({notif.application.job.company_name})
                                </span>
                              </p>
                              <p
                                className={`text-xs ${
                                  notif.application.status === "accepted"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {notif.application.status === "accepted"
                                  ? "Accepted"
                                  : "Declined"}
                              </p>
                            </div>
                          </DropdownMenuItem>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Interviews */}
                  {interviewUpdates.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold px-2 pb-1">
                        Scheduled Interviews
                      </p>
                      {interviewUpdates.map((notif) => (
                        <motion.div
                          key={`int-${notif.id}`}
                          className="relative overflow-hidden"
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          onDragStart={() => {
                            setIsDragging(true);
                            setDraggedId(notif.id);
                          }}
                          onDrag={(_, info) => setDragX(info.point.x)}
                          onDragEnd={() => {
                            setIsDragging(false);
                            if (dragX < -50) handleDelete(notif.id);
                            setDraggedId(null);
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-end pr-4">
                            <motion.div
                              className="bg-red-500 rounded-full p-2"
                              animate={{
                                opacity:
                                  isDragging && draggedId === notif.id ? 1 : 0,
                                scale:
                                  isDragging && draggedId === notif.id ? 1 : 0.5,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </motion.div>
                          </div>
                          <DropdownMenuItem className="relative z-10 whitespace-normal bg-card border border-border shadow-sm rounded-md hover:bg-muted transition">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {notif.application?.job?.title || "Interview"}{" "}
                                <span className="text-xs text-muted-foreground">
                                  ({notif.application?.job?.company_name || "N/A"})
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Scheduled at:{" "}
                                {formatDate(notif.interview?.scheduled_at)}
                              </p>
                            </div>
                          </DropdownMenuItem>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/Udashboard/profile")}
          >
            Edit Profile
          </Button>

          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 p-1 rounded hover:bg-muted transition">
                <Avatar className="w-10 h-10 ring-1 ring-border">
                  <AvatarImage src="/avatar-placeholder.png" alt={name} />
                  <AvatarFallback className="text-base">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-5 h-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => logout()}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
