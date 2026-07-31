"use client";

import React from "react";
import { usePeople } from "@/hooks/usePeople";
import { adaptApiPersonToPerson } from "@/models/person";
import { PeopleView } from "@/components/views/PeopleView";

export default function PeoplePage() {
  const { people: apiPeople } = usePeople();

  const people = React.useMemo(
    () =>
      Array.isArray(apiPeople) ? apiPeople.map(adaptApiPersonToPerson) : [],
    [apiPeople],
  );

  return <PeopleView people={people} />;
}
