import React, { useState } from "react";
import { Search, UserPlus, Eye, History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Tabs } from "@/components/ui/Tabs";
import { Person } from "@/types/dashboard";

interface PeopleViewProps {
  people: Person[];
}

export const PeopleView: React.FC<PeopleViewProps> = ({ people }) => {
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [drawerTab, setDrawerTab] = useState("info");

  const filteredPeople = people.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    const matchesMember =
      membershipFilter === "All" || p.membershipStatus === membershipFilter;
    const matchesGender = genderFilter === "All" || p.gender === genderFilter;
    return matchesSearch && matchesMember && matchesGender;
  });

  const drawerTabs = [
    { id: "info", label: "Details" },
    {
      id: "departments",
      label: "Departments",
      count: selectedPerson?.departmentsPlaceholder.length || 0,
    },
    {
      id: "attendance",
      label: "Attendance",
      count: selectedPerson?.attendanceHistoryPlaceholder.length || 0,
    },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            People Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Central repository of church members, youth conference attendees,
            and first-time guests.
          </p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
          Add New Person
        </Button>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Member">Member</option>
            <option value="Visitor">Visitor</option>
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>
        </div>
      </div>

      {/* People Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="p-3.5 pl-5">Person</th>
                <th className="p-3.5">Contact Info</th>
                <th className="p-3.5">Gender / DOB</th>
                <th className="p-3.5">Membership</th>
                <th className="p-3.5">Events Attended</th>
                <th className="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-slate-300">
              {filteredPeople.map((person) => (
                <tr
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {person.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          ID: {person.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium text-slate-900 dark:text-slate-200">
                      {person.email}
                    </p>
                    <p className="text-[11px] text-slate-400">{person.phone}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium">{person.gender}</p>
                    <p className="text-[11px] text-slate-400">
                      DOB: {person.dob}
                    </p>
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={
                        person.membershipStatus === "Member"
                          ? "emerald"
                          : "amber"
                      }
                    >
                      {person.membershipStatus}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-mono font-semibold">
                    {person.registrationHistoryCount} Events
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPerson(person);
                      }}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500" />}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Person Details Slide-Over Drawer */}
      <Drawer
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        title={selectedPerson?.name || ""}
        subtitle={`Member Profile • ID: ${selectedPerson?.id || ""}`}
      >
        {selectedPerson && (
          <div className="space-y-6">
            {/* Header Badge Card */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                  {selectedPerson.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {selectedPerson.name}
                  </h3>
                  <Badge
                    variant={
                      selectedPerson.membershipStatus === "Member"
                        ? "emerald"
                        : "amber"
                    }
                    size="sm"
                  >
                    {selectedPerson.membershipStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Drawer Sub-Tabs */}
            <Tabs
              tabs={drawerTabs}
              activeTab={drawerTab}
              onChange={setDrawerTab}
            />

            {/* Details Tab */}
            {drawerTab === "info" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Phone Number
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {selectedPerson.phone}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Email Address
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                      {selectedPerson.email}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Gender
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {selectedPerson.gender}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Date of Birth
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {selectedPerson.dob}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-indigo-500" />
                    Registration History (
                    {selectedPerson.registrationHistoryCount} Events)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Youth Conference 2026: IGNITE (Confirmed • Team Tempest)
                  </p>
                </div>
              </div>
            )}

            {/* Placeholder Tabs for Scalability */}
            {drawerTab === "departments" && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Church ministry department memberships:
                </p>
                {selectedPerson.departmentsPlaceholder.map((dept, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
                  >
                    <span>{dept}</span>
                    <Badge variant="indigo" size="sm">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {drawerTab === "attendance" && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Historical event check-in log:
                </p>
                {selectedPerson.attendanceHistoryPlaceholder.map(
                  (hist, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {hist.eventName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {hist.date}
                        </p>
                      </div>
                      <Badge
                        variant={hist.attended ? "emerald" : "rose"}
                        size="sm"
                      >
                        {hist.attended ? "Attended" : "Absent"}
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            )}

            {drawerTab === "notes" && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Administrator & Pastoral Notes:
                </p>
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 font-medium">
                  {selectedPerson.notesPlaceholder}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
