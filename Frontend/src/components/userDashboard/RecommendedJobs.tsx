// src/components/UserDashboard/RecommendedJobs.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
};

type Props = { jobs: Job[] };

export function RecommendedJobs({ jobs }: Props) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 space-y-4">
          {jobs.length === 0 ? (
            <p className="text-muted-foreground">No new recommendations.</p>
          ) : (
            jobs.map((j) => (
              <div
                key={j.id}
                className="flex justify-between items-center rounded-lg border p-4"
              >
                <div>
                  <h3 className="text-lg font-medium">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {j.company} • {j.location}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/jobs/${j.id}/apply`)}
                >
                  Apply
                </Button>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
