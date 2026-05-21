/// <reference types="google.maps" />
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AdvancedMarker,
    InfoWindow,
    Map,
    Pin,
    useMap,
    type MapCameraChangedEvent,
} from '@vis.gl/react-google-maps';
import { SearchIcon, X } from 'lucide-react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from 'react-hook-form';
import { FieldSet, FieldGroup, Field, FieldError } from '@/components/ui/field';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MarkerClusterer, type Marker } from '@googlemaps/markerclusterer';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TokenProp } from '@/App';
import axios from 'axios';

interface User {
    _id?: string;
    username: string;
    email: string;
    city: string;
    state: string;
    role: string;
}

interface UserWithCoords extends User {
    key: string;
    lat: number;
    lng: number;
}

type Poi = { key: string; location: google.maps.LatLngLiteral };

const makeLeaderKey = (user: User, index: number) => {
    if (user._id && user._id.trim() !== '') return user._id;
    return `${user.username}-${user.email}-${user.city}-${user.state}-${index}`;
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
                        ref={(marker) => props.setMarkerRef(marker, poi.key)}
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

export default function Community({ token }: TokenProp) {
    const map = useMap();
    const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
    const [locations, setLocations] = useState<Poi[]>([]);
    const [leadersWithCoords, setLeadersWithCoords] = useState<UserWithCoords[]>([]);
    const [currentLeaders, setCurrentLeaders] = useState<UserWithCoords[]>([]);
    const [selectedLeader, setSelectedLeader] = useState<UserWithCoords | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const clusterer = useRef<MarkerClusterer | null>(null);
    const hasInitialized = useRef(false);
    const boundsLeadersRef = useRef<UserWithCoords[]>([]);
    const markersRef = useRef<{ [key: string]: Marker }>({});

    useEffect(() => {
        if (!token || hasInitialized.current) return;

        hasInitialized.current = true;
        onInit();
    }, [token]);

    async function onInit() {
        const leaders = await getAllLeaders();
        const leaderCoords = await getLeaderCoords(leaders);

        const validLeaders = leaderCoords
            .map((leader, index) => ({
                ...leader,
                key: makeLeaderKey(leader, index),
            }))
            .filter((leader) => Number.isFinite(leader.lat) && Number.isFinite(leader.lng));

        setLeadersWithCoords(validLeaders);
        setCurrentLeaders(validLeaders);
        boundsLeadersRef.current = validLeaders;

        const pois: Poi[] = validLeaders.map((leader) => ({
            key: leader.key,
            location: { lat: leader.lat, lng: leader.lng },
        }));
        setLocations(pois);
    }

    useEffect(() => {
        markersRef.current = markers;
    }, [markers]);

    const handleBoundsChanged = useCallback(
        (event: MapCameraChangedEvent) => {
            const bounds = event.detail.bounds;
            if (!bounds || leadersWithCoords.length === 0) return;

            const visible = leadersWithCoords.filter((leader) =>
                leader.lat >= bounds.south &&
                leader.lat <= bounds.north &&
                leader.lng >= bounds.west &&
                leader.lng <= bounds.east
            );

            boundsLeadersRef.current = visible;
            setCurrentLeaders(visible);
        },
        [leadersWithCoords]
    );

    const handleMarkerClick = useCallback(
        (key: string) => {
            const clickedLeader = leadersWithCoords.find((l) => l.key === key);
            if (!clickedLeader) return;

            setSelectedKeys(new Set([key]));
            setSelectedLeader(clickedLeader);
        },
        [leadersWithCoords]
    );

    const clearSelection = useCallback(() => {
        setSelectedKeys(new Set());
        setSelectedLeader(null);
    }, []);

    useEffect(() => {
        if (!map) return;

        if (!clusterer.current) {
            clusterer.current = new MarkerClusterer({
                map,
                onClusterClick: (_, cluster) => {
                    const clusterBounds = cluster.bounds;
                    if (clusterBounds) {
                        map.fitBounds(clusterBounds);
                    }
                    clearSelection();
                },
            });
        }
    }, [map, clearSelection]);

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

    const formSchema = z.object({
        locationSearchInput: z.string().max(32, "Location must be at most 32 characters."),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: { locationSearchInput: "" },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const searchQuery = data.locationSearchInput;
        const apiKey = import.meta.env.VITE_GOOGLEMAPS_API_KEY;

        const locationRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}`
        );
        if (!locationRes.ok) return;

        const resData = await locationRes.json();
        const addressComponents = resData.results[0]?.address_components;
        if (!addressComponents) return;

        for (const component of addressComponents) {
            if (component.types[0] === 'country' && component.short_name === 'US') {
                const lat = resData.results[0].geometry.location.lat;
                const lng = resData.results[0].geometry.location.lng;

                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(10);
                    clearSelection();
                }
            }
        }
    }

    async function getAllLeaders(): Promise<User[]> {
        const res = await axios.get(
            `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/accounts/get/role`,
            {
                params: { role: "LEADER" },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    }

    async function getLeaderCoords(users: User[]): Promise<UserWithCoords[]> {
        const apiKey = import.meta.env.VITE_GOOGLEMAPS_API_KEY;

        const promises = users.map(async (user) => {
            const address = `${user.city}, ${user.state}`;
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            const location = data.results[0]?.geometry.location;

            return {
                ...user,
                lat: location?.lat ?? NaN,
                lng: location?.lng ?? NaN,
                key: '',
            };
        });

        return Promise.all(promises);
    }

    return (
        <section>
            <div className='flex flex-row bg-alice-blue min-h-screen p-[1.5vw]'>
                <div className=''>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <p className='text-2xl font-bold underline decoration-brick-ember underline-offset-4 m-2'>
                            Search By Location:
                        </p>
                        <div className='inline-flex gap-2'>
                            <FieldSet className='w-[13vw]'>
                                <FieldGroup>
                                    <Controller
                                        name="locationSearchInput"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Input
                                                    {...field}
                                                    aria-invalid={fieldState.invalid}
                                                    className="bg-porcelain rounded-md"
                                                    id="location"
                                                    placeholder="Enter City, State, or Zip code"
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

                    <div className='flex flex-col items-center'>
                        <p className='text-xl font-bold decoration-brick-ember underline-offset-4 m-2 mt-5'>
                            Our local leaders:
                        </p>

                        <div className='flex items-center gap-2 mb-2'>
                            <p className='text-sm text-gray-500'>
                                {`${currentLeaders.length} in view`}
                            </p>
                            {selectedLeader && (
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className='flex items-center gap-1 text-xs text-brick-ember hover:underline'
                                >
                                    <X size={12} /> Clear popup
                                </button>
                            )}
                        </div>

                        <ScrollArea className='flex flex-col justify-items-center max-h-[34vw] w-[17vw] bg-porcelain rounded-lg'>
                            {currentLeaders.map((leader) => (
                                <Card
                                    key={leader.key}
                                    className="border-2 border-golden-bronze shadow-lg mb-15 w-[15vw] min-h-[25vh] mt-5 mx-auto"
                                >
                                    <CardHeader className="text-center font-bold text-lg text-graphite">
                                        <h2>{leader.username}</h2>
                                        <p className='text-sm font-medium'>
                                            {leader.city}, {leader.state}
                                        </p>
                                        <p className='text-sm font-medium'>
                                            Contact: {leader.email}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center" />
                                </Card>
                            ))}
                        </ScrollArea>
                    </div>
                </div>

                <div className='h-[40vw] w-[70vw] m-auto mt-8'>
                    <Map
                        mapId={"CommunityMap"}
                        defaultZoom={5}
                        defaultCenter={{ lat: 40.249595, lng: -96.949860 }}
                        onBoundsChanged={handleBoundsChanged}
                    >
                        <PoiMarkers
                            pois={locations}
                            selectedKeys={selectedKeys}
                            setMarkerRef={setMarkerRef}
                            onMarkerClick={handleMarkerClick}
                        />

                        {selectedLeader && (
                            <InfoWindow
                                position={{
                                    lat: selectedLeader.lat,
                                    lng: selectedLeader.lng,
                                }}
                                onCloseClick={() => setSelectedLeader(null)}
                            >
                                <div className="p-2 min-w-[180px]">
                                    <h2 className="font-bold text-base">
                                        {selectedLeader.username}
                                    </h2>
                                    <p className="text-sm">
                                        {selectedLeader.city}, {selectedLeader.state}
                                    </p>
                                    <p className="text-sm">{selectedLeader.email}</p>
                                </div>
                            </InfoWindow>
                        )}
                    </Map>
                </div>
            </div>
        </section>
    );
}