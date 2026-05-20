import { type TokenProp, notifyApiError } from "@/App";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { states, localityTypes } from "@/lib/constants"
import { Label } from "@/components/ui/label"

type Event = {
    _id?: string;
    name?: string;
    description?: string;
    image?: string;
    link?: string;
    address?: string;
    city?: string;
    state?: string;
    county?: string;
    start?: Date;
    end?: Date;
    locality?: number;
}

export default function EventsAdmin({ token }: TokenProp) {
    const eventsApiUrl = `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/events`;
    const [events, setEvents] = useState<Event[]>([]);
    const [newEvent, setNewEvent] = useState<Event>({
        name: "",
        description: "",
        image: "",
        link: "",
        address: "",
        city: "",
        state: "",
        start: new Date(),
        end: new Date(),
        locality: undefined
    });
    const [loading, setLoading] = useState(false);
    const [multiDay, setMultiDay] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editingEventIsNew, setEditingEventIsNew] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);

    const [searchCity, setSearchCity] = useState("");
    const [searchState, setSearchState] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    const eventsPerPage = 6;


    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchEvents();
    }, [token]);

    const fetchEvents = async () => {
        try {
            axios.get(
                eventsApiUrl,
                authHeaders
            ).then(res => {
                setEvents(res.data.events ?? []);
            }).catch((err: AxiosError) => {
                if (err.response && err.response.status === 404) return; 
                notifyApiError(err, "fetch events");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const resetNewEvent = () => {
        setNewEvent({
            name: "",
            description: "",
            image: "",
            link: "",
            address: "",
            city: "",
            state: "",
            start: new Date(),
            end: new Date(),
            locality: undefined
        });
        setEditingEventId(null);
    }

    const beginCreatingEvent = () => {
        setEditingEventIsNew(true);
        resetNewEvent();
        setEditingEventId("New event, ID not yet assigned");
        setMultiDay(false);
    }

    const addEvent = async () => {
        try {
            setLoading(true);

            axios.post(
                eventsApiUrl,
                {
                    name: newEvent.name,
                    description: newEvent.description || undefined,
                    image: newEvent.image || undefined,
                    link: newEvent.link || undefined,
                    address: newEvent.address || undefined,
                    city: newEvent.city || undefined,
                    state: newEvent.state || undefined,
                    start: newEvent.start || undefined,
                    end: newEvent.end || undefined,
                    locality: newEvent.locality
                },
                authHeaders
            ).then(res => {
                setEvents(prev => [...prev, { _id: res.data.eventId, ...newEvent }]);
                resetNewEvent();
                fetchEvents();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "add event");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const beginEditingEvent = async (id?: string) => {
        if (!id) return;
        if (editingEventId && !window.confirm("Any changes will be lost!")) return;
        setEditingEventIsNew(false);
        try {
            axios.get(
                `${eventsApiUrl}/${id}`, authHeaders
            ).then(res => {
                const selectedEvent = {
                    name: res.data.name,
                    description: res.data.description,
                    image: res.data.image,
                    link: res.data.link,
                    address: res.data.address,
                    city: res.data.city,
                    state: res.data.state,
                    start: new Date(res.data.start),
                    end: new Date(res.data.end),
                    locality: res.data.locality
                }
                setNewEvent(selectedEvent);
                setMultiDay(selectedEvent.start?.getDate() != selectedEvent.end?.getDate()
                    || selectedEvent.start?.getMonth() != selectedEvent.end?.getMonth()
                    || selectedEvent.start?.getFullYear() != selectedEvent.end?.getFullYear());

                setEditingEventId(id);
            }).catch((err: AxiosError) => {
                notifyApiError(err, "get event");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const cancelEventEdit = () => {
        if (!window.confirm("Cancel editing? Any changes will be lost!")) return;
        setEditingEventId(null);
        resetNewEvent();
    }

    const saveEventEdit = async () => {
        if (!editingEventId) return;

        try {
            axios.put(
                `${eventsApiUrl}/${editingEventId}`,
                newEvent,
                authHeaders
            ).then(res => {
                setEvents((prev) => prev.map((e) => e._id === editingEventId ? res.data.event : e));
                resetNewEvent();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "save event");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const deleteEvent = async (id?: string) => {
        if (!id) return;
        if (!window.confirm("Delete this event permanently?")) return;

        try {
            axios.delete(
                `${eventsApiUrl}/${id}`,
                authHeaders
            ).then(() => {
                setEvents((prev) => prev.filter((e) => e._id !== id));
            }).catch((err: AxiosError) => {
                notifyApiError(err, "delete event");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const searchEvents = async () => {
        if (searchCity == "" && searchState == "" && searchKeyword == "") {
            fetchEvents();
            return;
        }

        const cityParam = searchCity == "" ? "NULL" : searchCity;
        const stateParam = searchState == "" ? "NULL" : searchState;
        const keywordParam = searchKeyword == "" ? "NULL" : searchKeyword;

        try {
            axios.get(
                `${eventsApiUrl}/filtered/${stateParam}/${cityParam}/${keywordParam}`
            ).then(res => {
                setEvents(res.data.events);
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setEvents([]);
                        return;
                    }
                    notifyApiError(err, "search events");
                }
            });
        }
        catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
            setEvents([]);
        }
    };

    const clearSearchFilter = async () => {
        setSearchCity("");
        setSearchState("");
        setSearchKeyword("");
        fetchEvents();
    };

    return (
        <div>
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 pb-5">Event Management</h2>
            </div>

            {/* Event Search */}
            <Card className="mb-6">
                <CardContent>
                    <div className="flex justify-center gap-2">
                        <Select value={searchState} onValueChange={(value) => setSearchState(value)}>
                            <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    <SelectLabel>State</SelectLabel>
                                    {Object.entries(states).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Input
                            className="p-2 rounded w-65"
                            placeholder="City"
                            value={searchCity}
                            onChange={e => setSearchCity(e.target.value)}
                        />
                        <Input
                            className="p-2 rounded w-80"
                            placeholder="Keyword"
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                        />
                        <button
                            onClick={clearSearchFilter}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={searchEvents}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Search
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Event List */}
            <Card className="mb-15">
                <CardHeader>
                    {
                        events.length !== 0 ?
                            <CardTitle className="text-xl">Showing page {pageNumber + 1} of {Math.ceil(events.length / eventsPerPage)}</CardTitle>
                            :
                            <CardTitle className="text-gray-400 text-xl font-normal mt-4">No events found.</CardTitle>
                    }
                </CardHeader>
                <CardContent>
                    { events.length !== 0 &&
                        <div className="flex flex-wrap justify-center mb-3">
                            {events.slice(pageNumber * eventsPerPage, ((pageNumber + 1) * eventsPerPage)).map((event) => (
                                <div
                                    key={event._id}
                                    className="w-[20rem] h-[10rem] border border-gray-200 rounded-lg p-[1.5rem] m-[0.8rem] bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col justify-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                {event.name}
                                            </h3>
                                            <p className="text-gray-500">
                                                {
                                                    "(" + (!event.city && !event.state ?
                                                        "Nation-wide"
                                                        :
                                                        (
                                                            (event.city && event.city != "" ? event.city + ", " : "")
                                                            + (event.state && event.state != "" ? event.state : "")
                                                        )
                                                    ) + ")"
                                                }
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 justify-center">
                                            <button
                                                onClick={() => {
                                                    beginEditingEvent(event._id);
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteEvent(event._id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    <div className="flex justify-center gap-2 pb-3 mt-3">
                        { /* Previous page */}
                        <button
                            onClick={() => setPageNumber(pageNumber - 1)}
                            disabled={pageNumber <= 0}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Last Page
                        </button>
                        { /* Add new event */}
                        <button
                            onClick={beginCreatingEvent}
                            disabled={loading || editingEventId != null}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Add New Event
                        </button>
                        { /* Next page */}
                        <button
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={((pageNumber + 1) * eventsPerPage) > events.length}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Page
                        </button>
                    </div>
                </CardContent>
            </Card>

            {
                /* Edit Event */
                editingEventId &&
                <Card className="mb-8">
                    <CardHeader>
                            <CardTitle className="text-xl">{editingEventId == "New event, ID not yet assigned" ? "Create Event" : "Edit Event"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="flex flex-wrap font-semibold mb-2">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Event name"
                                    value={newEvent.name}
                                    onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                                />
                                </div>
                            <div>
                                <Textarea
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Description"
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Image link"
                                    value={newEvent.image}
                                    onChange={e => setNewEvent({ ...newEvent, image: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Event link"
                                    value={newEvent.link}
                                    onChange={e => setNewEvent({ ...newEvent, link: e.target.value })}
                                />
                            </div>
                            <h3 className="flex flex-wrap font-semibold mb-2">Location</h3>
                            <div>
                                <Select value={newEvent.locality?.toString()} onValueChange={(value) => setNewEvent({ ...newEvent, locality: Number.parseInt(value) })}>
                                    <SelectTrigger className="w-full max-w-48">
                                        <SelectValue placeholder="Locality" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Locality</SelectLabel>
                                            {Object.entries(localityTypes).map(([label, value]) => (
                                                <SelectItem key={value} value={value + ""}>
                                                    {label + "-wide"}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            {(newEvent.locality != undefined && newEvent.locality != 2) &&
                                <div className="flex flex-wrap gap-2 pb-4">
                                    {newEvent.locality == 0 &&
                                        <>
                                            <Input
                                                type="text"
                                                className="p-2 rounded flex-1"
                                                placeholder="Address"
                                                value={newEvent.address}
                                                onChange={e => setNewEvent({ ...newEvent, address: e.target.value })}
                                            />
                                            <Input
                                                className="p-2 rounded flex-1"
                                                placeholder="City"
                                                value={newEvent.city}
                                                onChange={e => setNewEvent({ ...newEvent, city: e.target.value })}
                                            />
                                        </>
                                    }
                                    <Select value={newEvent.state} onValueChange={(value) => setNewEvent({ ...newEvent, state: value })}>
                                        <SelectTrigger className="w-full max-w-48">
                                            <SelectValue placeholder="State" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                <SelectLabel>State</SelectLabel>
                                                {Object.entries(states).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            }
                            <h3 className="flex flex-wrap font-semibold mb-2">Time</h3>
                            <div className="flex flex-wrap gap-2 pb-4">
                                <Label>One-day</Label>
                                    <Switch checked={multiDay} onCheckedChange={e => {
                                        setMultiDay(e)
                                        if (!e) {
                                            setNewEvent({ ...newEvent, end: newEvent.start })
                                        }
                                    }} />
                                <Label>Multi-day</Label>
                            </div>
                            {!multiDay &&
                                <div className="flex flex-wrap gap-2 pb-4">
                                    <div>
                                        <Label className="pb-2">Date</Label>
                                        <Input
                                            type="date"
                                            placeholder="Start time"
                                            className="p-2 rounded w-50"
                                            value={newEvent.start?.toLocaleDateString('en-CA')}
                                            onChange={e => {
                                                const inputDate = new Date(e.target.value + "T00:00:00")
                                                setNewEvent({ ...newEvent, start: inputDate, end: inputDate })
                                            }}
                                        />
                                    </div>
                                </div>
                            }
                            {multiDay &&
                                <>
                                    <div className="flex flex-wrap gap-2 pb-4">
                                        <div>
                                            <Label className="pb-2">Date</Label>
                                            <Input
                                                type="date"
                                                placeholder="Start date"
                                                className="p-2 rounded w-50"
                                                value={newEvent.start?.toLocaleDateString('en-CA')}
                                                onChange={e => {
                                                    const inputDate = new Date(e.target.value + "T00:00:00")
                                                    let currentDate = newEvent.start;
                                                    if (currentDate == undefined) currentDate = new Date()

                                                    currentDate.setFullYear(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())

                                                    setNewEvent({ ...newEvent, start: currentDate })
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Label className="pb-2">Date</Label>
                                            <Input
                                                type="date"
                                                placeholder="End date"
                                                className="p-2 rounded w-50"
                                                value={newEvent.end?.toLocaleDateString('en-CA')}
                                                onChange={e => {
                                                    const inputDate = new Date(e.target.value + "T00:00:00")
                                                    let currentDate = newEvent.end;
                                                    if (currentDate == undefined) currentDate = new Date()

                                                    currentDate.setFullYear(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())

                                                    setNewEvent({ ...newEvent, end: currentDate })
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            }
                            {
                                editingEventIsNew && (
                                    <button
                                        onClick={addEvent}
                                            disabled={
                                                loading || !newEvent.name || !newEvent.description || !newEvent.image || !newEvent.link || newEvent.locality === undefined
                                                || (newEvent.locality != localityTypes.Nation && !newEvent.state) || (newEvent.locality == localityTypes.City && (!newEvent.city || !newEvent.address))
                                                || !newEvent.start || !newEvent.end || (newEvent.end < newEvent.start)
                                            }
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Adding...
                                            </span>
                                        ) : (
                                            "Add Event"
                                        )}
                                    </button>
                                )
                            }
                            {
                                !editingEventIsNew && (
                                    <button
                                        onClick={saveEventEdit}
                                        disabled={
                                            loading || !newEvent.name || !newEvent.description || !newEvent.image || !newEvent.link || newEvent.locality === undefined
                                            || (newEvent.locality != localityTypes.Nation && !newEvent.state) || (newEvent.locality == localityTypes.City && !newEvent.city)
                                            || !newEvent.start || !newEvent.end || (newEvent.end < newEvent.start)
                                        }
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : (
                                            "Save Event"
                                        )}
                                    </button>
                                )
                            }
                            <button
                                onClick={cancelEventEdit}
                                disabled={loading}
                                className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </CardContent>
                </Card>
            }
        </div>
    );
}
