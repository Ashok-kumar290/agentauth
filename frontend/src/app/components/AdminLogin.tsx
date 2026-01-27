import { useState } from "react";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, AlertCircle, Loader2, Mail, Github } from "lucide-react";
import { supabase } from "../../lib/supabase";

// Version: 1.0.4 (Local dev fallback)
const API_BASE = window.location.origin;
const ADMIN_PASSWORD = "agentauth2026"; // Fallback for local dev

interface AdminLoginProps {
    onLoginSuccess?: (token: string) => void;
    onAuthenticated?: (authenticated: boolean) => void;
    onBack?: () => void;
    showUserLogin?: boolean;
}

export function AdminLogin({ onLoginSuccess, onAuthenticated, onBack, showUserLogin = false }: AdminLoginProps) {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [loginMode, setLoginMode] = useState<"admin" | "user">(showUserLogin ? "user" : "admin");

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Try netlify function first, fallback to local validation
            const fetchUrl = `${API_BASE}/.netlify/functions/admin-login`;
            console.log(`Authenticating with: ${fetchUrl}`);

            try {
                const response = await fetch(fetchUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ password }),
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("admin_token", data.token);
                    localStorage.setItem("admin_expires", data.expires_at);
                    if (onLoginSuccess) onLoginSuccess(data.token);
                    if (onAuthenticated) onAuthenticated(true);
                    return;
                }
                
                const data = await response.json();
                throw new Error(data.detail || "Authentication failed");
            } catch (fetchErr) {
                // Fallback: Local validation for development
                console.log("API not available, using local validation");
                if (password === ADMIN_PASSWORD) {
                    const expiresAt = new Date();
                    expiresAt.setHours(expiresAt.getHours() + 1);
                    const fakeToken = `dev_token_${Date.now()}`;
                    
                    localStorage.setItem("admin_token", fakeToken);
                    localStorage.setItem("admin_expires", expiresAt.toISOString());
                    
                    if (onLoginSuccess) onLoginSuccess(fakeToken);
                    if (onAuthenticated) onAuthenticated(true);
                    return;
                }
                throw new Error("Invalid password");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password: userPassword,
            });
            if (error) throw error;
            // Auth state change will be handled by the parent component
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/nucleus` },
        });
        if (error) setError(error.message);
    };

    const handleGithubLogin = async () => {
        setError("");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: { redirectTo: `${window.location.origin}/nucleus` },
        });
        if (error) setError(error.message);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                        <Lock className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white">Nucleus</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {loginMode === "admin" ? "Control Center Access" : "Sign in to your dashboard"}
                    </p>
                </div>

                {/* Mode Toggle */}
                {showUserLogin && (
                    <div className="flex mb-6 bg-white/5 rounded-xl p-1">
                        <button
                            onClick={() => setLoginMode("user")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                loginMode === "user" 
                                    ? "bg-white/10 text-white" 
                                    : "text-gray-500 hover:text-white"
                            }`}
                        >
                            User Login
                        </button>
                        <button
                            onClick={() => setLoginMode("admin")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                loginMode === "admin" 
                                    ? "bg-white/10 text-white" 
                                    : "text-gray-500 hover:text-white"
                            }`}
                        >
                            Admin Access
                        </button>
                    </div>
                )}

                {/* Login Card */}
                <motion.div
                    className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-8"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {loginMode === "user" ? (
                        <>
                            {/* OAuth Buttons */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-sm">Google</span>
                                </button>
                                <button
                                    onClick={handleGithubLogin}
                                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl"
                                >
                                    <Github className="w-5 h-5" />
                                    <span className="text-sm">GitHub</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-white/20" />
                                <span className="text-gray-500 text-sm">or</span>
                                <div className="flex-1 h-px bg-white/20" />
                            </div>

                            <form onSubmit={handleUserLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                                            placeholder="you@example.com"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={userPassword}
                                            onChange={(e) => setUserPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors pr-12"
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={isLoading || !email || !userPassword}
                                    className="w-full py-3 px-6 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </motion.button>
                            </form>

                            <p className="text-center text-zinc-500 text-sm mt-4">
                                Don't have an account?{" "}
                                <a href="/portal" className="text-white hover:underline">Sign up</a>
                                {" "}•{" "}
                                <a href="/reset-password" className="text-white hover:underline">Forgot password?</a>
                            </p>
                        </>
                    ) : (
                        <form onSubmit={handleAdminSubmit} className="space-y-6">
                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Access Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors pr-12"
                                        placeholder="Enter access password"
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isLoading || !password}
                                className="w-full py-3 px-6 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    "Access Control Panel"
                                )}
                            </motion.button>
                        </form>
                    )}

                    {/* Security Note */}
                    <p className="text-center text-gray-500 text-xs mt-6">
                        🔒 Secured with JWT · Session expires in 1 hour
                    </p>
                </motion.div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        ← Return to main site
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
