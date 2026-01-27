import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter your email address");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/set-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("Failed to send reset email. Please try again.");
        }
        setIsLoading(false);
    };

    if (success) {
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
                        <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                        <p className="text-zinc-400 mb-6">
                            We've sent a password reset link to <span className="text-green-400">{email}</span>
                        </p>
                        <p className="text-zinc-500 text-sm mb-6">
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                        </p>
                        <a
                            href="/portal"
                            className="inline-flex items-center gap-2 text-white hover:text-zinc-300 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </a>
                    </div>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full mb-4">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300 text-sm font-medium">Password Reset</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Forgot Your Password?
                    </h1>
                    <p className="text-zinc-400">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition-colors"
                                    placeholder="you@example.com"
                                    required
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black py-3.5 rounded-xl font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Mail className="w-5 h-5" />
                                        Send Reset Link
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <a
                            href="/portal"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </a>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
