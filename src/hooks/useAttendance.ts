import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Attendance = Tables<"attendance">;

export interface AttendanceWithEmployee extends Attendance {
  employees: {
    full_name: string;
    employee_id: string;
    department: string;
  };
}

export function useAttendance(filters?: { employeeId?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ["attendance", filters],
    queryFn: async () => {
      let query = supabase
        .from("attendance")
        .select("*, employees(full_name, employee_id, department)")
        .order("date", { ascending: false });

      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }
      if (filters?.dateFrom) {
        query = query.gte("date", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("date", filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AttendanceWithEmployee[];
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: { employee_id: string; date: string; status: string }) => {
      const { data, error } = await supabase
        .from("attendance")
        .upsert(record, { onConflict: "employee_id,date" })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance marked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useEmployeeAttendanceSummary() {
  return useQuery({
    queryKey: ["attendance-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("employee_id, status, employees(full_name, employee_id, department)");
      if (error) throw error;

      const summary: Record<string, { 
        employeeUuid: string;
        employeeId: string; 
        fullName: string; 
        department: string;
        present: number; 
        absent: number; 
        total: number 
      }> = {};

      for (const record of data as AttendanceWithEmployee[]) {
        const key = record.employee_id;
        if (!summary[key]) {
          summary[key] = {
            employeeUuid: record.employee_id,
            employeeId: record.employees.employee_id,
            fullName: record.employees.full_name,
            department: record.employees.department,
            present: 0,
            absent: 0,
            total: 0,
          };
        }
        summary[key].total++;
        if (record.status === "Present") {
          summary[key].present++;
        } else {
          summary[key].absent++;
        }
      }

      return Object.values(summary);
    },
  });
}
