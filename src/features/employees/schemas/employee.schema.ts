import { z } from "zod";

const phonePattern = /^[+]?[\d\s().-]{7,20}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const requiredString = (message: string) => z.string().trim().min(1, message);
const optionalDate = z.string().trim().refine((value) => value === "" || datePattern.test(value), "Use YYYY-MM-DD format");

export const employeeFormSchema = z.object({
  firstName: requiredString("First name is required"),
  lastName: requiredString("Last name is required"),
  email: requiredString("Email is required").email("Enter a valid email address"),
  phone: requiredString("Phone is required").regex(phonePattern, "Enter a valid phone number"),
  dateOfBirth: optionalDate,
  gender: z.enum(["female", "male", "non_binary", "prefer_not_to_say", ""]),
  nationalId: z.string().trim(),
  passportNumber: z.string().trim(),
  employeeNumber: requiredString("Employee number is required"),
  employeeType: z.enum(["full_time", "part_time", "contractor", "intern", ""]).refine(Boolean, "Employee type is required"),
  status: z.enum(["active", "inactive", "on_leave", "terminated", ""]).refine(Boolean, "Employment status is required"),
  joiningDate: requiredString("Joining date is required").regex(datePattern, "Use YYYY-MM-DD format"),
  probationEndDate: optionalDate,
  workEmail: z.string().trim().email("Enter a valid work email").or(z.literal("")),
  departmentId: requiredString("Department is required"),
  jobTitle: requiredString("Job title is required"),
  payGrade: z.string().trim(),
  managerId: z.string().trim(),
  location: requiredString("Location is required"),
  bankName: z.string().trim(),
  branchName: z.string().trim(),
  accountHolderName: z.string().trim(),
  accountNumber: requiredString("Account number is required"),
  routingNumber: z.string().trim(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
