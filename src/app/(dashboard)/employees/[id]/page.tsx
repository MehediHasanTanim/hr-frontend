import { EmployeeProfilePage } from "@/features/employees/pages/EmployeeProfilePage";

export default function Page({ params }: { params: { id: string } }) {
  return <EmployeeProfilePage id={params.id} />;
}
