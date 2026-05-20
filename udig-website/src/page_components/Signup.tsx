import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button.tsx";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [zipcodeInput, setZipcodeInput] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const[invalidFields, setInvalidFields] = useState([false, false, false, false, false])

    const checkEnterPressed = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSignUp();
        }
    }

    const handleZipcodeInput = (event: KeyboardEvent<HTMLInputElement>) => {
        // Keep zip input length to 5 numbers and exclude other symbols allowed by number inputs
        if (['e', 'E', '+', '-', '.'].includes(event.key) || (zipcodeInput.length >= 5) && ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) event.preventDefault();
    };

    const handleSignUp = async () => {
        setError("");
        setSuccess("");
        setInvalidFields([false, false, false, false, false]);

        if (!username || !email ||!zipcodeInput || !password || !confirmPassword) {
            setError("Please fill in all fields.")

            const newInvalidFields = [false, false, false, false, false];
            if (!username) newInvalidFields[0] = true;
            if (!email) newInvalidFields[1] = true;
            if (!zipcodeInput) newInvalidFields[2] = true;
            if (!password) newInvalidFields[3] = true;
            if (!confirmPassword) newInvalidFields[4] = true;

            setInvalidFields(newInvalidFields);
            return
        }
        else if (password !== confirmPassword) {
            setInvalidFields([false, false, false, false, true]);
            setError("Passwords do not match.")
            return
        }
        else if (zipcodeInput.length != 5) {
            setError("Please enter a valid 5-digit ZIP code.")
            setInvalidFields([false, false, true, false, false]);
            return
        }
        try {
            const apiKey = import.meta.env.VITE_GOOGLEMAPS_API_KEY;
            const locationRes = await fetch("https://maps.googleapis.com/maps/api/geocode/json?address=" + zipcodeInput + "&key=" + apiKey);
            if (!locationRes.ok) {
                setInvalidFields([false, false, true, false, false]);
                setError("Could not find location from ZIP Code.");
                return
            }
            const locationData = await locationRes.json();
            let city = "";
            let state = "";

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

            if (city == "" || state == "") {
                setError("Could not find location from ZIP Code.");
                setInvalidFields([false, false, true, false, false]);
                return
            }

            const res = await fetch(import.meta.env.VITE_MONGO_CONTROLLER_URL + "/accounts/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username,
                    password,
                    email,
                    city,
                    state
                }),
            })

            const data = await res.json()
            
            if (!res.ok) {
                setInvalidFields([true, true, false, false, false]);
                setError(data.message || "Signup failed")
                return
            }

            setSuccess("Account created!")
            setTimeout(() => navigate("/login"), 1500)
        } catch {
            setError("Server error. Please try again.")
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-brick-ember mt-20 mb-4">Sign Up</h1>
            <Card className="border-4 border-yale-blue w-100">
                <form>
                    <CardContent className="sm:max-w-[425px]">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="border p-2 rounded mb-2 w-85 "
                                    aria-invalid={invalidFields[0]}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border p-2 rounded mb-2 w-85"
                                    aria-invalid={invalidFields[1]}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Input
                                    type="number"
                                    placeholder="5-digit ZIP Code"
                                    value={zipcodeInput}
                                    onChange={e => setZipcodeInput(e.target.value)}
                                    onKeyDown={handleZipcodeInput}
                                    className="border p-2 rounded mb-2 w-85"
                                    aria-invalid={invalidFields[2]}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={checkEnterPressed}
                                    className="border p-2 rounded mb-2 w-85"
                                    aria-invalid={invalidFields[3]}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="border p-2 rounded mb-2 w-85"
                                    aria-invalid={invalidFields[4]}
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-600">{error}</p>}
                        {success && <p className="text-green-600">{success}</p>}
                        <CardFooter className="sm:justify-center mt-4">
                            <Button onClick={handleSignUp} type="button" className="bg-yale-blue text-porcelain px-4 py-2 rounded mt-2 hover:bg-blue-700">
                                Sign Up
                            </Button>
                        </CardFooter>
                    </CardContent>
                </form>
            </Card>

            <p className="mt-4">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                    Login
                </a>
            </p>
        </div>
    );
}
