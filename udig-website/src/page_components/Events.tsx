import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, type KeyboardEvent } from "react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { ImageType } from "./Admin/ImagesAdmin";

// -------------------------
// TYPES
// -------------------------
type EventData = {
    id: string;
    name: string;
    description: string;
    imageId: string;
    link: string;
    address: string;
    city: string;
    state: string;
    startDate: string;
    endDate: string;
};

// -------------------------
// EVENT CARD
// -------------------------
function EventListing(event: EventData) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const [cardImg, setcardImg] = useState<ImageType[]>([]);

    let date;

    if (startDate.toDateString() === endDate.toDateString()) {
        date = Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
        }).format(startDate);
    } else if (startDate.getFullYear() === endDate.getFullYear()) {
        date =
            Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(startDate) +
            " - " +
            Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(endDate) +
            ", " +
            startDate.getFullYear();
    } else {
        date =
            Intl.DateTimeFormat("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            }).format(startDate) +
            " - " +
            Intl.DateTimeFormat("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            }).format(endDate);
    }

    const address = `${event.address}, ${event.city}, ${event.state}`;

    const fetchImage = async () => {
        if (!event?.imageId) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/${event.imageId}`
            );

            const imgData = await response.json();
            setcardImg(formatImages(imgData));
        } catch (err) {
            console.error("Failed to fetch About images:", err);
        }
    };

    useEffect(() => {
        if (event?.imageId) {
            fetchImage();
        }
    }, [event.imageId]);

    return (
        <Card className="w-85 h-95 drop-shadow-2xl m-3 py-0 bg-porcelain text-left">
            {cardImg.length ? cardImg.map(img => (
                <img
                    key={img.id || img.url} // <-- add this
                    src={img.url}
                    alt={event.name}
                    className="h-30 object-cover rounded-t-xl border-t-6 border-t-brick-ember"
                />
            )) : <p className="text-gray-500">No vision images uploaded yet.</p>}

            <CardHeader>
                <CardTitle className="font-bold text-yale-blue">
                    {event.name}
                </CardTitle>
                <CardDescription>{event.description}</CardDescription>
            </CardHeader>

            <CardDescription className="px-6 mt-0">
                <div className="absolute bottom-6">
                    <div>{date}</div>
                    <div>{address}</div>
                    <a
                        href={event.link}
                        target="_blank"
                        className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                    >
                        Learn More
                    </a>
                </div>
            </CardDescription>
        </Card>
    );
}

    const formatImages = (data: any) => {
        const img = data;

        return [
            {
                ...img,
                url: `data:${img.mimetype || "image/jpeg"};base64,${img.imageData}`,
            },
        ];
    };
// -------------------------
// MAIN COMPONENT
// -------------------------
export default function Events() {
    const eventsApiUrl = `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/events`;

    const [zipcodeInput, setZipcodeInput] = useState("");
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
    const [error, setError] = useState("");

    // -------------------------
    // HANDLE INPUT
    // -------------------------
    const handleInput = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            searchByZipcode();
        } else if (
            ["e", "E", "+", "-", "."].includes(event.key) ||
            (zipcodeInput.length >= 5 && /\d/.test(event.key))
        ) {
            event.preventDefault();
        }
    };

    // -------------------------
    // DEFAULT LOAD
    // -------------------------
    useEffect(() => {
        loadAllEvents();
    }, []);

    async function loadAllEvents() {
        try {
            const res = await axios.get(eventsApiUrl);
            setUpcomingEvents(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load events");
        }
    }

    // -------------------------
    // ZIP SEARCH
    // -------------------------
    async function searchByZipcode() {
        if (zipcodeInput.length !== 5) {
            setError("Please enter a valid 5-digit ZIP Code.");
            return;
        }

        const apiKey = import.meta.env.VITE_GOOGLEMAPS_API_KEY;

        try {
            const locationRes = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcodeInput}&key=${apiKey}`
            );

            const locationData = await locationRes.json();

            let city = "";
            let state = "";

            const components = locationData.results[0].address_components;

            for (const comp of components) {
                if (comp.types.includes("locality")) city = comp.long_name;
                if (comp.types.includes("administrative_area_level_1"))
                    state = comp.short_name;
            }

            const res = await axios.get(
                `${eventsApiUrl}/location/${city}/${state}`
            );

            setUpcomingEvents(res.data);
            setError("");

        } catch (err) {
            console.error(err);
            setError("Could not find events for that ZIP Code.");
        }
    }

    // -------------------------
    // UI
    // -------------------------
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
                        onChange={(e) => setZipcodeInput(e.target.value)}
                        onKeyDown={handleInput}
                    />
                    <Button
                        variant="outline"
                        onClick={searchByZipcode}
                        className="w-full sm:w-auto"
                    >
                        Search
                    </Button>
                </div>

                {error && (
                    <p className="text-red-600 mt-3 font-medium">{error}</p>
                )}
            </section>

            {/* Events */}
            <section className="bg-warm-parchment min-h-screen px-4 py-16">
                {upcomingEvents.length > 0 ? (
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {upcomingEvents.map((event) => (
                            <div key={event.id} className="w-full max-w-sm">
                                <EventListing {...event} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600 text-lg mt-10">
                        No events found. Try searching a ZIP Code.
                    </p>
                )}
            </section>
        </>
    );
}