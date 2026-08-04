"use client";

import React from "react";
import { usePeople } from "@/hooks/usePeople";
import { useEvents } from "@/hooks/useEvents";
import { useRegistrations } from "@/hooks/useRegistrations";
import { adaptApiPersonToPerson, ICreatePersonPayload } from "@/models/person";
import { PeopleView } from "@/components/views/PeopleView";
import { IRegisterPayload } from "@/models/registration";

export default function PeoplePage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
    }),
    [page, limit, search],
  );

  const {
    people: apiPeople,
    meta,
    createPerson,
    isCreating,
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
    payload: IRegisterPayload,
  ) => {
    await registerAttendee({ eventId, dto: payload });
  };

  const handleAddPerson = async (payload: ICreatePersonPayload) => {
    await createPerson(payload);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
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
    />
  );
}
