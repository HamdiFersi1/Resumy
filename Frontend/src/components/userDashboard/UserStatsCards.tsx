// src/components/UserDashboard/UserStatsCards.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Props = {
  sent: number;
  interviews: number;
};

export function UserStatsCards({ sent, interviews }: Props) {
  const stats = [
    { label: "Applications Sent", value: `${sent}` },
    { label: "Interviews Scheduled", value: `${interviews}` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((s) => (
        <Card key={s.label} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm">{s.label}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{s.value}</CardContent>
        </Card>
      ))}
    </div>
  );
}
