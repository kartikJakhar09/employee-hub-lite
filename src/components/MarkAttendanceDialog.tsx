import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useMarkAttendance } from "@/hooks/useAttendance";
import { format } from "date-fns";
import { z } from "zod";

const attendanceSchema = z.object({
  employee_id: z.string().min(1, "Please select an employee"),
  date: z.string().min(1, "Please select a date"),
  status: z.string().min(1, "Please select status"),
});

export default function MarkAttendanceDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", date: format(new Date(), "yyyy-MM-dd"), status: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: employees } = useEmployees();
  const markAttendance = useMarkAttendance();

  const resetForm = () => {
    setForm({ employee_id: "", date: format(new Date(), "yyyy-MM-dd"), status: "" });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = attendanceSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await markAttendance.mutateAsync(result.data as { employee_id: string; date: string; status: string });
      resetForm();
      setOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <CalendarCheck className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Mark Attendance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="att-employee">Employee</Label>
            <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_id && <p className="text-xs text-destructive">{errors.employee_id}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="att-date">Date</Label>
            <Input
              id="att-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="att-status">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={markAttendance.isPending}>
              {markAttendance.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mark Attendance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
