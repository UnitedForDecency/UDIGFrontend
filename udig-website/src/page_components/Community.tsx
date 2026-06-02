/// <reference types="google.maps" />
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AdvancedMarker,
    InfoWindow,
    Map,
    Pin,
    useMap,
} from '@vis.gl/react-google-maps';
import { SearchIcon } from 'lucide-react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from 'react-hook-form';
import { FieldSet, FieldGroup, Field, FieldError } from '@/components/ui/field';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MarkerClusterer, type Marker } from '@googlemaps/markerclusterer';
import axios from 'axios';

interface Supporter {
    _id?: string;
    name: string;
    email: string;
    zip: string;
}

interface SupporterWithCoords extends Supporter {
    key: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
}

type Poi = { key: string; location: google.maps.LatLngLiteral };

const makeSupporterKey = (supporter: Supporter, index: number) => {
    if (supporter._id && supporter._id.trim() !== '') return supporter._id;
    return `${supporter.name}-${supporter.email}-${supporter.zip}-${index}`;
};

const PoiMarkers = (props: {
    pois: Poi[];
    selectedKeys: Set<string>;
    setMarkerRef: (marker: Marker | null, key: string) => void;
    onMarkerClick: (key: string) => void;
}) => {
    return (
        <>
            {props.pois.map((poi) => {
                const isSelected =
                    props.selectedKeys.size === 0 || props.selectedKeys.has(poi.key);
                return (
                    <AdvancedMarker
                        key={poi.key}
                        position={poi.location}
                        ref={(marker) => {
                            // Stamp the key onto the element so the clusterer can read it
                            if (marker?.element) {
                                (marker.element as HTMLElement).dataset.supporterKey = poi.key;
                            }
                            props.setMarkerRef(marker, poi.key);
                        }}
                        onClick={() => props.onMarkerClick(poi.key)}
                    >
                        <Pin
                            background={isSelected ? '#FF4444' : '#FBBC04'}
                            glyphColor={'#000'}
                            borderColor={'#000'}
                        />
                    </AdvancedMarker>
                );
            })}
        </>
    );
};

// --- Become a Supporter Form ---
const becomeSupporterSchema = z.object({
    name: z.string().min(1, "Name is required.").max(64, "Name must be at most 64 characters."),
    email: z.string().email("Please enter a valid email address."),
    zip: z.string().regex(/^\d{5}$/, "Zipcode must be exactly 5 digits."),
});

type BecomeSupporterForm = z.infer<typeof becomeSupporterSchema>;

function BecomeSupporterPanel({
    existingEmails,
    onAdded,
}: {
    existingEmails: Set<string>;
    onAdded: (supporter: Supporter) => void;
}) {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<BecomeSupporterForm>({
        resolver: zodResolver(becomeSupporterSchema),
        mode: "onChange",
        defaultValues: { name: "", email: "", zip: "" },
    });

    async function onSubmit(data: BecomeSupporterForm) {
        setSubmitError(null);
        setSuccess(false);

        if (existingEmails.has(data.email.toLowerCase())) {
            setSubmitError("This email is already registered as a supporter.");
            return;
        }

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/supporter`,
                { name: data.name, email: data.email, zip: data.zip }
            );
            onAdded(res.data);
            form.reset();
            setSuccess(true);
        } catch (err: any) {
            if (err?.response?.status === 409) {
                setSubmitError("This email is already registered as a supporter.");
            } else {
                setSubmitError("Failed to submit. Please try again.");
            }
        }
    }

    return (
        <div className="mt-6">
            <p className="text-xl font-bold underline decoration-brick-ember underline-offset-4 m-2">
                Become a Supporter:
            </p>
            <p className="text-sm text-gray-500 mx-2 mb-3">
                Join our community by adding yourself to the map!
            </p>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 w-[17vw]">
                <FieldSet>
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        className="bg-porcelain rounded-md"
                                        placeholder="Full Name"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        className="bg-porcelain rounded-md"
                                        placeholder="Email Address"
                                        type="email"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="zip"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        className="bg-porcelain rounded-md"
                                        placeholder="Zip Code (e.g. 84101)"
                                        maxLength={5}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </FieldSet>

                {submitError && (
                    <p className="text-sm text-red-500">{submitError}</p>
                )}
                {success && (
                    <p className="text-sm text-green-600">
                        You're now a supporter! Welcome to the community 🎉
                    </p>
                )}

                <Button type="submit" className="w-full">
                    Join as a Supporter
                </Button>
            </form>
        </div>
    );
}

// --- Main Community Component ---
export default function Community() {
    const map = useMap();
    const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
    const [locations, setLocations] = useState<Poi[]>([]);
    const [supportersWithCoords, setSupportersWithCoords] = useState<SupporterWithCoords[]>([]);
    const [selectedSupporter, setSelectedSupporter] = useState<SupporterWithCoords | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [existingEmails, setExistingEmails] = useState<Set<string>>(new Set());

    // Cluster popup state
    const [clusterSupporters, setClusterSupporters] = useState<SupporterWithCoords[]>([]);
    const [clusterPosition, setClusterPosition] = useState<google.maps.LatLngLiteral | null>(null);

    const clusterer = useRef<MarkerClusterer | null>(null);
    const supportersRef = useRef<SupporterWithCoords[]>([]);

    // Keep ref in sync so the cluster click handler always has fresh data
    useEffect(() => {
        supportersRef.current = supportersWithCoords;
    }, [supportersWithCoords]);

    const getAddressComponents = (components: any[]) => {
        const city = components.find((c: any) =>
            c.types.includes('locality') || c.types.includes('postal_town')
        )?.long_name ?? '';
        const state = components.find((c: any) =>
            c.types.includes('administrative_area_level_1')
        )?.short_name ?? '';
        return { city, state };
    };

    const loadSupporters = useCallback(async () => {
        const supporters = await getAllSupporters();
        const supporterCoords = await getSupporterCoords(supporters);

        const valid = supporterCoords
            .map((s, i) => ({ ...s, key: makeSupporterKey(s, i) }))
            .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));

        setSupportersWithCoords(valid);
        supportersRef.current = valid;
        setExistingEmails(new Set(supporters.map((s) => s.email.toLowerCase())));
        setLocations(valid.map((s) => ({ key: s.key, location: { lat: s.lat, lng: s.lng } })));
    }, []);

    useEffect(() => {
        loadSupporters();
    }, [loadSupporters]);

    async function handleSupporterAdded(_newSupporter: Supporter) {
        await loadSupporters();
    }

    const clearAllPopups = useCallback(() => {
        setSelectedSupporter(null);
        setSelectedKeys(new Set());
        setClusterSupporters([]);
        setClusterPosition(null);
    }, []);

    const handleMarkerClick = useCallback(
        (key: string) => {
            const clicked = supportersWithCoords.find((s) => s.key === key);
            if (!clicked) return;
            setClusterSupporters([]);
            setClusterPosition(null);
            setSelectedKeys(new Set([key]));
            setSelectedSupporter(clicked);
        },
        [supportersWithCoords]
    );

    useEffect(() => {
        if (!map) return;
        if (clusterer.current) return;

        clusterer.current = new MarkerClusterer({
            map,
            onClusterClick: (_, cluster) => {
                const center = cluster.position;
                if (!center) return;

                const clusterMarkers = cluster.markers ?? [];

                const inCluster: SupporterWithCoords[] = [];
                const seen = new Set<string>();

                for (const m of clusterMarkers) {
                    const el = (m as google.maps.marker.AdvancedMarkerElement).element as HTMLElement | undefined;
                    const key = el?.dataset?.supporterKey;
                    if (!key || seen.has(key)) continue;
                    seen.add(key);

                    const match = supportersRef.current.find((s) => s.key === key);
                    if (match) inCluster.push(match);
                }

                setSelectedSupporter(null);
                setSelectedKeys(new Set());
                setClusterPosition({ lat: center.lat(), lng: center.lng() });
                setClusterSupporters(inCluster);
            },
        });
    }, [map]);

    useEffect(() => {
        clusterer.current?.clearMarkers();
        clusterer.current?.addMarkers(Object.values(markers));
    }, [markers]);

    const setMarkerRef = (marker: Marker | null, key: string) => {
        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;
        setMarkers((prev) => {
            if (marker) return { ...prev, [key]: marker };
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const locationSchema = z.object({
        locationSearchInput: z.string().max(32, "Location must be at most 32 characters."),
    });
    const locationForm = useForm<z.infer<typeof locationSchema>>({
        resolver: zodResolver(locationSchema),
        mode: "onChange",
        defaultValues: { locationSearchInput: "" },
    });

    async function onLocationSubmit(data: z.infer<typeof locationSchema>) {
        const apiKey = import.meta.env.VITE_GOOGLEMAPS_API_KEY;
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(data.locationSearchInput)}&key=${apiKey}`
        );
        if (!res.ok) return;
        const resData = await res.json();
        const addressComponents = resData.results[0]?.address_components;
        if (!addressComponents) return;

        for (const component of addressComponents) {
            if (component.types[0] === 'country' && component.short_name === 'US') {
                const lat = resData.results[0].geometry.location.lat;
                const lng = resData.results[0].geometry.location.lng;
                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(10);
                    clearAllPopups();
                }
            }
        }
    }

    async function getAllSupporters(): Promise<Supporter[]> {
        const res = await axios.get(
            `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/supporter`
        );
        return res.data;
    }

    async function getSupporterCoords(
        supporters: Supporter[]
    ): Promise<(Supporter & { lat: number; lng: number; key: string; city: string; state: string })[]> {
        const apiKey = import.meta.env.VITE_GOOGLEMAPS_API_KEY;
        const promises = supporters.map(async (s) => {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(s.zip)}&key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            const result = data.results[0];
            const location = result?.geometry.location;
            const components = result?.address_components ?? [];
            const { city, state } = getAddressComponents(components);
            return {
                ...s,
                lat: location?.lat ?? NaN,
                lng: location?.lng ?? NaN,
                key: '',
                city,
                state,
            };
        });
        return Promise.all(promises);
    }

    return (
        <section>
            <div className='flex flex-row bg-alice-blue min-h-screen p-[1.5vw]'>
                <div>
                    <form onSubmit={locationForm.handleSubmit(onLocationSubmit)}>
                        <p className='text-2xl font-bold underline decoration-brick-ember underline-offset-4 m-2'>
                            Search By Location:
                        </p>
                        <div className='inline-flex gap-2'>
                            <FieldSet className='w-[13vw]'>
                                <FieldGroup>
                                    <Controller
                                        name="locationSearchInput"
                                        control={locationForm.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Input
                                                    {...field}
                                                    aria-invalid={fieldState.invalid}
                                                    className="bg-porcelain rounded-md"
                                                    placeholder="City, State, or Zip"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                            </FieldSet>
                            <Button type="submit" className="w-[2.5vw]">
                                <SearchIcon />
                            </Button>
                        </div>
                    </form>

                    {(
                        <BecomeSupporterPanel
                            existingEmails={existingEmails}
                            onAdded={handleSupporterAdded}
                        />
                    )}
                </div>

                <div className='h-[40vw] w-[70vw] m-auto mt-8'>
                    <Map
                        mapId={"CommunityMap"}
                        defaultZoom={5}
                        defaultCenter={{ lat: 40.249595, lng: -96.949860 }}
                    >
                        <PoiMarkers
                            pois={locations}
                            selectedKeys={selectedKeys}
                            setMarkerRef={setMarkerRef}
                            onMarkerClick={handleMarkerClick}
                        />

                        {/* Single supporter popup */}
                        {selectedSupporter && (
                            <InfoWindow
                                position={{ lat: selectedSupporter.lat, lng: selectedSupporter.lng }}
                                onCloseClick={() => setSelectedSupporter(null)}
                            >
                                <div className="font-sans min-w-[200px] p-1">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                        <div className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {selectedSupporter.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm leading-tight">
                                                {selectedSupporter.name}
                                            </p>
                                            <p className="text-xs text-gray-500">Community Supporter</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                                            <span className="text-gray-400">✉</span>
                                            {selectedSupporter.email}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                                            <span className="text-gray-400">📍</span>
                                            {selectedSupporter.city && selectedSupporter.state
                                                ? `${selectedSupporter.city}, ${selectedSupporter.state}`
                                                : selectedSupporter.zip}
                                        </div>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}

                        {/* Cluster popup — list of supporters */}
                        {clusterPosition && clusterSupporters.length > 0 && (
                            <InfoWindow
                                position={clusterPosition}
                                onCloseClick={() => {
                                    setClusterPosition(null);
                                    setClusterSupporters([]);
                                }}
                            >
                                <div className="font-sans min-w-[220px] max-w-[280px] p-1">
                                    <p className="font-bold text-gray-800 text-sm mb-2 pb-2 border-b border-gray-200">
                                        {clusterSupporters.length} Supporters in this area
                                    </p>
                                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                                        {clusterSupporters.map((s) => (
                                            <div key={s.key} className="flex items-center gap-2">
                                                <div className="bg-red-500 rounded-full w-7 h-7 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                    {s.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 text-xs leading-tight truncate">
                                                        {s.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {s.city && s.state ? `${s.city}, ${s.state}` : s.zip}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </Map>
                </div>
            </div>
        </section>
    );
}