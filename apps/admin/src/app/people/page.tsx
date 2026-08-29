"use client";

import React from "react";
import { usePeople } from "@/hooks/usePeople";
import { useEvents } from "@/hooks/useEvents";
import { useRegistrations } from "@/hooks/useRegistrations";
import { adaptApiPersonToPerson, IPersonPayload } from "@/models/person";
import { PeopleView } from "@/components/views/PeopleView";
import { IRegistrationPayload } from "@/models/registration";

export default function PeoplePage() {
  const [search, setSearch] = React.useState("");
  const [membershipStatus, setMembershipStatus] = React.useState("All");
  const [gender, setGender] = React.useState("All");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      membershipStatus:
        membershipStatus !== "All" ? membershipStatus : undefined,
      gender: gender !== "All" ? gender : undefined,
    }),
    [page, limit, search, membershipStatus, gender],
  );

  const {
    people: apiPeople,
    meta,
    createPerson,
    isCreating,
    refetch,
  } = usePeople(queryParams);
  const { events: apiEvents } = useEvents();
  const { registerAttendee, isRegistering } = useRegistrations();

  const people = React.useMemo(
    () =>
      Array.isArray(apiPeople) ? apiPeople.map(adaptApiPersonToPerson) : [],
    [apiPeople],
  );

  const events = React.useMemo(
    () =>
      Array.isArray(apiEvents)
        ? apiEvents.map((e) => ({ id: e.id, title: e.title }))
        : [],
    [apiEvents],
  );

  const handleRegisterPerson = async (
    eventId: string,
    payload: IRegistrationPayload,
  ) => {
    await registerAttendee({ eventId, dto: payload });
  };

  const handleAddPerson = async (payload: IPersonPayload) => {
    await createPerson(payload);
  };

  const handleSearchChange = React.useCallback((newSearch: string) => {
    setSearch((prevSearch) => {
      if (prevSearch !== newSearch) {
        setPage(1);
      }
      return newSearch;
    });
  }, []);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleMembershipChange = (newStatus: string) => {
    setMembershipStatus(newStatus);
    setPage(1);
  };

  const handleGenderChange = (newGender: string) => {
    setGender(newGender);
    setPage(1);
  };

  return (
    <PeopleView
      people={people}
      events={events}
      onRegisterPerson={handleRegisterPerson}
      isRegistering={isRegistering}
      onAddPerson={handleAddPerson}
      isAddingPerson={isCreating}
      meta={meta}
      page={page}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={handleLimitChange}
      search={search}
      onSearchChange={handleSearchChange}
      membershipFilter={membershipStatus}
      onMembershipFilterChange={handleMembershipChange}
      genderFilter={gender}
      onGenderFilterChange={handleGenderChange}
      onRefetch={refetch}
    />
  );
}
