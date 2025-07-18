import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import GridBackground from "@/components/landing/GridBackground";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    if (isRegister) {
      await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await auth.currentUser.getIdToken();
      localStorage.setItem("authToken", idToken);
      setMessage("Account created successfully!");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      const idToken = await auth.currentUser.getIdToken();
      localStorage.setItem("authToken", idToken);
      setMessage("Login successful!");
    }
    navigate("/dashboard");
  } catch (error) {
    setMessage(error.message);
  }
  setLoading(false);
};

const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    await signInWithPopup(auth, googleProvider);
    const idToken = await auth.currentUser.getIdToken();
    localStorage.setItem("authToken", idToken);
    setMessage("Google login successful!");
    navigate("/dashboard");
  } catch (error) {
    setMessage(error.message);
  }
  setLoading(false);
};

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background"
      )}
    >
      <GridBackground />
      <div className={cn("flex flex-col gap-6 w-full max-w-md z-10")}>
        <Card>
          <CardHeader>
            <CardTitle>
              {isRegister ? "Create Account" : "Login to your account"}
            </CardTitle>
            <CardDescription>
              {isRegister
                ? "Enter your email below to create your account"
                : "Enter your email below to login to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : isRegister ? "Register" : "Login"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <FcGoogle size={20} />
                    Login with Google
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                {isRegister ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-4 text-blue-600 hover:text-blue-500"
                      onClick={() => setIsRegister(false)}
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-4 text-blue-600 hover:text-blue-500"
                      onClick={() => setIsRegister(true)}
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </form>
            {message && (
              <div
                className={`mt-4 text-center p-2 rounded ${
                  message.includes("Success") || message.includes("successful")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
