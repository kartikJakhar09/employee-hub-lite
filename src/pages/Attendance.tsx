import { useState } from "react";
import { CalendarCheck, Search, Filter } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarkAttendanceDialog from "@/components/MarkAttendanceDialog";
import AttendanceTable from "@/components/AttendanceTable";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

export default function Attendance() {
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: employees } = useEmployees();
  const { data: records, isLoading, error, refetch } = useAttendance({
    employeeId: employeeFilter && employeeFilter !== "all" ? employeeFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  if (isLoading) return <LoadingSpinner message="Loading attendance records..." />;
  if (error) return <ErrorState message="Failed to load attendance records" onRetry={() => refetch()} />;

  const hasFilters = (employeeFilter && employeeFilter !== "all") || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            {records?.length ?? 0} record{records?.length !== 1 ? "s" : ""}{hasFilters ? " (filtered)" : ""}
          </p>
        </div>
        <MarkAttendanceDialog />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Employee</Label>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {employees?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">From Date</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">To Date</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {!records || records.length === 0 ? (
        <EmptyState
          icon={hasFilters ? Search : CalendarCheck}
          title={hasFilters ? "No matching records" : "No attendance records yet"}
          description={hasFilters ? "Try adjusting your filters to find records." : "Start marking attendance for employees to see records here."}
          action={!hasFilters ? <MarkAttendanceDialog /> : undefined}
        />
      ) : (
        <AttendanceTable records={records} />
      )}
    </div>
  );
}
