// src/components/dashboard/admin/HRTeam.tsx
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserIcon } from "lucide-react";

export interface HRGridItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  hireDate?: string;
}

interface HRGridProps {
  hrData: HRGridItem[];
}

export function HRGrid({ hrData }: HRGridProps) {
  if (!hrData.length) {
    return <p className="text-center text-gray-500">No HR found.</p>;
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {hrData.map((u) => (
        <Link key={u.id} to={`/hr/${u.id}`} className="block">
          <Card className="cursor-pointer transform transition hover:-translate-y-1 hover:shadow-lg border">
            <CardHeader className="flex items-center space-x-3 pb-2 border-b">
              <Avatar className="w-10 h-10">
                {u.avatar ? (
                  <AvatarImage src={u.avatar} alt={u.name} />
                ) : (
                  <AvatarFallback>
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{u.name}</h3>
                <p className="text-xs text-gray-500">
                  {u.location ?? <span className="italic">No location</span>}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-1 pt-2">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {u.email}
              </p>
              {u.phone && (
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {u.phone}
                </p>
              )}
              {u.hireDate && (
                <p className="text-xs text-gray-500">
                  Hired: {new Date(u.hireDate).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
