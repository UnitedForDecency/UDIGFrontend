import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LoginProps {
    onLogin: (jwt: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {

        if (!username || !password) {
            setError("Enter username and password");
            return;
        }

        try {
            const res = await fetch(
                import.meta.env.VITE_MONGO_CONTROLLER_URL + "/accounts/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                }
            );
            const data = await res.json();

            if (!res.ok) {
                setError("Login failed");
                return;
            }

            onLogin(data.token);

            navigate("/", { replace: true });

        } catch {
            setError("Server error");
        }
    };

    const checkEnter = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mt-20 mb-4">Log In</h1>

            <Card className="w-96 border-2">
                <CardContent>
                    <Input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={checkEnter}
                        className="mt-2"
                    />

                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </CardContent>

                <CardFooter>
                    <Button onClick={handleLogin} className="w-full">
                        Login
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-4 text-center">
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-600 hover:underline">
                    Sign Up
                </a>
            </p>
        </div>
    );
}