import { useState } from "react";
import { motion } from "motion/react";
import {
    Send,
    Mail,
    MessageSquare,
    User,
    Building2,
    Check,
    Loader2,
    ArrowLeft
} from "lucide-react";

interface ContactProps {
    onBack?: () => void;
}

export function Contact({ onBack }: ContactProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        subject: "general",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/.netlify/functions/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsSubmitted(true);
                setFormData({ name: "", email: "", company: "", subject: "general", message: "" });
            } else {
                setError(data.error || "Failed to send message. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const subjects = [
        { value: "general", label: "General Inquiry" },
        { value: "sales", label: "Sales & Pricing" },
        { value: "partnership", label: "Partnership" },
        { value: "support", label: "Technical Support" },
        { value: "enterprise", label: "Enterprise Plan" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#12121A] to-[#0A0A0F] px-6 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                {onBack && (
                    <motion.button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </motion.button>
                )}

                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">Get in Touch</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Contact Our Team
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Have questions about AgentAuth? Want to discuss enterprise plans or partnerships?
                        We'd love to hear from you.
                    </p>
                </motion.div>

                {isSubmitted ? (
                    <motion.div
                        className="max-w-md mx-auto text-center p-8 bg-green-500/10 border border-green-500/20 rounded-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
                        <p className="text-gray-400 mb-6">
                            Thank you for reaching out. We'll get back to you within 24 hours.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                        >
                            Send Another Message
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        onSubmit={handleSubmit}
                        className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    placeholder="john@company.com"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Company */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Building2 className="w-4 h-4 inline mr-2" />
                                    Company (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    placeholder="Acme Inc."
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Subject *
                                </label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors appearance-none cursor-pointer"
                                >
                                    {subjects.map(s => (
                                        <option key={s.value} value={s.value} className="bg-[#12121A]">
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <MessageSquare className="w-4 h-4 inline mr-2" />
                                Message *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                                placeholder="Tell us how we can help..."
                            />
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Send Message
                                </>
                            )}
                        </button>

                        <p className="text-center text-gray-500 text-sm mt-4">
                            We typically respond within 24 hours
                        </p>
                    </motion.form>
                )}

                {/* Contact Info */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="text-gray-500 mb-4">Or reach us directly at</p>
                    <a
                        href="mailto:hello@agentauth.in"
                        className="text-purple-400 hover:text-purple-300 text-lg font-medium"
                    >
                        hello@agentauth.in
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
