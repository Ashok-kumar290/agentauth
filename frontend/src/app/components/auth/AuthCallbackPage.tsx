import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2, CheckCircle2, AlertCircle, Mail, Lock } from "lucide-react";
import { supabase } from "../../../lib/supabase";

type CallbackState = "loading" | "success" | "error" | "password_recovery";

interface CallbackResult {
    state: CallbackState;
    message: string;
    redirectTo?: string;
}

export function AuthCallbackPage() {
    const [result, setResult] = useState<CallbackResult>({
        state: "loading",
        message: "Processing authentication..."
    });
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        // Check for error in URL query params FIRST
        const errorParam = searchParams.get("error");
        const errorCode = searchParams.get("error_code");
        const errorDescription = searchParams.get("error_description");

        if (errorParam || errorCode) {
            const message = errorDescription?.replace(/\+/g, " ") ||
                errorCode?.replace(/_/g, " ") ||
                "Authentication failed";
            setResult({
                state: "error",
                message: message
            });
            return;
        }

        // Check hash params for tokens
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1)); // Remove the # prefix

        const accessToken = hashParams.get("access_token");
        const tokenType = hashParams.get("type");
        const refreshToken = hashParams.get("refresh_token");

        // Handle password recovery
        if (tokenType === "recovery" || hashParams.get("type") === "recovery") {
            setResult({
                state: "password_recovery",
                message: "Redirecting to set your new password..."
            });

            // Let Supabase handle the session from the hash
            // Then redirect to set-password page
            setTimeout(() => {
                // Keep the hash for the set-password page to use
                navigate("/set-password" + window.location.hash);
            }, 1000);
            return;
        }

        // Handle signup confirmation
        if (tokenType === "signup") {
            try {
                const { error } = await supabase.auth.getSession();
                if (error) {
                    setResult({
                        state: "error",
                        message: error.message
                    });
                    return;
                }
                setResult({
                    state: "success",
                    message: "Email verified successfully! Redirecting to dashboard...",
                    redirectTo: "/portal"
                });
                setTimeout(() => navigate("/portal"), 2000);
            } catch (err) {
                setResult({
                    state: "error",
                    message: "Failed to verify email"
                });
            }
            return;
        }

        // Handle magic link login
        if (accessToken) {
            try {
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken || ""
                });

                if (error) {
                    setResult({
                        state: "error",
                        message: error.message
                    });
                    return;
                }

                setResult({
                    state: "success",
                    message: "Signed in successfully! Redirecting...",
                    redirectTo: "/portal"
                });
                setTimeout(() => navigate("/portal"), 2000);
            } catch (err) {
                setResult({
                    state: "error",
                    message: "Failed to complete sign in"
                });
            }
            return;
        }

        // No recognizable auth data in URL
        setResult({
            state: "error",
            message: "No authentication data found. Please try again."
        });
    };

    const getIcon = () => {
        switch (result.state) {
            case "loading":
                return <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />;
            case "success":
                return <CheckCircle2 className="w-8 h-8 text-green-400" />;
            case "password_recovery":
                return <Lock className="w-8 h-8 text-blue-400" />;
            case "error":
                return <AlertCircle className="w-8 h-8 text-red-400" />;
        }
    };

    const getCardStyle = () => {
        switch (result.state) {
            case "loading":
                return "from-purple-500/10 to-blue-500/10 border-purple-500/20";
            case "success":
                return "from-green-500/10 to-emerald-500/10 border-green-500/20";
            case "password_recovery":
                return "from-blue-500/10 to-cyan-500/10 border-blue-500/20";
            case "error":
                return "from-red-500/10 to-orange-500/10 border-red-500/20";
        }
    };

    const getTitle = () => {
        switch (result.state) {
            case "loading":
                return "Processing...";
            case "success":
                return "Success!";
            case "password_recovery":
                return "Password Recovery";
            case "error":
                return "Authentication Failed";
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#0A0A0F] via-[#12121A] to-[#0A0A0F]">
            <motion.div
                className="w-full max-w-md text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={`bg-gradient-to-br ${getCardStyle()} border rounded-3xl p-8 backdrop-blur-xl`}>
                    <div className={`w-16 h-16 bg-gradient-to-br ${getCardStyle()} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        {getIcon()}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{getTitle()}</h2>
                    <p className="text-gray-400 mb-6">{result.message}</p>

                    {result.state === "error" && (
                        <div className="space-y-3">
                            <a
                                href="/reset-password"
                                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                            >
                                <Mail className="w-4 h-4 inline mr-2" />
                                Request New Link
                            </a>
                            <a
                                href="/portal"
                                className="block w-full bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
                            >
                                Back to Login
                            </a>
                        </div>
                    )}
                </div>
            </motion.div>
        </section>
    );
}
