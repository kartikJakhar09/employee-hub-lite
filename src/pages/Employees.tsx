import { Users, Search } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import AddEmployeeDialog from "@/components/AddEmployeeDialog";
import EmployeeTable from "@/components/EmployeeTable";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

export default function Employees() {
  const { data: employees, isLoading, error, refetch } = useEmployees();
  const [search, setSearch] = useState("");

  const filtered = employees?.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner message="Loading employees..." />;
  if (error) return <ErrorState message="Failed to load employees" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">
            {employees?.length ?? 0} employee{employees?.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <AddEmployeeDialog />
      </div>

      {employees && employees.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {!employees || employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees yet"
          description="Add your first employee to get started with your HR management."
          action={<AddEmployeeDialog />}
        />
      ) : filtered && filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`No employees match "${search}". Try a different search term.`}
        />
      ) : (
        <EmployeeTable employees={filtered ?? []} />
      )}
    </div>
  );
}
