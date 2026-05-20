import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button.tsx";

interface LoginProps {
    onLogin: (isAdmin: boolean, jwt: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [invalidInput, setInvalidInput] = useState(false)
    const navigate = useNavigate();

    const checkEnterPressed = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") handleLogin();
    }

    const handleLogin = async () => {
        setInvalidInput(false);
        if (!username || !password) {
            setError("Please enter a username and password");
            setInvalidInput(true);
            return;
        }

        try {
            const res = await fetch(import.meta.env.VITE_MONGO_CONTROLLER_URL + "/accounts/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setInvalidInput(true);
                setError(data.message || "Login failed");
                return;
            }

            // Save JWT and admin status
            localStorage.setItem("token", data.token);
            localStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");

            // Update App state
            onLogin(data.isAdmin, data.token);

            // Redirect immediately based on admin status
            if (data.isAdmin) {
                navigate("/admin/books", { replace: true }); // send admin to dashboard
            } else {
                navigate("/", { replace: true }); // normal user goes home
            }
        } catch (err) {
            console.error("Server error:", err);
            setError("Server error. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-brick-ember mt-20 mb-4">Log In</h1>
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
                                    aria-invalid={invalidInput}
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
                                    aria-invalid={invalidInput}
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-600">{error}</p>}
                        <CardFooter className="sm:justify-center mt-4">
                            <Button onClick={handleLogin} type="button" className="bg-yale-blue text-porcelain px-4 py-2 rounded mt-2 hover:bg-blue-700">
                                Log In
                            </Button>
                        </CardFooter>
                    </CardContent>
                </form>
            </Card>

            <p className="mt-4">
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-600 hover:underline">
                    Sign Up
                </a>
            </p>
        </div>
    );
}
