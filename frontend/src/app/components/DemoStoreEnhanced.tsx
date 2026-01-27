import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    ShoppingCart,
    Bot,
    Check,
    X,
    AlertTriangle,
    Loader2,
    Package,
    CreditCard,
    Shield,
    Zap,
    DollarSign,
    Ban,
    Sparkles,
    ArrowRight,
    RefreshCw,
    Code,
    Terminal,
    Clock,
    Activity,
    ChevronDown,
    ChevronUp,
    Copy,
    ExternalLink,
    Play,
    Pause,
    Settings,
    Eye,
    Lock,
    Unlock,
    Globe,
    Server,
    CheckCircle,
    XCircle,
    Timer,
    TrendingUp,
} from "lucide-react";

// Demo products with enhanced data for YC presentation
const PRODUCTS = [
    {
        id: "prod_001",
        name: "Notion Pro Plan",
        price: 10.00,
        image: "📝",
        category: "SaaS",
        merchant: "notion.so",
        merchantId: "mch_notion_pro",
        mcc: "5734",
        scenario: "approved",
        description: "Monthly subscription for Notion workspace"
    },
    {
        id: "prod_002",
        name: "GitHub Copilot",
        price: 19.00,
        image: "🤖",
        category: "Developer Tools",
        merchant: "github.com",
        merchantId: "mch_github_copilot",
        mcc: "5734",
        scenario: "approved",
        description: "AI-powered code completion"
    },
    {
        id: "prod_003",
        name: "DigitalOcean Droplet",
        price: 24.00,
        image: "☁️",
        category: "Cloud Hosting",
        merchant: "digitalocean.com",
        merchantId: "mch_digitalocean",
        mcc: "7372",
        scenario: "approved",
        description: "Basic cloud server instance"
    },
    {
        id: "prod_004",
        name: "Premium Mechanical Keyboard",
        price: 149.99,
        image: "⌨️",
        category: "Hardware",
        merchant: "amazon.com",
        merchantId: "mch_amazon",
        mcc: "5732",
        scenario: "over_budget",
        description: "High-end mechanical keyboard"
    },
    {
        id: "prod_005",
        name: "Online Poker Credits",
        price: 25.00,
        image: "🎰",
        category: "Gambling",
        merchant: "pokerstars.com",
        merchantId: "mch_pokerstars",
        mcc: "7995",
        scenario: "blocked_merchant",
        description: "Virtual poker chips"
    },
    {
        id: "prod_006",
        name: "AWS Monthly Bill",
        price: 45.99,
        image: "☁️",
        category: "Cloud Services",
        merchant: "aws.amazon.com",
        merchantId: "mch_aws",
        mcc: "7372",
        scenario: "approved",
        description: "Cloud infrastructure costs"
    },
];

interface TransactionStep {
    step: string;
    status: "pending" | "success" | "error" | "active" | "warning";
    message?: string;
    detail?: string;
    latency?: number;
    apiCall?: string;
    response?: string;
}

interface DemoMetrics {
    totalRequests: number;
    approvedCount: number;
    deniedCount: number;
    avgLatency: number;
    uptime: number;
}

interface DemoStoreEnhancedProps {
    onBack?: () => void;
    isYCMode?: boolean;
}

export function DemoStoreEnhanced({ onBack, isYCMode = false }: DemoStoreEnhancedProps) {
    const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
    const [maxBudget, setMaxBudget] = useState(50);
    const [isProcessing, setIsProcessing] = useState(false);
    const [steps, setSteps] = useState<TransactionStep[]>([]);
    const [transactionComplete, setTransactionComplete] = useState(false);
    const [finalDecision, setFinalDecision] = useState<"ALLOW" | "DENY" | null>(null);
    const [denyReason, setDenyReason] = useState<string>("");
    const [showIntro, setShowIntro] = useState(true);
    const [showCode, setShowCode] = useState(true);
    const [apiMode, setApiMode] = useState<"simulation" | "live">("simulation");
    const [showSettings, setShowSettings] = useState(false);
    const [metrics, setMetrics] = useState<DemoMetrics>({
        totalRequests: 1247,
        approvedCount: 1089,
        deniedCount: 158,
        avgLatency: 47,
        uptime: 99.99,
    });
    const [currentLatency, setCurrentLatency] = useState<number>(0);
    const [liveApiCalls, setLiveApiCalls] = useState<string[]>([]);
    const [copiedCode, setCopiedCode] = useState(false);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Scroll terminal to bottom when new entries are added
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [liveApiCalls]);

    const addApiCall = (call: string) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        setLiveApiCalls(prev => [...prev.slice(-20), `[${timestamp}] ${call}`]);
    };

    const updateStep = (
        stepName: string, 
        status: TransactionStep["status"], 
        message?: string, 
        detail?: string,
        latency?: number,
        apiCall?: string,
        response?: string
    ) => {
        setSteps(prev => {
            const existing = prev.find(s => s.step === stepName);
            if (existing) {
                return prev.map(s => s.step === stepName ? { ...s, status, message, detail, latency, apiCall, response } : s);
            }
            return [...prev, { step: stepName, status, message, detail, latency, apiCall, response }];
        });
    };

    const simulateAIPurchase = async (product: typeof PRODUCTS[0]) => {
        setIsProcessing(true);
        setSteps([]);
        setTransactionComplete(false);
        setFinalDecision(null);
        setDenyReason("");
        setShowIntro(false);
        setCurrentLatency(0);
        
        const startTime = Date.now();

        // Step 1: AI Agent Request
        addApiCall(`POST /v1/agents/activate { agentId: "agent_shopping_001" }`);
        updateStep("agent", "active", "AI Shopping Agent initializing...", undefined, undefined, 
            `POST /v1/agents/activate`, 
            `{ "agentId": "agent_shopping_001" }`
        );
        await new Promise(r => setTimeout(r, 600));
        updateStep("agent", "success", "Agent ready", `Target: ${product.name} ($${product.price})`, 12);
        addApiCall(`← 200 OK { status: "active", agentId: "agent_shopping_001" }`);

        // Step 2: Create/Verify Consent
        addApiCall(`GET /v1/consents/verify { userId: "user_demo", agentId: "agent_shopping_001" }`);
        updateStep("consent", "active", "Verifying user consent...", undefined, undefined,
            `GET /v1/consents/verify`,
            `{ "userId": "user_demo" }`
        );
        await new Promise(r => setTimeout(r, 800));
        const consentId = `consent_${Date.now().toString(36)}`;
        updateStep("consent", "success", "Consent verified", `Limit: $${maxBudget} | ID: ${consentId.slice(0, 15)}...`, 23);
        addApiCall(`← 200 OK { consentId: "${consentId.slice(0, 12)}...", maxAmount: ${maxBudget} }`);

        // Step 3: Check Spending Limits (Core Authorization)
        const authRequest = {
            delegation_token: `jwt_${Date.now().toString(36)}_demo`,
            action: "payment",
            transaction: {
                amount: product.price,
                currency: "USD",
                merchant_id: product.merchantId,
                merchant_name: product.merchant,
                merchant_category: product.mcc,
                description: product.description
            }
        };
        
        addApiCall(`POST /v1/authorize ${JSON.stringify(authRequest).slice(0, 60)}...`);
        updateStep("authorize", "active", "Requesting authorization...", "Checking all constraints", undefined,
            `POST /v1/authorize`,
            JSON.stringify(authRequest, null, 2)
        );
        await new Promise(r => setTimeout(r, 500));

        // Sub-check: Amount
        updateStep("limits", "active", "Checking spending limits...");
        await new Promise(r => setTimeout(r, 400));
        
        const isOverBudget = product.price > maxBudget;
        if (isOverBudget) {
            updateStep("limits", "error", "LIMIT EXCEEDED", `$${product.price} > $${maxBudget} budget`, 8);
            addApiCall(`← 403 DENY { reason: "amount_exceeded" }`);
        } else {
            updateStep("limits", "success", "Within spending limit", `$${product.price} ≤ $${maxBudget}`, 8);
        }

        // Sub-check: Merchant Rules
        updateStep("rules", "active", "Evaluating merchant rules...");
        await new Promise(r => setTimeout(r, 400));

        const isBlockedMerchant = product.scenario === "blocked_merchant";
        if (isBlockedMerchant) {
            updateStep("rules", "error", "MERCHANT BLOCKED", `MCC ${product.mcc} (Gambling) not allowed`, 6);
            addApiCall(`← 403 DENY { reason: "merchant_blocked", mcc: "${product.mcc}" }`);
        } else {
            updateStep("rules", "success", "Merchant verified", `${product.merchant} (MCC: ${product.mcc})`, 6);
        }

        // Calculate total latency
        const totalLatency = Math.floor(Math.random() * 30) + 35; // 35-65ms
        setCurrentLatency(totalLatency);
        
        // Final Decision
        await new Promise(r => setTimeout(r, 600));
        
        const isApproved = !isOverBudget && !isBlockedMerchant;
        
        if (isApproved) {
            setFinalDecision("ALLOW");
            const authCode = `authz_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
            
            updateStep("authorize", "success", "✅ AUTHORIZED", `Code: ${authCode}`, totalLatency);
            addApiCall(`← 200 ALLOW { authorization_code: "${authCode.slice(0, 16)}...", expires_in: 300 }`);

            // Process simulated payment
            addApiCall(`POST /v1/payments/process { authCode: "${authCode.slice(0, 12)}...", amount: ${product.price} }`);
            updateStep("payment", "active", "Processing payment via Stripe...");
            await new Promise(r => setTimeout(r, 800));
            
            const paymentId = `py_${Math.random().toString(36).substring(2, 10)}`;
            updateStep("payment", "success", "💳 Payment confirmed", `ID: ${paymentId}`, 156);
            addApiCall(`← 200 OK { paymentId: "${paymentId}", status: "succeeded" }`);

            // Complete
            updateStep("complete", "success", "🎉 Transaction complete", "Audit log recorded");
            setTransactionComplete(true);
            
            // Update metrics
            setMetrics(prev => ({
                ...prev,
                totalRequests: prev.totalRequests + 1,
                approvedCount: prev.approvedCount + 1,
                avgLatency: Math.floor((prev.avgLatency * prev.totalRequests + totalLatency) / (prev.totalRequests + 1))
            }));
        } else {
            setFinalDecision("DENY");
            const reason = isOverBudget ? "amount_exceeded" : "merchant_blocked";
            setDenyReason(reason);
            
            updateStep("authorize", "error", "❌ DENIED", 
                reason === "amount_exceeded"
                    ? `Amount $${product.price} exceeds $${maxBudget} limit`
                    : `Merchant category ${product.mcc} is blocked`,
                totalLatency
            );
            
            // Update metrics
            setMetrics(prev => ({
                ...prev,
                totalRequests: prev.totalRequests + 1,
                deniedCount: prev.deniedCount + 1,
                avgLatency: Math.floor((prev.avgLatency * prev.totalRequests + totalLatency) / (prev.totalRequests + 1))
            }));
        }

        setIsProcessing(false);
    };

    const handlePurchase = (product: typeof PRODUCTS[0]) => {
        setSelectedProduct(product);
        simulateAIPurchase(product);
    };

    const resetDemo = () => {
        setSelectedProduct(null);
        setSteps([]);
        setTransactionComplete(false);
        setFinalDecision(null);
        setDenyReason("");
        setShowIntro(true);
        setCurrentLatency(0);
    };

    const getScenarioLabel = (product: typeof PRODUCTS[0]) => {
        if (product.price > maxBudget) return { text: "Over Budget", color: "red" };
        if (product.scenario === "blocked_merchant") return { text: "Blocked", color: "orange" };
        return { text: "Allowed", color: "green" };
    };

    const codeExample = `// 1. Create consent with spending limit
const consent = await agentauth.createConsent({
  userId: "user_demo",
  maxAmount: ${maxBudget},
  currency: "USD",
  merchantCategories: ["5734", "7372"], // SaaS, Cloud
  blockedCategories: ["7995"] // Gambling
});

// 2. Agent requests authorization
const auth = await agentauth.authorize({
  delegationToken: consent.token,
  action: "payment",
  transaction: {
    amount: ${selectedProduct?.price || 49.99},
    merchant: "${selectedProduct?.merchant || "example.com"}",
    merchantCategory: "${selectedProduct?.mcc || "5734"}"
  }
});

// 3. Process payment if approved
if (auth.decision === "ALLOW") {
  const payment = await stripe.charges.create({
    amount: ${((selectedProduct?.price || 49.99) * 100).toFixed(0)},
    agentAuthCode: auth.authorization_code
  });
}`;

    const copyCode = () => {
        navigator.clipboard.writeText(codeExample);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#0D0D14] to-[#0A0A0F]">
            {/* Top Metrics Bar - YC Mode */}
            {isYCMode && (
                <motion.div 
                    className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 py-3 px-6 sticky top-0 z-50"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-green-400 text-sm font-medium">Live Demo</span>
                            </div>
                            <div className="h-4 w-px bg-white/10"></div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Requests</p>
                                    <p className="text-white font-mono">{metrics.totalRequests.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Approved</p>
                                    <p className="text-green-400 font-mono">{metrics.approvedCount.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Denied</p>
                                    <p className="text-red-400 font-mono">{metrics.deniedCount}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Avg Latency</p>
                                    <p className="text-cyan-400 font-mono">{metrics.avgLatency}ms</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Uptime</p>
                                    <p className="text-emerald-400 font-mono">{metrics.uptime}%</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {currentLatency > 0 && (
                                <motion.div 
                                    className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    <Timer className="w-4 h-4 text-cyan-400" />
                                    <span className="text-cyan-400 font-mono text-sm">{currentLatency}ms</span>
                                </motion.div>
                            )}
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Settings className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-zinc-800 to-zinc-700 border border-zinc-700 rounded-full mb-4">
                            <Sparkles className="w-4 h-4 text-zinc-400" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-400 text-sm font-medium">
                                {isYCMode ? "YC Demo • W26" : "Live Interactive Demo"}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                            AI Agents Buy <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 via-zinc-500 to-zinc-400">Safely</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Real-time authorization in under 100ms. Set spending limits, block merchants, and watch AgentAuth protect your wallet.
                        </p>
                    </motion.div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* Left Column - Controls & Products */}
                        <div className="xl:col-span-4 space-y-6">
                            {/* Budget Control */}
                            <motion.div
                                className="p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-2xl"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">Spending Limit</h3>
                                            <p className="text-gray-500 text-xs">Max per transaction</p>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                                        ${maxBudget}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={10}
                                    max={200}
                                    step={5}
                                    value={maxBudget}
                                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                                               [&::-webkit-slider-thumb]:appearance-none
                                               [&::-webkit-slider-thumb]:w-5
                                               [&::-webkit-slider-thumb]:h-5
                                               [&::-webkit-slider-thumb]:rounded-full
                                               [&::-webkit-slider-thumb]:bg-gradient-to-r
                                               [&::-webkit-slider-thumb]:from-emerald-500
                                               [&::-webkit-slider-thumb]:to-green-500
                                               [&::-webkit-slider-thumb]:cursor-pointer
                                               [&::-webkit-slider-thumb]:shadow-lg
                                               [&::-webkit-slider-thumb]:shadow-emerald-500/30"
                                    disabled={isProcessing}
                                />
                                <div className="flex justify-between mt-2 text-xs text-gray-500">
                                    <span>$10</span>
                                    <span>$200</span>
                                </div>
                            </motion.div>

                            {/* Products Grid */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    PRODUCTS • Click to purchase
                                </h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRODUCTS.map((product) => {
                                        const scenario = getScenarioLabel(product);
                                        const isSelected = selectedProduct?.id === product.id;
                                        return (
                                            <motion.div
                                                key={product.id}
                                                className={`relative p-3 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                                                    isProcessing && !isSelected
                                                        ? "opacity-40 cursor-not-allowed"
                                                        : isSelected
                                                            ? "bg-zinc-800/50 border-zinc-600"
                                                            : scenario.color === "green"
                                                                ? "bg-white/[0.02] border-white/10 hover:border-green-500/50 hover:bg-green-500/5"
                                                                : scenario.color === "red"
                                                                    ? "bg-red-500/5 border-red-500/20 hover:border-red-500/50"
                                                                    : "bg-orange-500/5 border-orange-500/20 hover:border-orange-500/50"
                                                }`}
                                                whileHover={!isProcessing ? { scale: 1.02 } : {}}
                                                whileTap={!isProcessing ? { scale: 0.98 } : {}}
                                                onClick={() => !isProcessing && handlePurchase(product)}
                                            >
                                                {isSelected && isProcessing && (
                                                    <motion.div 
                                                        className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-700"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                )}
                                                <div className="relative">
                                                    <div className="text-2xl mb-1">{product.image}</div>
                                                    <h3 className="text-xs font-semibold text-white mb-0.5 truncate">{product.name}</h3>
                                                    <p className="text-[10px] text-gray-500 mb-2">{product.category}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-white">${product.price}</span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                                                            scenario.color === "green" ? "bg-green-500/20 text-green-400" :
                                                            scenario.color === "red" ? "bg-red-500/20 text-red-400" :
                                                            "bg-orange-500/20 text-orange-400"
                                                        }`}>
                                                            {scenario.text}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>

                        {/* Center Column - Authorization Flow */}
                        <div className="xl:col-span-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden h-full"
                            >
                                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                    <h2 className="font-semibold text-white flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-cyan-400" />
                                        Authorization Flow
                                    </h2>
                                    {currentLatency > 0 && (
                                        <span className="text-xs text-cyan-400 font-mono bg-cyan-500/10 px-2 py-1 rounded">
                                            {currentLatency}ms total
                                        </span>
                                    )}
                                </div>

                                <div className="p-4 min-h-[400px]">
                                    {showIntro && steps.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-64 text-center">
                                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center mb-4">
                                                <Bot className="w-10 h-10 text-zinc-400/50" />
                                            </div>
                                            <p className="text-gray-400 mb-2">Select a product to watch</p>
                                            <p className="text-gray-500 text-sm">the authorization flow in real-time</p>
                                            <div className="flex items-center gap-2 mt-6 text-gray-600">
                                                <ArrowRight className="w-4 h-4" />
                                                <span className="text-xs">API calls visualized step-by-step</span>
                                            </div>
                                        </div>
                                    )}

                                    <AnimatePresence mode="sync">
                                        {steps.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-2"
                                            >
                                                {steps.map((step, index) => (
                                                    <motion.div
                                                        key={step.step}
                                                        className={`p-3 rounded-lg ${
                                                            step.status === "success" ? "bg-green-500/10 border border-green-500/20" :
                                                            step.status === "error" ? "bg-red-500/10 border border-red-500/20" :
                                                            step.status === "warning" ? "bg-yellow-500/10 border border-yellow-500/20" :
                                                            step.status === "active" ? "bg-zinc-800/50 border border-zinc-700" :
                                                            "bg-gray-500/10 border border-gray-500/20"
                                                        }`}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.03 }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                                step.status === "success" ? "bg-green-500/30" :
                                                                step.status === "error" ? "bg-red-500/30" :
                                                                step.status === "warning" ? "bg-yellow-500/30" :
                                                                step.status === "active" ? "bg-zinc-700" :
                                                                "bg-gray-500/30"
                                                            }`}>
                                                                {step.status === "success" && <Check className="w-4 h-4 text-green-400" />}
                                                                {step.status === "error" && <X className="w-4 h-4 text-red-400" />}
                                                                {step.status === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                                                                {step.status === "active" && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
                                                                {step.status === "pending" && <Zap className="w-4 h-4 text-gray-400" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <p className={`font-medium text-sm ${
                                                                        step.status === "success" ? "text-green-400" :
                                                                        step.status === "error" ? "text-red-400" :
                                                                        step.status === "warning" ? "text-yellow-400" :
                                                                        "text-white"
                                                                    }`}>{step.message}</p>
                                                                    {step.latency && (
                                                                        <span className="text-xs text-gray-500 font-mono">{step.latency}ms</span>
                                                                    )}
                                                                </div>
                                                                {step.detail && (
                                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{step.detail}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Final Decision Banner */}
                                    <AnimatePresence>
                                        {finalDecision && !isProcessing && (
                                            <motion.div
                                                className={`mt-4 p-4 rounded-xl ${
                                                    finalDecision === "ALLOW"
                                                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30"
                                                        : "bg-gradient-to-r from-red-500/20 to-orange-500/10 border border-red-500/30"
                                                }`}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {finalDecision === "ALLOW" ? (
                                                        <>
                                                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                <CheckCircle className="w-6 h-6 text-green-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-green-400 font-bold text-lg">AUTHORIZED ✓</p>
                                                                <p className="text-sm text-gray-400">
                                                                    ${selectedProduct?.price} → {selectedProduct?.merchant}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                                                <XCircle className="w-6 h-6 text-red-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-red-400 font-bold text-lg">DENIED ✗</p>
                                                                <p className="text-sm text-gray-400">
                                                                    {denyReason === "amount_exceeded"
                                                                        ? `$${selectedProduct?.price} exceeds $${maxBudget} limit`
                                                                        : `${selectedProduct?.category} merchants blocked`
                                                                    }
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={resetDemo}
                                                    className="mt-4 w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Try Another
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column - Code & Terminal */}
                        <div className="xl:col-span-4 space-y-6">
                            {/* Live Terminal */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden"
                            >
                                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <span className="text-gray-400 text-sm ml-2 font-mono">API Calls</span>
                                    </div>
                                    <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                                </div>
                                <div 
                                    ref={terminalRef}
                                    className="p-4 font-mono text-xs h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
                                >
                                    {liveApiCalls.length === 0 ? (
                                        <p className="text-gray-600">Waiting for requests...</p>
                                    ) : (
                                        liveApiCalls.map((call, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`mb-1 ${
                                                    call.includes("← 200") ? "text-green-400" :
                                                    call.includes("← 403") ? "text-red-400" :
                                                    call.includes("POST") || call.includes("GET") ? "text-cyan-400" :
                                                    "text-gray-400"
                                                }`}
                                            >
                                                {call}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                            {/* Code Example */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden"
                            >
                                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-zinc-400" />
                                        <span className="text-gray-400 text-sm">Integration Code</span>
                                    </div>
                                    <button 
                                        onClick={copyCode}
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                                    >
                                        {copiedCode ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-green-400" />
                                                <span className="text-green-400">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-4 font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                    <pre className="text-gray-300">
                                        <code>{codeExample}</code>
                                    </pre>
                                </div>
                            </motion.div>

                            {/* Key Features */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="grid grid-cols-2 gap-3"
                            >
                                <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Timer className="w-4 h-4 text-cyan-400" />
                                        <span className="text-white text-sm font-medium">&lt;100ms</span>
                                    </div>
                                    <p className="text-gray-500 text-xs">Authorization latency</p>
                                </div>
                                <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield className="w-4 h-4 text-zinc-400" />
                                        <span className="text-white text-sm font-medium">Zero fraud</span>
                                    </div>
                                    <p className="text-gray-500 text-xs">Rule-based protection</p>
                                </div>
                                <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lock className="w-4 h-4 text-green-400" />
                                        <span className="text-white text-sm font-medium">SOC 2</span>
                                    </div>
                                    <p className="text-gray-500 text-xs">Compliance ready</p>
                                </div>
                                <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Globe className="w-4 h-4 text-orange-400" />
                                        <span className="text-white text-sm font-medium">REST API</span>
                                    </div>
                                    <p className="text-gray-500 text-xs">Easy integration</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Back link */}
                    {onBack && (
                        <motion.div 
                            className="text-center mt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <button
                                onClick={onBack}
                                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                Back to Home
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
