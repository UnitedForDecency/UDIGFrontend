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
import { localityTypes } from "@/lib/constants"
import { Label } from "@/components/ui/label"
import { State, City } from "country-state-city";
import type { ICity } from "country-state-city";

type Event = {
    id?: string;
    name?: string;
    description?: string;
    imageId?: string;
    link?: string;
    address?: string;
    city?: string | null;
    state?: string | null;
    startDate?: Date;
    endDate?: Date;
}

export default function EventsAdmin({ token }: TokenProp) {
    const eventsApiUrl = `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/events`;
    const [events, setEvents] = useState<Event[]>([]);
    const [newEvent, setNewEvent] = useState<Event>({
        name: "",
        description: "",
        imageId: "",
        link: "",
        address: "",
        city: "",
        state: "",
        startDate: new Date(),
        endDate: new Date(),
    });
    const [loading, setLoading] = useState(false);
    const [multiDay, setMultiDay] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editingEventIsNew, setEditingEventIsNew] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);

    const [searchCity, setSearchCity] = useState("");
    const [searchState, setSearchState] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    const states = State.getStatesOfCountry("US");
    const [selectedState, setSelectedState] = useState("");
    const [cities, setCities] = useState<ICity[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const eventsPerPage = 6;


    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchEvents();
    }, [token]);

    useEffect(() => {
    if (selectedState) {
        const cityList = City.getCitiesOfState("US", selectedState);
        setCities(cityList);
    } else {
        setCities([]);
    }
    }, [selectedState]);

    useEffect(() => {
        if (newEvent.state) {
            setSelectedState(newEvent.state);

            const cityList = City.getCitiesOfState("US", newEvent.state);
            setCities(cityList);
        }
    }, [newEvent.state]);

    const fetchEvents = async () => {
        try {
            axios.get(
                eventsApiUrl,
                authHeaders
            ).then(res => {
                setEvents(res.data ?? []);
            }).catch((err: AxiosError) => {
                if (err.response && err.response.status === 404) return; 
                notifyApiError(err, "fetch events");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

        
    const handleImageUpload = (file: File) => {
        setFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const resetNewEvent = () => {
        setNewEvent({
            name: "",
            description: "",
            imageId: "",
            link: "",
            address: "",
            city: "",
            state: "",
            startDate: new Date(),
            endDate: new Date(),
        });
        setEditingEventId(null);
    }

    const beginCreatingEvent = () => {
        setEditingEventIsNew(true);
        resetNewEvent();
        setEditingEventId("new");
        setMultiDay(false);
    }

    const addEvent = async () => {
        try {
            setLoading(true);

            let imageId = "";

            if (file) {
                const formData = new FormData();
                formData.append("image", file);
                formData.append("type", "event");
                formData.append("section", newEvent.state || "general");

                const uploadRes = await axios.post(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/upload`,
                    formData,
                    authHeaders
                );

                imageId = uploadRes.data.id;
            }

            const clean = (v: any) => (v === "" || v === undefined ? null : v);

            await axios.post(
                eventsApiUrl,
                {
                    ...newEvent,
                    imageId: imageId || null,
                    name: clean(newEvent.name),
                    description: clean(newEvent.description),
                    link: clean(newEvent.link),
                    address: clean(newEvent.address),
                    city: clean(newEvent.city),
                    state: clean(newEvent.state),
                    startDate: newEvent.startDate ?? null,
                    endDate: newEvent.endDate ?? null,
                },
                authHeaders
            );

            await fetchEvents();

            resetNewEvent();
            setFile(null);
            setImagePreview("");
            setEditingEventId(null);
            setEditingEventIsNew(false);
            setMultiDay(false);

        } catch (err) {
            notifyApiError(err as any, "add event");
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
                    imageId: res.data.imageId,
                    link: res.data.link,
                    address: res.data.address,
                    city: res.data.city,
                    state: res.data.state,
                    startDate: new Date(res.data.startDate),
                    endDate: new Date(res.data.endDate),
                }
                setNewEvent(selectedEvent);
                setMultiDay(selectedEvent.startDate?.getDate() != selectedEvent.endDate?.getDate()
                    || selectedEvent.startDate?.getMonth() != selectedEvent.endDate?.getMonth()
                    || selectedEvent.startDate?.getFullYear() != selectedEvent.endDate?.getFullYear());

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
            setLoading(true);

            let imageId = newEvent.imageId;

            if (file) {
                const formData = new FormData();
                formData.append("image", file);
                formData.append("type", "event");
                formData.append("section", newEvent.state || "general");

                const uploadRes = await axios.post(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/upload`,
                    formData,
                    authHeaders
                );

                imageId = uploadRes.data.id;
            }

            const updatedEvent = {
                ...newEvent,
                imageId,
            };

            const res = await axios.put(
                `${eventsApiUrl}/${editingEventId}`,
                updatedEvent,
                authHeaders
            );

            setEvents(prev =>
                prev.map(e =>
                    e.id === editingEventId ? res.data.event : e
                )
            );

            resetNewEvent();
            setFile(null);
            setImagePreview("");
            fetchEvents()
        } catch (err) {
            notifyApiError(err as any, "save event");
        } finally {
            setLoading(false);
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
                setEvents((prev) => prev.filter((e) => e.id !== id));
            }).catch((err: AxiosError) => {
                notifyApiError(err, "delete event");
            });
            fetchEvents()
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
                    <div className="flex flex-wrap justify-center gap-2">

                        {/* STATE */}
                        <Select
                            value={newEvent.state || ""}
                            onValueChange={(value) => {
                                setNewEvent({
                                    ...newEvent,
                                    state: value || null,
                                    city: null, // reset city when state changes
                                });

                                const cityList = City.getCitiesOfState("US", value);
                                setCities(cityList);
                            }}
                        >
                            <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>State</SelectLabel>
                                    {states.map((s) => (
                                        <SelectItem key={s.isoCode} value={s.isoCode}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* CITY */}
                        <Select
                            value={newEvent.city || ""}
                            onValueChange={(value) =>
                                setNewEvent({
                                    ...newEvent,
                                    city: value || null,
                                })
                            }
                            disabled={!newEvent.state}
                        >
                            <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="City" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>City</SelectLabel>
                                    {cities.map((city) => (
                                        <SelectItem key={city.name} value={city.name}>
                                            {city.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* KEYWORD */}
                        <Input
                            className="p-2 rounded w-80"
                            placeholder="Keyword"
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                        />

                        {/* BUTTONS */}
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
                            {events
                            .filter((event): event is Event => !!event)
                            .slice(pageNumber * eventsPerPage, (pageNumber + 1) * eventsPerPage)
                            .map((event) => (
                                <div
                                    key={event.id}
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
                                                    beginEditingEvent(event.id);
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteEvent(event.id)}
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
                            <CardTitle className="text-xl">{editingEventId === "new" ? "Create Event" : "Edit Event"}</CardTitle>
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
                                <Label>Event Image</Label>

                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleImageUpload(e.target.files[0]);
                                        }
                                    }}
                                />

                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        className="mt-2 w-40 h-40 object-cover rounded"
                                    />
                                )}
                            </div>
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Event link"
                                    value={newEvent.link}
                                    onChange={e => setNewEvent({ ...newEvent, link: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Address"
                                    value={newEvent.address}
                                    onChange={e => setNewEvent({ ...newEvent, address: e.target.value })}
                                />
                            </div>
                            <h3 className="flex flex-wrap font-semibold mb-2">Location</h3>
                                <div className="flex flex-wrap gap-2 pb-4">
                                    {/* STATE */}
                                    <Select
                                        value={newEvent.state || ""}
                                        onValueChange={(value) => {
                                            setNewEvent({
                                                ...newEvent,
                                                state: value || null,
                                                city: null, // reset city when state changes
                                            });

                                            const cityList = City.getCitiesOfState("US", value);
                                            setCities(cityList);
                                        }}
                                    >
                                        <SelectTrigger className="w-full max-w-48">
                                            <SelectValue placeholder="State" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>State</SelectLabel>
                                                {states.map((s) => (
                                                    <SelectItem key={s.isoCode} value={s.isoCode}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                    {/* CITY */}
                                    <Select
                                    value={newEvent.city || ""}
                                    onValueChange={(value) =>
                                        setNewEvent({
                                            ...newEvent,
                                            city: value || null,
                                        })
                                    }
                                    disabled={!newEvent.state}
                                >
                                        <SelectTrigger className="w-full max-w-48">
                                            <SelectValue placeholder="City" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>City</SelectLabel>
                                                {cities.map((city) => (
                                                    <SelectItem key={city.name} value={city.name}>
                                                        {city.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            
                            <h3 className="flex flex-wrap font-semibold mb-2">Time</h3>
                            <div className="flex flex-wrap gap-2 pb-4">
                                <Label>One-day</Label>
                                    <Switch checked={multiDay} onCheckedChange={e => {
                                        setMultiDay(e)
                                        if (!e) {
                                            setNewEvent({ ...newEvent, endDate: newEvent.startDate })
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
                                            value={newEvent.startDate?.toLocaleDateString('en-CA')}
                                            onChange={e => {
                                                const inputDate = new Date(e.target.value + "T00:00:00")
                                                setNewEvent({ ...newEvent, startDate: inputDate, endDate: inputDate })
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
                                                value={newEvent.startDate?.toLocaleDateString('en-CA')}
                                                onChange={e => {
                                                    const inputDate = new Date(e.target.value + "T00:00:00")
                                                    let currentDate = newEvent.startDate;
                                                    if (currentDate == undefined) currentDate = new Date()

                                                    currentDate.setFullYear(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())

                                                    setNewEvent({ ...newEvent, startDate: currentDate })
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Label className="pb-2">Date</Label>
                                            <Input
                                                type="date"
                                                placeholder="End date"
                                                className="p-2 rounded w-50"
                                                value={newEvent.endDate?.toLocaleDateString('en-CA')}
                                                onChange={e => {
                                                    const inputDate = new Date(e.target.value + "T00:00:00")
                                                    let currentDate = newEvent.endDate;
                                                    if (currentDate == undefined) currentDate = new Date()

                                                    currentDate.setFullYear(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())

                                                    setNewEvent({ ...newEvent, endDate: currentDate })
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
                                            loading || !newEvent.name || !newEvent.description || !newEvent.imageId || !newEvent.link
                                            || (!newEvent.state) || (localityTypes.City && !newEvent.city)
                                            || !newEvent.startDate || !newEvent.endDate || (newEvent.endDate < newEvent.startDate)
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
