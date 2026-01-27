import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { supabase } from "../../../lib/supabase";

type PageState = "loading" | "ready" | "error" | "success";

export function SetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [pageState, setPageState] = useState<PageState>("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        // 1. Check for error in URL query params FIRST
        const errorParam = searchParams.get("error");
        const errorCode = searchParams.get("error_code");
        const errorDescription = searchParams.get("error_description");

        if (errorParam || errorCode) {
            const message = errorDescription?.replace(/\+/g, " ") ||
                errorCode?.replace(/_/g, " ") ||
                "The reset link is invalid or has expired";
            setErrorMessage(message);
            setPageState("error");
            return;
        }

        // 2. Check for hash params (Supabase sends tokens in hash)
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));

        const accessToken = hashParams.get("access_token");
        const tokenType = hashParams.get("type");
        const refreshToken = hashParams.get("refresh_token");

        // 3. If we have recovery tokens, set up the session
        if (tokenType === "recovery" && accessToken) {
            try {
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken || ""
                });

                if (error) {
                    setErrorMessage(error.message);
                    setPageState("error");
                    return;
                }

                // Clear the hash from URL for cleaner UX
                window.history.replaceState(null, "", "/set-password");
                setPageState("ready");
                return;
            } catch (err) {
                setErrorMessage("Failed to verify reset link. Please request a new one.");
                setPageState("error");
                return;
            }
        }

        // 4. Check for existing session (user might already be authenticated)
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                setErrorMessage(error.message);
                setPageState("error");
                return;
            }

            if (session) {
                // User has a valid session, they can set password
                setPageState("ready");
                return;
            }
        } catch (err) {
            // Session check failed
        }

        // 5. Listen for auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" && session) {
                setPageState("ready");
            } else if (event === "SIGNED_IN" && session) {
                setPageState("ready");
            }
        });

        // 6. Wait a bit for potential auth state change, then show error if still loading
        setTimeout(() => {
            setPageState((currentState) => {
                if (currentState === "loading") {
                    setErrorMessage("No valid reset link found. Please request a new password reset.");
                    return "error";
                }
                return currentState;
            });
        }, 3000);

        return () => {
            listener?.subscription?.unsubscribe();
        };
    };

    const validatePassword = (pwd: string): string[] => {
        const errors: string[] = [];
        if (pwd.length < 8) errors.push("At least 8 characters");
        if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
        if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
        if (!/[0-9]/.test(pwd)) errors.push("One number");
        return errors;
    };

    const passwordErrors = validatePassword(password);
    const isPasswordValid = passwordErrors.length === 0;
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        if (!isPasswordValid) {
            setFormError("Please meet all password requirements");
            return;
        }

        if (!passwordsMatch) {
            setFormError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                setFormError(error.message);
            } else {
                setPageState("success");
                // Redirect to portal after 2 seconds
                setTimeout(() => {
                    window.location.href = "/portal";
                }, 2000);
            }
        } catch (err) {
            setFormError("Failed to update password. Please try again.");
        }
        setIsLoading(false);
    };

    // Loading state
    if (pageState === "loading") {
        return (
            <section className="min-h-screen flex items-center justify-center bg-black">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader2 className="w-10 h-10 text-zinc-400 animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Verifying reset link...</p>
                </motion.div>
            </section>
        );
    }

    // Error state
    if (pageState === "error") {
        return (
            <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
                <motion.div
                    className="w-full max-w-md text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Invalid or Expired Link</h2>
                        <p className="text-zinc-400 mb-6">
                            {errorMessage || "This password reset link is invalid or has expired. Please request a new one."}
                        </p>
                        <div className="space-y-3">
                            <a
                                href="/reset-password"
                                className="flex items-center justify-center gap-2 w-full bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                Request New Link
                            </a>
                            <a
                                href="/portal"
                                className="block w-full bg-zinc-800 border border-zinc-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Back to Sign In
                            </a>
                        </div>
                    </div>
                </motion.div>
            </section>
        );
    }

    // Success state
    if (pageState === "success") {
        return (
            <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
                <motion.div
                    className="w-full max-w-md text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
                        <p className="text-zinc-400 mb-2">
                            Your password has been successfully changed.
                        </p>
                        <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Redirecting to dashboard...
                        </p>
                    </div>
                </motion.div>
            </section>
        );
    }

    // Ready state - show password form
    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full mb-4">
                        <Lock className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300 text-sm font-medium">Set New Password</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Create New Password
                    </h1>
                    <p className="text-zinc-400">
                        Choose a strong password for your account
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                    {formError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition-colors pr-12"
                                        placeholder="••••••••"
                                        required
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password requirements */}
                                {password.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        {["At least 8 characters", "One uppercase letter", "One lowercase letter", "One number"].map((req, i) => {
                                            const isMet = !passwordErrors.includes(req);
                                            return (
                                                <div key={i} className={`flex items-center gap-2 text-xs ${isMet ? "text-green-400" : "text-gray-500"}`}>
                                                    {isMet ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-500" />}
                                                    {req}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none transition-colors pr-12 ${confirmPassword.length > 0
                                            ? passwordsMatch
                                                ? "border-green-500/50 focus:border-green-500"
                                                : "border-red-500/50 focus:border-red-500"
                                            : "border-zinc-800 focus:border-zinc-600"
                                            }`}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && !passwordsMatch && (
                                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !isPasswordValid || !passwordsMatch}
                                className="w-full bg-white text-black py-3.5 rounded-xl font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        Set New Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-zinc-500 text-sm mt-6">
                    Remember your password?{" "}
                    <a href="/portal" className="text-white hover:text-zinc-300 transition-colors">
                        Sign in instead
                    </a>
                </p>
            </motion.div>
        </section>
    );
}
