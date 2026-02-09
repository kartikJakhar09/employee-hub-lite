import { Users, CalendarCheck, UserCheck, UserX } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useAttendance, useEmployeeAttendanceSummary } from "@/hooks/useAttendance";
import StatsCard from "@/components/StatsCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: employees, isLoading: empLoading, error: empError } = useEmployees();
  const { data: todayAttendance, isLoading: attLoading } = useAttendance({
    dateFrom: format(new Date(), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
  });
  const { data: summary, isLoading: sumLoading } = useEmployeeAttendanceSummary();

  if (empLoading || attLoading || sumLoading) return <LoadingSpinner message="Loading dashboard..." />;
  if (empError) return <ErrorState message="Failed to load dashboard data" />;

  const totalEmployees = employees?.length ?? 0;
  const presentToday = todayAttendance?.filter((a) => a.status === "Present").length ?? 0;
  const absentToday = todayAttendance?.filter((a) => a.status === "Absent").length ?? 0;
  const departments = new Set(employees?.map((e) => e.department)).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your HR metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Employees" value={totalEmployees} icon={Users} variant="primary" subtitle={`${departments} department${departments !== 1 ? "s" : ""}`} />
        <StatsCard title="Present Today" value={presentToday} icon={UserCheck} variant="success" subtitle={format(new Date(), "MMM d, yyyy")} />
        <StatsCard title="Absent Today" value={absentToday} icon={UserX} variant="warning" subtitle={format(new Date(), "MMM d, yyyy")} />
        <StatsCard title="Attendance Rate" value={todayAttendance && todayAttendance.length > 0 ? `${Math.round((presentToday / todayAttendance.length) * 100)}%` : "—"} icon={CalendarCheck} variant="info" subtitle="Today's rate" />
      </div>

      {/* Attendance Summary Table */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Employee Attendance Summary</h2>
        {!summary || summary.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance data yet"
            description="Start marking attendance to see summary stats here."
          />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Employee ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Department</TableHead>
                  <TableHead className="font-semibold text-center">Present</TableHead>
                  <TableHead className="font-semibold text-center">Absent</TableHead>
                  <TableHead className="font-semibold text-center">Total Days</TableHead>
                  <TableHead className="font-semibold text-center hidden sm:table-cell">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((s) => (
                  <TableRow key={s.employeeUuid}>
                    <TableCell className="font-mono text-sm font-medium">{s.employeeId}</TableCell>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="font-normal">{s.department}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-success font-medium">{s.present}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-destructive font-medium">{s.absent}</span>
                    </TableCell>
                    <TableCell className="text-center font-medium">{s.total}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {Math.round((s.present / s.total) * 100)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
