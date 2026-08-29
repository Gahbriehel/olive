import { IRegistration } from "@/types/dashboard";

export const exportToCsv = (
  registrations: IRegistration[] = [],
  filenamePrefix = "YC26_Registrations",
) => {
  const headers = [
    "Registration Number",
    "Name",
    "Email",
    "Phone",
    "Gender",
    "Membership",
    "Team",
    "Status",
  ];
  const rows = registrations.map((r) => [
    r.registrationNumber,
    `"${r.name}"`,
    r.email,
    r.phone,
    r.gender,
    r.membershipStatus,
    `"${r.team?.name || ""}"`,
    r.status,
  ]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
