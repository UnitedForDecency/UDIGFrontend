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
import { localityTypes, petitionTypes } from "@/lib/constants"

function PetitionListing(petition: PetitionData) {
    // Setting the image's border color to correspond to its type
    let imageClass = "h-30 object-cover rounded-t-xl border-t-6 border-t"
    switch (petition.type) {
        case petitionTypes["Petition"]:
            imageClass += "-brick-ember";
            break;
        case petitionTypes["Advocacy"]:
            imageClass += "-yale-blue";
            break;
        default:
            imageClass += "-golden-bronze";
            break;
    }

    // Assign the location to a string if relevant
    let location;
    switch (petition.locality) {
        case localityTypes["Nation"]:
            location = "";
            break;
        case localityTypes["State"]:
            location = petition.state;
            break;
        default:
            location = petition.city + ", " + petition.state;
    }

    function getPetitionTypeName() {
        return Object.keys(petitionTypes).find(k => petitionTypes[k as keyof typeof petitionTypes] === petition.type);
    }

    return (
        <Card className="w-85 h-85 drop-shadow-2xl m-3 py-0 bg-porcelain text-left">
            <img src={petition.image} alt={petition.name.concat(" image")} className={imageClass} />
            <CardHeader>
                <CardTitle className="font-bold text-yale-blue">{petition.name}</CardTitle>
                <CardDescription>
                    { getPetitionTypeName() }
                </CardDescription>
                <CardDescription>
                    {petition.description}
                </CardDescription>
            </CardHeader>
            <CardDescription className="px-6 mt-0">
                <div className="absolute bottom-6">
                    <div>
                        {location}
                    </div>
                    <a href={petition.link} target="_blank" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Join the cause</a>
                    <br />
                </div>
            </CardDescription>
        </Card>
    );
}

type PetitionData =
    { _id: number } &

    { name: string } &
    { description: string } &
    { image: string } &
    { link: string } &

    { city: string } &
    { state: string } &

    { locality: number } &
    { type: number };

export default function Petitions({ token }: TokenProp) {
    const petitionsApiUrl = `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/petitions`;
    const [error, setError] = useState("");
    const [alreadyRanSearchByToken, setAlreadyRanSearchByToken] = useState(false);
    const [zipcodeInput, setZipcodeInput] = useState("");
    const [filteredPetitions, setFilteredPetitions] = useState([] as PetitionData[]);

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
                `${petitionsApiUrl}/token/${token}`
            ).then(res => {
                setFilteredPetitions(res.data.petitions)
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setError("No campaigns found in your area.");
                        setFilteredPetitions([]);
                        return;
                    }
                    notifyApiError(err, "fetch campaigns");
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
            setFilteredPetitions([]);
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
                `${petitionsApiUrl}/location/${city}/${state}`
            ).then(res => {
                setFilteredPetitions(res.data.petitions)
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setError("No campaigns found in your area.");
                        setFilteredPetitions([]);
                    }
                    else notifyApiError(err, "fetch campaigns");
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
                    Find Petitions Near You
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

            {/* Petitions Area Wrapper */}
            <section className="bg-warm-parchment min-h-screen px-4 py-16">
                {/* Upcoming Petitions */}
                {filteredPetitions.length > 0 ? (
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {filteredPetitions.map(petition => (
                            <div key={petition._id} className="w-full max-w-sm">
                                {PetitionListing(petition)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600 text-lg mt-10">
                        No campaigns yet. Search your ZIP Code above to find campaigns near you.
                    </p>
                )}
            </section>
        </>
    );
}