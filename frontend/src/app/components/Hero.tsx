import { useState } from "react";
import { ArrowRight, Check, Loader2, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Hero() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/.netlify/functions/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        setEmail("");
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navLinks = [
    { href: "/docs", label: "Docs" },
    { href: "/demo", label: "Demo" },
    { href: "#pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <section className="relative px-6 pt-8 pb-24 overflow-hidden">
      {/* Metallic grid background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Metallic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-transparent to-zinc-800/30" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header Navigation - Black/White/Metallic */}
        <motion.nav
          className="flex items-center justify-between py-4 mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <span className="text-black font-bold text-lg">A</span>
            </div>
            <span className="text-white font-semibold text-xl hidden sm:block">AgentAuth</span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="/nucleus"
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              Sign In
            </a>
            <a
              href="/portal"
              className="px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </motion.nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden fixed inset-0 top-20 bg-black/95 backdrop-blur-xl z-50 p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-zinc-300 hover:text-white text-lg font-medium border-b border-zinc-800 pb-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 flex flex-col gap-4">
                  <a
                    href="/nucleus"
                    className="text-center py-3 border border-zinc-700 text-white rounded-lg font-medium"
                  >
                    Sign In
                  </a>
                  <a
                    href="/portal"
                    className="text-center py-3 bg-white text-black rounded-lg font-medium"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Hero Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/50 mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-sm text-zinc-300">Now in Private Beta</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="text-white">
                Let AI Agents Buy For You
              </span>
              <br />
              <span className="text-zinc-500">— Safely</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-zinc-400 mb-4 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              The authorization layer for AI agent payments. Set spending limits,
              control merchants, and let autonomous systems transact with confidence.
            </motion.p>

            <motion.p
              className="text-sm text-zinc-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              Stripe handles checkout. <span className="text-zinc-400">AgentAuth handles whether checkout should happen.</span>
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 backdrop-blur-sm transition-all disabled:opacity-50"
                required
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                className="px-8 py-4 bg-white hover:bg-zinc-200 text-black rounded-xl transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                disabled={isLoading}
              >
                {isSubmitted ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    You're in!
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Demo CTA Button */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <a
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl hover:bg-zinc-800 hover:border-zinc-600 transition-all group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                Try Live Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <span className="text-zinc-600 text-sm ml-3">No signup required</span>
            </motion.div>

            {error && (
              <motion.p
                className="text-red-400 text-sm mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}

            <motion.p
              className="text-sm text-zinc-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Join 2,000+ developers building the future of autonomous commerce
            </motion.p>
          </div>

          {/* Right Column - Code Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="relative rounded-2xl border border-zinc-800 bg-zinc-950 backdrop-blur-xl p-8 overflow-hidden shadow-2xl"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
              whileHover={{
                rotateY: 2,
                rotateX: -2,
                transition: { duration: 0.3 }
              }}
            >
              {/* Metallic shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-zinc-900/20 opacity-50" />

              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>

              <pre className="text-sm text-zinc-300 leading-relaxed font-mono relative z-10">
                <code>
                  {`const auth = await agentauth.authorize({
  agentId: "agent_123",
  amount: 49.99,
  merchant: "stripe.com",
  category: "saas"
});

if (auth.approved) {
  await processPurchase(auth.token);
}`}
                </code>
              </pre>

              {/* Floating badge */}
              <motion.div
                className="absolute -top-4 -right-4 px-4 py-2 rounded-lg bg-white text-black font-medium text-sm shadow-lg"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ✓ Approved
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}