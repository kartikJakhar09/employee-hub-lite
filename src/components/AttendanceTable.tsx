import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AttendanceWithEmployee } from "@/hooks/useAttendance";
import { format } from "date-fns";

interface AttendanceTableProps {
  records: AttendanceWithEmployee[];
}

export default function AttendanceTable({ records }: AttendanceTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Employee ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold hidden sm:table-cell">Department</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((rec) => (
            <TableRow key={rec.id}>
              <TableCell className="font-mono text-sm font-medium">{rec.employees.employee_id}</TableCell>
              <TableCell className="font-medium">{rec.employees.full_name}</TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">
                <Badge variant="secondary" className="font-normal">{rec.employees.department}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(rec.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Badge
                  variant={rec.status === "Present" ? "default" : "destructive"}
                  className={rec.status === "Present" ? "bg-success/10 text-success border-success/20 hover:bg-success/20" : ""}
                >
                  {rec.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
