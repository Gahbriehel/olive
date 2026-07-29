import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { ChurchEvent } from "@/types/dashboard";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (
    newEvent: Omit<
      ChurchEvent,
      "id" | "registeredCount" | "checkedInCount" | "status"
    >,
  ) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<ChurchEvent["category"]>("Youth Conference");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("1500");
  const [startDate, setStartDate] = useState("2026-08-15");
  const [endDate, setEndDate] = useState("2026-08-17");
  const [registrationDeadline, setRegistrationDeadline] =
    useState("2026-08-10");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    onCreateEvent({
      name,
      category,
      description,
      location,
      capacity: Number(capacity) || 1000,
      startDate,
      endDate,
      registrationDeadline,
      teamAssignmentEnabled: true,
    });

    // Reset
    setName("");
    setDescription("");
    setLocation("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Church Event"
      description="Set up a conference, worship night, or ministry event with registration tracking"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Event Title *"
          placeholder="e.g. Leadership Summit 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Event Category
            </label>
            <Select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ChurchEvent["category"])
              }
            >
              <option value="Youth Conference">Youth Conference</option>
              <option value="Worship Night">Worship Night</option>
              <option value="Leadership Retreat">Leadership Retreat</option>
              <option value="Community Outreach">Community Outreach</option>
            </Select>
          </div>

          <Input
            label="Capacity (Max Registrants) *"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Event Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Brief overview of event goals, target age group, and theme..."
          />
        </div>

        <Input
          label="Venue / Location Address *"
          placeholder="e.g. Main Sanctuary & Youth Center, City Campus"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Start Date *"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End Date *"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <Input
            label="Deadline *"
            type="date"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            required
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save & Publish Event
          </Button>
        </div>
      </form>
    </Modal>
  );
};
