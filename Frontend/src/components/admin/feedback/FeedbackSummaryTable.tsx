// src/components/admin/feedback/FeedbackSummaryTable.tsx

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FeedbackSummary } from "@/apis/HR/feedBackApi";

interface FeedbackSummaryTableProps {
  data: FeedbackSummary[];
}

export function FeedbackSummaryTable({ data }: FeedbackSummaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          <strong>Positivity&nbsp;%</strong> represents the share of positive
          feedback among all responses for a given application.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App ID</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Positive</TableHead>
              <TableHead>Negative</TableHead>
              <TableHead>Positivity&nbsp;%</TableHead>
              <TableHead>Reasons</TableHead>
              <TableHead>Comments</TableHead> {/* new header */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.application_id}>
                <TableCell>{item.application_id}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.total}</TableCell>
                <TableCell>{item.positive}</TableCell>
                <TableCell>{item.negative}</TableCell>
                <TableCell>
                  {(item.positivity_rate * 100).toFixed(1)}%
                </TableCell>
                <TableCell>
                  {Object.entries(item.reasons).map(([reason, count]) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <span className="font-medium">
                        {reason.replace(/_/g, " ")}:
                      </span>
                      <span>{count}</span>
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {item.custom_comments.length > 0 ? (
                    item.custom_comments.map((c, i) => (
                      <div key={i} className="mb-1">
                        {c}
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
