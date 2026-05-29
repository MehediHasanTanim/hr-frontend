import { EmployeeEditPage } from "@/features/employees/pages/EmployeeEditPage";

export default function Page({ params }: { params: { id: string } }) {
  return <EmployeeEditPage id={params.id} />;
}
