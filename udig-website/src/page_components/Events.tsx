import { type TokenProp, notifyApiError } from "@/App";
import axios, { AxiosError } from "axios";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button.tsx";
import { useEffect, useState, type KeyboardEvent } from 'react'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { localityTypes } from "@/lib/constants"

function EventListing(event: EventData) {
    // Assigning date string to be shown on the event card
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    let date;
    if (startDate.toDateString() == endDate.toDateString()) { // One-day event
        date = Intl.DateTimeFormat("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" }).format(startDate);
    }
    else if (startDate.getFullYear == startDate.getFullYear) { // Multiple days, same year
        date = Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(startDate)
            + " - "
            + Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(endDate)
            + ", "
            + startDate.getFullYear();
    }
    else { // Multiple days, different years
        date = Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(startDate)
            + " - "
            + Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(endDate)
    }

    // Assigning a location string to be shown on the event card
    let address;
    switch (event.locality) {
        case localityTypes["Nation"]:
            address = "";
            break;
        case localityTypes["State"]:
            address = event.state;
            break;
        default:
            address = event.city + ", " + event.state;
            if (event.address != "") address = event.address + ", " + address;
    }

    return (
        <Card className="w-85 h-95 drop-shadow-2xl m-3 py-0 bg-porcelain text-left">
            <img src={event.image} alt={event.name.concat(" image")} className="h-30 object-cover rounded-t-xl border-t-6 border-t-brick-ember" />
            <CardHeader>
                <CardTitle className="font-bold text-yale-blue">{event.name}</CardTitle>
                <CardDescription>
                    {event.description}
                </CardDescription>
            </CardHeader>
            <CardDescription className="px-6 mt-0">
                <div className="absolute bottom-6">
                    {/*
                        <div>
                            f{time}
                        </div>
                    */}
                    <div>
                        {date}
                    </div>
                    <div>
                        {address}
                    </div>
                    <a href={event.link} target="_blank" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Learn More</a>
                    <br />
                </div>
            </CardDescription>
        </Card>
    );
}

type EventData =
    { _id: number } &

    { name: string } &
    { description: string } &
    { image: string } &
    { link: string } &

    { address: string } &
    { city: string } &
    { state: string } &

    { start: Date } &
    { end: Date } &

    { locality: number };

export default function Events({ token }: TokenProp) {
    const eventsApiUrl = `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/events`;
    const [error, setError] = useState("");
    const [alreadyRanSearchByToken, setAlreadyRanSearchByToken] = useState(false);
    const [zipcodeInput, setZipcodeInput] = useState("");
    const [upcomingEvents, setUpcomingEvents] = useState([] as EventData[]);
    const [pastEvents, setPastEvents] = useState([] as EventData[]);

    const handleInput = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") { // Enter to search while inputing
            searchByZipcode();
        }
        // Keep zip input length to 5 numbers and exclude other symbols allowed by number inputs
        else if (['e', 'E', '+', '-', '.'].includes(event.key) || (zipcodeInput.length >= 5) && ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) event.preventDefault();
    };

    useEffect(() => {
        if (!alreadyRanSearchByToken && token != null && token != "") {
            setAlreadyRanSearchByToken(true)
            searchByToken()
        }
    })

    async function searchByToken() {
        if (!token) return;
        try {
            axios.get(
                `${eventsApiUrl}/token-min-date/${new Date().toISOString()}/${token}`
            ).then(res => {
                setUpcomingEvents(res.data.events)
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setError("No events found in your area.");
                        setUpcomingEvents([]);
                    }
                    notifyApiError(err, "fetch upcoming events");
                }
            });

            axios.get(
                `${eventsApiUrl}/token-max-date/${new Date().toISOString()}/${token}`
            ).then(res => {
                setPastEvents(res.data.events)
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setPastEvents([]);
                        return;
                    }
                    notifyApiError(err, "fetch past events");
                }
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    }

    async function searchByZipcode() {
        if (zipcodeInput.length === 0) {
            searchByToken();
            return;
        }
        const apiKey = import.meta.env.VITE_GOOGLEMAPS_API_KEY;
        const parsedZip = Number(zipcodeInput);
        if (parsedZip == undefined || zipcodeInput.length != 5) { // if not a valid zipcode show an error
            setUpcomingEvents([]);
            setPastEvents([]);
            setError("Please enter a valid 5-digit ZIP Code.");
            return;
        }
        setError(""); // otherwise clear the error message 

        try {
            const locationRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipcodeInput}&key=${apiKey}`);
            if (!locationRes.ok) {
                setError("Could not find location from ZIP Code.");
                return
            }
            const locationData = await locationRes.json();
            let city;
            let state;

            for (let i = 0; i < locationData.results.length; i++) {
                const result = locationData.results[i];
                if (result.types.includes("postal_code")) {
                    for (let j = 1; j < result.address_components.length; j++) {
                        const addressComponent = result.address_components[j];
                        if (addressComponent.types.includes("locality")) city = addressComponent.long_name;
                        else if (addressComponent.types.includes("administrative_area_level_1")) {
                            state = addressComponent.short_name;
                            break;
                        }
                    }
                    break;
                }
            }

            axios.get(
                `${eventsApiUrl}/location-min-date/${new Date().toISOString()}/${city}/${state}`
            ).then(res => {
                setUpcomingEvents(res.data.events)
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setError("No events found in your area.");
                        setUpcomingEvents([]);
                    }
                    else notifyApiError(err, "fetch upcoming events");
                }
            });

            axios.get(
                `${eventsApiUrl}/location-max-date/${new Date().toISOString()}/${city}/${state}`
            ).then(res => {
                setPastEvents(res.data.events)
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setPastEvents([]);
                    }
                    notifyApiError(err, "fetch past events");
                }
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    }

    return (
        <>
            {/* Search Section */}
            <section className="w-full flex flex-col items-center text-center py-16 px-4 bg-porcelain border-b-2 border-golden-bronze">
                <h1 className="text-yale-blue text-4xl font-bold underline decoration-brick-ember decoration-4">
                    Find Events Near You
                </h1>

                <div className="flex flex-col sm:flex-row w-full max-w-md items-center gap-3 mt-6">
                    <Input
                        type="number"
                        placeholder="5-digit ZIP Code"
                        value={zipcodeInput}
                        onChange={e => setZipcodeInput(e.target.value)}
                        onKeyDown={handleInput}
                    />
                    <Button
                        type="submit"
                        variant="outline"
                        onClick={() => searchByZipcode()}
                        className="w-full sm:w-auto"
                    >
                        Search
                    </Button>
                </div>

                {error && (
                    <p className="text-red-600 mt-3 font-medium">
                        {error}
                    </p>
                )}
            </section>

            {/* Events Area Wrapper */}
            <section className="bg-warm-parchment min-h-screen px-4 py-16">
                {/* Upcoming Events */}
                {upcomingEvents.length > 0 ? (
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {upcomingEvents.map(event => (
                            <div key={event._id} className="w-full max-w-sm">
                                {EventListing(event)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600 text-lg mt-10">
                        No upcoming events yet. Search your ZIP Code above to find events near you.
                    </p>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                    <div className="mt-16">
                        <div className="text-center mb-10">
                            <h2 className="text-yale-blue text-4xl font-bold underline decoration-brick-ember decoration-4">Past Events</h2>
                        </div>
                        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                            {pastEvents.map(event => (
                                <div key={event._id} className="w-full max-w-sm">
                                    {EventListing(event)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}