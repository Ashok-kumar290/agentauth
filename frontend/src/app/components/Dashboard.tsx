import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutDashboard,
    BarChart3,
    Shield,
    Clock,
    Users,
    FileText,
    Key,
    Link2,
    BookOpen,
    CreditCard,
    Settings,
    Zap,
    Plus,
    Copy,
    RefreshCw,
    ChevronRight,
    LogOut,
    Search,
    Filter,
    Download,
    Trash2,
    Edit,
    Eye,
    EyeOff,
    Check,
    X,
    AlertTriangle,
    Bell,
    Mail,
    Lock,
    Globe,
    Activity,
    TrendingUp,
    TrendingDown,
    Calendar,
    Bot,
    Webhook,
    Send,
    UserPlus,
    Crown,
    CheckCircle,
    XCircle,
    MoreVertical,
    ExternalLink,
    Receipt,
    DollarSign,
    Package,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

// Types
interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: "authorized" | "denied" | "pending";
    merchant: string;
    created_at: string;
    description: string;
}

interface DashboardStats {
    total_authorizations: number;
    transaction_volume: number;
    approval_rate: number;
    avg_response_time: number;
    transactions: Transaction[];
}

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

type NavSection = "dashboard" | "analytics" | "transactions" | "consents" | "agents" | "logs" | "apikeys" | "webhooks" | "team" | "billing" | "settings";

// Navigation Item Component
const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${active
            ? "bg-white/5 text-white border-r-2 border-white"
            : "text-gray-500 hover:bg-white/5 hover:text-white"
            }`}
    >
        <Icon className="w-[18px] h-[18px] opacity-70" />
        {label}
    </button>
);

// Stat Card Component
const StatCard = ({
    label,
    value,
    change,
    positive = true,
    icon: Icon,
}: {
    label: string;
    value: string;
    change: string;
    positive?: boolean;
    icon: React.ElementType;
}) => (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Icon className="w-3.5 h-3.5" />
            {label}
        </div>
        <div className="text-3xl font-semibold text-white mb-1">{value}</div>
        <div className={`text-xs flex items-center gap-1 ${positive ? "text-emerald-500" : "text-red-500"}`}>
            {positive ? "↑" : "↓"} {change}
        </div>
    </div>
);

// Usage Bar Component
const UsageBar = ({
    title,
    used,
    total,
    variant = "normal",
}: {
    title: string;
    used: number;
    total: number;
    variant?: "normal" | "warning" | "danger";
}) => {
    const percentage = (used / total) * 100;
    const gradientClass =
        variant === "danger"
            ? "from-red-500 to-red-600"
            : variant === "warning"
                ? "from-yellow-400 to-amber-500"
                : "from-emerald-500 to-emerald-600";

    return (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 mb-3">
            <div className="flex justify-between mb-2.5">
                <span className="text-sm font-medium text-white">{title}</span>
                <span className="text-sm text-gray-500">
                    {used.toLocaleString()} / {total.toLocaleString()}
                </span>
            </div>
            <div className="h-2 bg-[#222] rounded overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${gradientClass} rounded`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
};

// Chart Component
const ActivityChart = ({ data, period, onPeriodChange }: {
    data: number[];
    period: string;
    onPeriodChange: (p: string) => void;
}) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const maxValue = Math.max(...data, 1);

    return (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-medium text-white">Authorization Activity</span>
                <div className="flex gap-1">
                    {["24h", "7d", "30d", "90d"].map((p) => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange(p)}
                            className={`px-3 py-1.5 rounded text-xs ${period === p ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-end gap-2 h-44 pt-5">
                {data.map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                            className="w-full bg-gradient-to-t from-emerald-500 to-emerald-600 rounded-t min-h-1"
                            style={{ height: `${(value / maxValue) * 100}%` }}
                        />
                        <span className="text-[10px] text-gray-500">{days[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// API Key Card Component
const ApiKeyCard = ({
    name,
    createdAt,
    keyPreview,
    isLive,
}: {
    name: string;
    createdAt: string;
    keyPreview: string;
    isLive: boolean;
}) => (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex justify-between items-center mb-3">
        <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                <Key className={`w-[18px] h-[18px] ${isLive ? "text-emerald-500" : "text-gray-500"}`} />
            </div>
            <div>
                <h4 className="text-sm font-medium text-white">{name}</h4>
                <p className="text-xs text-gray-500">{createdAt}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <code className="text-sm text-gray-500 bg-white/5 px-3 py-2 rounded">{keyPreview}</code>
            <button
                onClick={() => navigator.clipboard?.writeText(keyPreview)}
                className="w-9 h-9 rounded-lg bg-white/5 border border-[#333] text-gray-500 hover:bg-white/10 hover:text-white flex items-center justify-center"
                title="Copy key"
            >
                <Copy className="w-4 h-4" />
            </button>
        </div>
    </div>
);

// Transaction Row Component
const TransactionRow = ({ tx }: { tx: Transaction }) => {
    const statusStyles = {
        authorized: "bg-emerald-500/10 text-emerald-500",
        denied: "bg-red-500/10 text-red-500",
        pending: "bg-yellow-500/10 text-yellow-500",
    };

    const timeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02]">
            <td className="py-3.5 px-4">
                <code className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {tx.id.substring(0, 12)}...
                </code>
            </td>
            <td className="py-3.5 px-4 text-white">
                ${tx.amount.toFixed(2)} {tx.currency}
            </td>
            <td className="py-3.5 px-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[tx.status]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
            </td>
            <td className="py-3.5 px-4 text-gray-500 text-sm">{timeAgo(tx.created_at)}</td>
        </tr>
    );
};

// Quick Action Component
const QuickAction = ({
    icon: Icon,
    title,
    description,
    onClick,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    onClick?: () => void;
}) => (
    <button
        onClick={onClick}
        className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 hover:border-[#333] transition-all text-left"
    >
        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-emerald-500">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <h4 className="text-sm font-medium text-white">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </button>
);

// Color maps for Tailwind (static classes required - dynamic interpolation gets purged)
const colorBgMap: Record<string, string> = {
    emerald: "bg-emerald-500/10",
    red: "bg-red-500/10",
    yellow: "bg-yellow-500/10",
    purple: "bg-purple-500/10",
    cyan: "bg-cyan-500/10",
    orange: "bg-orange-500/10",
    blue: "bg-blue-500/10",
};

const colorTextMap: Record<string, string> = {
    emerald: "text-emerald-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
    purple: "text-purple-500",
    cyan: "text-cyan-500",
    orange: "text-orange-500",
    blue: "text-blue-500",
};

// Page title mapping
const pageTitles: Record<NavSection, string> = {
    dashboard: "Dashboard",
    analytics: "Analytics",
    transactions: "Transactions",
    consents: "Consents",
    agents: "Agents",
    logs: "Audit Logs",
    apikeys: "API Keys",
    webhooks: "Webhooks",
    team: "Team",
    billing: "Billing",
    settings: "Settings",
};

// Main Dashboard Component
interface DashboardProps {
    checkoutSuccess?: boolean;
    onDismissCheckout?: () => void;
}

export function Dashboard({ checkoutSuccess, onDismissCheckout }: DashboardProps = {}) {
    const [activeNav, setActiveNav] = useState<NavSection>(checkoutSuccess ? "billing" : "dashboard");
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(checkoutSuccess || false);
    const [period, setPeriod] = useState("7d");
    const [chartData, setChartData] = useState([65, 80, 45, 90, 70, 55, 40]);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [newKeyName, setNewKeyName] = useState("");
    const [newKeyType, setNewKeyType] = useState<"live" | "test">("live");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Admin");
    const [notifications, setNotifications] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: false, 3: true });
    const [txPage, setTxPage] = useState(1);
    const [logSearch, setLogSearch] = useState("");
    const [txSearch, setTxSearch] = useState("");
    const [txStatusFilter, setTxStatusFilter] = useState("all");
    const [txTimeFilter, setTxTimeFilter] = useState("7d");
    const [logEventFilter, setLogEventFilter] = useState("all");
    const [logTimeFilter, setLogTimeFilter] = useState("24h");
    const [visibleLogs, setVisibleLogs] = useState(10);
    const [agentSearch, setAgentSearch] = useState("");

    // Show toast notification
    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Clipboard helper
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(
            () => showToast("Copied to clipboard!", "success"),
            () => showToast("Failed to copy", "error")
        );
    };

    // Handle consent approve/deny
    const handleConsentAction = (agent: string, action: "approve" | "deny") => {
        showToast(`${action === "approve" ? "Approved" : "Denied"} consent for ${agent}`, action === "approve" ? "success" : "info");
    };

    // Handle consent revoke
    const handleRevokeConsent = (agent: string) => {
        showToast(`Revoked consent for ${agent}`, "info");
    };

    // Handle create API key
    const handleCreateKey = () => {
        if (!newKeyName.trim()) {
            showToast("Please enter a key name", "error");
            return;
        }
        showToast(`API key "${newKeyName}" created successfully!`, "success");
        setNewKeyName("");
    };

    // Handle delete API key
    const handleDeleteKey = (name: string) => {
        if (confirm(`Are you sure you want to delete the key "${name}"? This cannot be undone.`)) {
            showToast(`API key "${name}" deleted`, "info");
        }
    };

    // Handle add webhook
    const handleAddWebhook = () => {
        if (!webhookUrl.trim()) {
            showToast("Please enter a webhook URL", "error");
            return;
        }
        try {
            new URL(webhookUrl);
            showToast(`Webhook endpoint added: ${webhookUrl}`, "success");
            setWebhookUrl("");
        } catch {
            showToast("Please enter a valid URL", "error");
        }
    };

    // Handle test webhook
    const handleTestWebhook = (url: string) => {
        showToast(`Test event sent to ${url}`, "info");
    };

    // Handle delete webhook
    const handleDeleteWebhook = (url: string) => {
        if (confirm(`Delete webhook endpoint?\n${url}`)) {
            showToast("Webhook deleted", "info");
        }
    };

    // Handle invite team member
    const handleInvite = () => {
        if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
            showToast("Please enter a valid email address", "error");
            return;
        }
        showToast(`Invitation sent to ${inviteEmail} as ${inviteRole}`, "success");
        setInviteEmail("");
    };

    // Handle notification toggle
    const handleToggleNotification = (index: number) => {
        setNotifications(prev => ({ ...prev, [index]: !prev[index] }));
        showToast("Notification setting updated", "success");
    };

    // Handle export
    const handleExport = (type: string) => {
        showToast(`Exporting ${type}... Download will start shortly.`, "info");
    };

    // Handle upgrade plan
    const handleUpgradePlan = () => {
        const apiBase = window.location.hostname === "localhost" ? "http://localhost:8000" : window.location.origin;
        window.open(`${apiBase}/.netlify/functions/checkout?plan=enterprise`, "_blank");
    };

    // Handle update payment
    const handleUpdatePayment = () => {
        showToast("Redirecting to payment portal...", "info");
        const apiBase = window.location.hostname === "localhost" ? "http://localhost:8000" : window.location.origin;
        window.open(`${apiBase}/.netlify/functions/checkout?update=true`, "_blank");
    };

    // Handle delete org
    const handleDeleteOrg = () => {
        const confirmText = prompt('Type "DELETE" to confirm organization deletion:');
        if (confirmText === "DELETE") {
            showToast("Organization deletion requested. You will receive a confirmation email.", "info");
        } else if (confirmText !== null) {
            showToast("Deletion cancelled - text did not match", "error");
        }
    };

    // Handle edit settings
    const handleEditSetting = (field: string) => {
        const newValue = prompt(`Enter new ${field}:`);
        if (newValue) {
            showToast(`${field} updated to "${newValue}"`, "success");
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const apiBase = window.location.hostname === "localhost" ? "http://localhost:8000" : window.location.origin;
            const response = await fetch(`${apiBase}/.netlify/functions/get-stripe-transactions?period=${period}&limit=20`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_expires");
        window.location.href = "/";
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
        return `$${amount.toFixed(2)}`;
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-white font-['Inter',sans-serif]">
            {/* Sidebar */}
            <aside className="w-60 bg-[#111] border-r border-[#222] flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#222]">
                    <img src="/agentauth-icon-dark.svg" alt="AgentAuth" className="w-7 h-7" />
                    <span className="text-base font-semibold">
                        Agent<span className="text-gray-500">Auth</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-5">
                    <div className="mb-6">
                        <div className="px-5 mb-2 text-[10px] uppercase tracking-wider text-gray-600">
                            Overview
                        </div>
                        <NavItem icon={LayoutDashboard} label="Dashboard" active={activeNav === "dashboard"} onClick={() => setActiveNav("dashboard")} />
                        <NavItem icon={BarChart3} label="Analytics" active={activeNav === "analytics"} onClick={() => setActiveNav("analytics")} />
                    </div>

                    <div className="mb-6">
                        <div className="px-5 mb-2 text-[10px] uppercase tracking-wider text-gray-600">
                            Authorization
                        </div>
                        <NavItem icon={Shield} label="Transactions" active={activeNav === "transactions"} onClick={() => setActiveNav("transactions")} />
                        <NavItem icon={Clock} label="Consents" active={activeNav === "consents"} onClick={() => setActiveNav("consents")} />
                        <NavItem icon={Bot} label="Agents" active={activeNav === "agents"} onClick={() => setActiveNav("agents")} />
                        <NavItem icon={FileText} label="Audit Logs" active={activeNav === "logs"} onClick={() => setActiveNav("logs")} />
                    </div>

                    <div className="mb-6">
                        <div className="px-5 mb-2 text-[10px] uppercase tracking-wider text-gray-600">
                            Developers
                        </div>
                        <NavItem icon={Key} label="API Keys" active={activeNav === "apikeys"} onClick={() => setActiveNav("apikeys")} />
                        <NavItem icon={Webhook} label="Webhooks" active={activeNav === "webhooks"} onClick={() => setActiveNav("webhooks")} />
                        <NavItem icon={BookOpen} label="Documentation" onClick={() => window.location.href = "/docs"} />
                    </div>

                    <div className="mb-6">
                        <div className="px-5 mb-2 text-[10px] uppercase tracking-wider text-gray-600">
                            Settings
                        </div>
                        <NavItem icon={Users} label="Team" active={activeNav === "team"} onClick={() => setActiveNav("team")} />
                        <NavItem icon={CreditCard} label="Billing" active={activeNav === "billing"} onClick={() => setActiveNav("billing")} />
                        <NavItem icon={Settings} label="Settings" active={activeNav === "settings"} onClick={() => setActiveNav("settings")} />
                    </div>
                </nav>

                {/* Plan Badge */}
                <div className="p-5 border-t border-[#222]">
                    <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <div>
                            <div className="text-sm font-medium text-emerald-500">Pro Plan</div>
                            <div className="text-xs text-gray-500">
                                {stats?.total_authorizations || 0} / 50,000 MAA
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm flex items-center gap-2 ${
                                toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                toast.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                                "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                            }`}
                        >
                            {toast.type === "success" ? <Check className="w-4 h-4" /> :
                             toast.type === "error" ? <X className="w-4 h-4" /> :
                             <Bell className="w-4 h-4" />}
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Checkout Success Welcome Banner */}
                {showWelcome && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-8 mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Payment Successful! Welcome to AgentAuth</p>
                                <p className="text-gray-400 text-sm">Your subscription is active. Explore your dashboard to get started.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setShowWelcome(false); onDismissCheckout?.(); }}
                            className="p-2 hover:bg-white/10 rounded-lg"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </motion.div>
                )}

                {/* Header */}
                <header className="flex justify-between items-center px-8 py-5 border-b border-[#222]">
                    <h1 className="text-xl font-semibold">{pageTitles[activeNav]}</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchData}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-sm transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                        <a
                            href="/docs"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-sm transition-colors"
                        >
                            <BookOpen className="w-4 h-4" />
                            Docs
                        </a>
                        <button
                            onClick={() => setActiveNav("apikeys")}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New API Key
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {activeNav === "dashboard" && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Stats Grid */}
                                <div className="grid grid-cols-4 gap-4 mb-8">
                                    <StatCard
                                        label="Total Authorizations"
                                        value={stats?.total_authorizations?.toLocaleString() || "0"}
                                        change="+12.5% from last month"
                                        positive
                                        icon={Shield}
                                    />
                                    <StatCard
                                        label="Transaction Volume"
                                        value={formatCurrency(stats?.transaction_volume || 0)}
                                        change="+8.2% from last month"
                                        positive
                                        icon={CreditCard}
                                    />
                                    <StatCard
                                        label="Approval Rate"
                                        value={`${stats?.approval_rate || 0}%`}
                                        change="+0.3% from last month"
                                        positive
                                        icon={Shield}
                                    />
                                    <StatCard
                                        label="Avg Response Time"
                                        value={`${stats?.avg_response_time || 8.3}ms`}
                                        change="-1.2ms improvement"
                                        positive
                                        icon={Clock}
                                    />
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-4 gap-3 mb-8">
                                    <QuickAction icon={Key} title="Create API Key" description="Generate credentials" onClick={() => setActiveNav("apikeys")} />
                                    <QuickAction icon={Settings} title="Configure Policy" description="Set spending limits" onClick={() => setActiveNav("settings")} />
                                    <QuickAction icon={Webhook} title="Setup Webhook" description="Receive events" onClick={() => setActiveNav("webhooks")} />
                                    <QuickAction icon={FileText} title="View Logs" description="Audit trail" onClick={() => setActiveNav("logs")} />
                                </div>

                                {/* Usage Section */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-base font-semibold">Usage This Month</h2>
                                        <span className="text-xs text-gray-500">Resets in 7 days</span>
                                    </div>
                                    <UsageBar
                                        title="Monthly Active Agents (MAA)"
                                        used={stats?.total_authorizations || 0}
                                        total={50000}
                                        variant={(stats?.total_authorizations || 0) > 37500 ? "warning" : "normal"}
                                    />
                                    <UsageBar
                                        title="API Requests"
                                        used={847293}
                                        total={1000000}
                                        variant="danger"
                                    />
                                    <UsageBar
                                        title="Webhook Deliveries"
                                        used={12384}
                                        total={100000}
                                    />
                                </div>

                                {/* Chart */}
                                <div className="mb-8">
                                    <ActivityChart
                                        data={chartData}
                                        period={period}
                                        onPeriodChange={setPeriod}
                                    />
                                </div>

                                {/* Two Column Layout */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* API Keys */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-base font-semibold">API Keys</h2>
                                            <button onClick={() => setActiveNav("apikeys")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-xs transition-colors">
                                                + New
                                            </button>
                                        </div>
                                        <ApiKeyCard
                                            name="Production Key"
                                            createdAt="Created Jan 15, 2026"
                                            keyPreview="aa_live_****...k8Jx"
                                            isLive={true}
                                        />
                                        <ApiKeyCard
                                            name="Test Key"
                                            createdAt="Created Jan 10, 2026"
                                            keyPreview="aa_test_****...m2Pq"
                                            isLive={false}
                                        />
                                    </div>

                                    {/* Recent Transactions */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-base font-semibold">Recent Transactions</h2>
                                            <button onClick={() => setActiveNav("transactions")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-xs transition-colors">
                                                View All
                                            </button>
                                        </div>
                                        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-[#222] bg-[#0d0d0d] text-left">
                                                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats?.transactions && stats.transactions.length > 0 ? (
                                                        stats.transactions.slice(0, 5).map((tx) => (
                                                            <TransactionRow key={tx.id} tx={tx} />
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                                {isLoading ? (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                                        Loading transactions...
                                                                    </div>
                                                                ) : (
                                                                    "No transactions yet"
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Analytics Page */}
                        {activeNav === "analytics" && (
                            <motion.div
                                key="analytics"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Summary Stats */}
                                <div className="grid grid-cols-4 gap-4 mb-8">
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="text-xs text-gray-500">Approved</span>
                                        </div>
                                        <div className="text-3xl font-semibold text-white">12,847</div>
                                        <div className="text-xs text-emerald-500 mt-1">↑ 8.3% from last week</div>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <div className="flex items-center gap-2 text-red-500 mb-2">
                                            <XCircle className="w-5 h-5" />
                                            <span className="text-xs text-gray-500">Denied</span>
                                        </div>
                                        <div className="text-3xl font-semibold text-white">342</div>
                                        <div className="text-xs text-emerald-500 mt-1">↓ 12.1% from last week</div>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <div className="flex items-center gap-2 text-cyan-500 mb-2">
                                            <TrendingUp className="w-5 h-5" />
                                            <span className="text-xs text-gray-500">Approval Rate</span>
                                        </div>
                                        <div className="text-3xl font-semibold text-white">97.4%</div>
                                        <div className="text-xs text-emerald-500 mt-1">↑ 0.3% from last week</div>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <div className="flex items-center gap-2 text-purple-500 mb-2">
                                            <DollarSign className="w-5 h-5" />
                                            <span className="text-xs text-gray-500">Total Volume</span>
                                        </div>
                                        <div className="text-3xl font-semibold text-white">$847.2K</div>
                                        <div className="text-xs text-emerald-500 mt-1">↑ 15.7% from last week</div>
                                    </div>
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    {/* Authorization Trends */}
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                        <h3 className="text-sm font-medium text-white mb-4">Authorization Trends</h3>
                                        <div className="flex items-end gap-2 h-48">
                                            {[65, 78, 52, 91, 84, 73, 95, 88, 76, 82, 69, 94].map((value, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-600 rounded-t min-h-1"
                                                        style={{ height: `${value}%` }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-3 text-xs text-gray-500">
                                            <span>Jan</span>
                                            <span>Feb</span>
                                            <span>Mar</span>
                                            <span>Apr</span>
                                            <span>May</span>
                                            <span>Jun</span>
                                            <span>Jul</span>
                                            <span>Aug</span>
                                            <span>Sep</span>
                                            <span>Oct</span>
                                            <span>Nov</span>
                                            <span>Dec</span>
                                        </div>
                                    </div>

                                    {/* Volume by Category */}
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                        <h3 className="text-sm font-medium text-white mb-4">Volume by Category</h3>
                                        <div className="space-y-4">
                                            {[
                                                { name: "SaaS Subscriptions", value: 45, amount: "$381.2K" },
                                                { name: "E-commerce", value: 28, amount: "$237.2K" },
                                                { name: "Cloud Services", value: 15, amount: "$127.1K" },
                                                { name: "Travel & Transport", value: 8, amount: "$67.8K" },
                                                { name: "Other", value: 4, amount: "$33.9K" },
                                            ].map((cat, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-400">{cat.name}</span>
                                                        <span className="text-white">{cat.amount}</span>
                                                    </div>
                                                    <div className="h-2 bg-[#222] rounded overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded"
                                                            style={{ width: `${cat.value}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Merchants & Agents */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                        <h3 className="text-sm font-medium text-white mb-4">Top Merchants</h3>
                                        <div className="space-y-3">
                                            {[
                                                { name: "AWS", count: 2847, amount: "$156.2K" },
                                                { name: "Stripe", count: 1923, amount: "$89.4K" },
                                                { name: "OpenAI", count: 1456, amount: "$72.8K" },
                                                { name: "Vercel", count: 892, amount: "$44.6K" },
                                                { name: "GitHub", count: 734, amount: "$36.7K" },
                                            ].map((m, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 text-xs font-bold">
                                                            {i + 1}
                                                        </div>
                                                        <span className="text-white">{m.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white text-sm">{m.amount}</div>
                                                        <div className="text-xs text-gray-500">{m.count} txns</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                        <h3 className="text-sm font-medium text-white mb-4">Top Agents</h3>
                                        <div className="space-y-3">
                                            {[
                                                { name: "procurement-bot", count: 3421, amount: "$289.3K" },
                                                { name: "expense-agent", count: 2156, amount: "$187.2K" },
                                                { name: "travel-assistant", count: 1823, amount: "$156.8K" },
                                                { name: "subscription-mgr", count: 1245, amount: "$112.4K" },
                                                { name: "inventory-bot", count: 987, amount: "$101.5K" },
                                            ].map((a, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                                            <Bot className="w-4 h-4 text-emerald-500" />
                                                        </div>
                                                        <code className="text-cyan-400 text-sm">{a.name}</code>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white text-sm">{a.amount}</div>
                                                        <div className="text-xs text-gray-500">{a.count} txns</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Transactions Page */}
                        {activeNav === "transactions" && (
                            <motion.div
                                key="transactions"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Filters */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by transaction ID, merchant, or amount..."
                                            value={txSearch}
                                            onChange={(e) => setTxSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-[#222] rounded-lg text-white text-sm focus:outline-none focus:border-[#444]"
                                        />
                                    </div>
                                    <select
                                        value={txStatusFilter}
                                        onChange={(e) => setTxStatusFilter(e.target.value)}
                                        className="px-4 py-2.5 bg-[#111] border border-[#222] rounded-lg text-white text-sm focus:outline-none"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="authorized">Authorized</option>
                                        <option value="denied">Denied</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                    <select
                                        value={txTimeFilter}
                                        onChange={(e) => setTxTimeFilter(e.target.value)}
                                        className="px-4 py-2.5 bg-[#111] border border-[#222] rounded-lg text-white text-sm focus:outline-none"
                                    >
                                        <option value="7d">Last 7 days</option>
                                        <option value="30d">Last 30 days</option>
                                        <option value="90d">Last 90 days</option>
                                        <option value="all">All time</option>
                                    </select>
                                    <button
                                        onClick={() => handleExport("transactions")}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-[#333] rounded-lg text-sm hover:bg-white/10"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                </div>

                                {/* Transactions Table */}
                                <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#222] bg-[#0d0d0d] text-left">
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "txn_1a2b3c4d5e6f", agent: "procurement-bot", merchant: "AWS", amount: 1249.99, status: "authorized", time: "2 min ago" },
                                                { id: "txn_2b3c4d5e6f7g", agent: "expense-agent", merchant: "Stripe", amount: 499.00, status: "authorized", time: "15 min ago" },
                                                { id: "txn_3c4d5e6f7g8h", agent: "travel-assistant", merchant: "United Airlines", amount: 2847.50, status: "pending", time: "32 min ago" },
                                                { id: "txn_4d5e6f7g8h9i", agent: "procurement-bot", merchant: "Gambling Site", amount: 500.00, status: "denied", time: "1 hr ago" },
                                                { id: "txn_5e6f7g8h9i0j", agent: "subscription-mgr", merchant: "OpenAI", amount: 200.00, status: "authorized", time: "2 hr ago" },
                                                { id: "txn_6f7g8h9i0j1k", agent: "inventory-bot", merchant: "Shopify", amount: 79.00, status: "authorized", time: "3 hr ago" },
                                                { id: "txn_7g8h9i0j1k2l", agent: "expense-agent", merchant: "GitHub", amount: 44.00, status: "authorized", time: "5 hr ago" },
                                                { id: "txn_8h9i0j1k2l3m", agent: "travel-assistant", merchant: "Marriott", amount: 892.00, status: "authorized", time: "6 hr ago" },
                                            ].map((tx, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                    <td className="py-3.5 px-4">
                                                        <code className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{tx.id}</code>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <code className="text-cyan-400 text-sm">{tx.agent}</code>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-white text-sm">{tx.merchant}</td>
                                                    <td className="py-3.5 px-4 text-white font-medium">${tx.amount.toFixed(2)}</td>
                                                    <td className="py-3.5 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            tx.status === "authorized" ? "bg-emerald-500/10 text-emerald-500" :
                                                            tx.status === "denied" ? "bg-red-500/10 text-red-500" :
                                                            "bg-yellow-500/10 text-yellow-500"
                                                        }`}>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-gray-500 text-sm">{tx.time}</td>
                                                    <td className="py-3.5 px-4">
                                                        <button
                                                            onClick={() => showToast(`Transaction ${tx.id} details`, "info")}
                                                            className="p-2 hover:bg-white/5 rounded-lg"
                                                        >
                                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-gray-500">Showing {(txPage - 1) * 8 + 1}-{Math.min(txPage * 8, 12847)} of 12,847 transactions</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setTxPage(p => Math.max(1, p - 1))}
                                            disabled={txPage === 1}
                                            className="px-3 py-1.5 bg-white/5 border border-[#333] rounded-lg text-sm hover:bg-white/10 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        {[1, 2, 3].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setTxPage(p)}
                                                className={`px-3 py-1.5 border rounded-lg text-sm ${txPage === p ? "bg-white/10 border-[#444]" : "bg-white/5 border-[#333] hover:bg-white/10"}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                        <span className="px-2 py-1.5 text-gray-500">...</span>
                                        <button
                                            onClick={() => setTxPage(1606)}
                                            className={`px-3 py-1.5 border rounded-lg text-sm ${txPage === 1606 ? "bg-white/10 border-[#444]" : "bg-white/5 border-[#333] hover:bg-white/10"}`}
                                        >
                                            1606
                                        </button>
                                        <button
                                            onClick={() => setTxPage(p => Math.min(1606, p + 1))}
                                            disabled={txPage === 1606}
                                            className="px-3 py-1.5 bg-white/5 border border-[#333] rounded-lg text-sm hover:bg-white/10 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Consents Page */}
                        {activeNav === "consents" && (
                            <motion.div
                                key="consents"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="text-xs text-gray-500">Active Consents</span>
                                        </div>
                                        <div className="text-3xl font-semibold text-white">24</div>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <div className="flex items-center gap-2 text-yellow-500 mb-2">
                                            <Clock className="w-5 h-5" />
                                            <span className="text-xs text-gray-500">Pending Approval</span>
                                        </div>
                                        <div className="text-3xl font-semibold text-white">3</div>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                                            <XCircle className="w-5 h-5" />
                                            <span className="text-xs text-gray-500">Expired</span>
                                        </div>
                                        <div className="text-3xl font-semibold text-white">7</div>
                                    </div>
                                </div>

                                {/* Pending Approvals */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                        Pending Approval
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { agent: "travel-assistant", scope: "Book flights up to $3,000", requested: "10 min ago" },
                                            { agent: "procurement-bot", scope: "Access new vendor: Dell Technologies", requested: "2 hr ago" },
                                            { agent: "expense-agent", scope: "Increase daily limit to $5,000", requested: "1 day ago" },
                                        ].map((consent, i) => (
                                            <div key={i} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                                        <Bot className="w-5 h-5 text-yellow-500" />
                                                    </div>
                                                    <div>
                                                        <code className="text-cyan-400 text-sm">{consent.agent}</code>
                                                        <p className="text-white text-sm mt-0.5">{consent.scope}</p>
                                                        <p className="text-xs text-gray-500">Requested {consent.requested}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleConsentAction(consent.agent, "deny")}
                                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm"
                                                    >
                                                        Deny
                                                    </button>
                                                    <button
                                                        onClick={() => handleConsentAction(consent.agent, "approve")}
                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Consents */}
                                <div>
                                    <h3 className="text-sm font-medium text-white mb-4">Active Consents</h3>
                                    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#222] bg-[#0d0d0d] text-left">
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Granted</th>
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { agent: "procurement-bot", scope: "Purchase SaaS subscriptions up to $500/mo", granted: "Jan 1, 2026", expires: "Dec 31, 2026", status: "active" },
                                                    { agent: "expense-agent", scope: "Submit expense reports up to $1,000", granted: "Jan 5, 2026", expires: "Mar 5, 2026", status: "active" },
                                                    { agent: "travel-assistant", scope: "Book hotels under $300/night", granted: "Jan 10, 2026", expires: "Apr 10, 2026", status: "active" },
                                                    { agent: "subscription-mgr", scope: "Manage recurring payments", granted: "Dec 15, 2025", expires: "Jun 15, 2026", status: "active" },
                                                    { agent: "inventory-bot", scope: "Reorder supplies under $200", granted: "Jan 20, 2026", expires: "Jul 20, 2026", status: "active" },
                                                ].map((c, i) => (
                                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                        <td className="py-3.5 px-4">
                                                            <code className="text-cyan-400 text-sm">{c.agent}</code>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-white text-sm">{c.scope}</td>
                                                        <td className="py-3.5 px-4 text-gray-500 text-sm">{c.granted}</td>
                                                        <td className="py-3.5 px-4 text-gray-500 text-sm">{c.expires}</td>
                                                        <td className="py-3.5 px-4">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <button
                                                                onClick={() => handleRevokeConsent(c.agent)}
                                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs"
                                                            >
                                                                Revoke
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Agents Page */}
                        {activeNav === "agents" && (
                            <motion.div
                                key="agents"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Search agents..."
                                                value={agentSearch}
                                                onChange={(e) => setAgentSearch(e.target.value)}
                                                className="pl-10 pr-4 py-2.5 bg-[#111] border border-[#222] rounded-lg text-white text-sm focus:outline-none focus:border-[#444] w-64"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => showToast("Agent registration form coming soon!", "info")}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Register Agent
                                    </button>
                                </div>

                                {/* Agents Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { name: "procurement-bot", status: "active", lastActive: "2 min ago", transactions: 3421, volume: "$289.3K", approvalRate: 98.2 },
                                        { name: "expense-agent", status: "active", lastActive: "15 min ago", transactions: 2156, volume: "$187.2K", approvalRate: 97.8 },
                                        { name: "travel-assistant", status: "active", lastActive: "32 min ago", transactions: 1823, volume: "$156.8K", approvalRate: 96.5 },
                                        { name: "subscription-mgr", status: "active", lastActive: "1 hr ago", transactions: 1245, volume: "$112.4K", approvalRate: 99.1 },
                                        { name: "inventory-bot", status: "inactive", lastActive: "2 days ago", transactions: 987, volume: "$101.5K", approvalRate: 97.3 },
                                        { name: "analytics-agent", status: "active", lastActive: "5 min ago", transactions: 456, volume: "$45.2K", approvalRate: 100 },
                                    ].map((agent, i) => (
                                        <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.status === "active" ? "bg-emerald-500/10" : "bg-gray-500/10"}`}>
                                                        <Bot className={`w-5 h-5 ${agent.status === "active" ? "text-emerald-500" : "text-gray-500"}`} />
                                                    </div>
                                                    <div>
                                                        <code className="text-cyan-400">{agent.name}</code>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`inline-flex items-center gap-1 text-xs ${agent.status === "active" ? "text-emerald-500" : "text-gray-500"}`}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                                {agent.status === "active" ? "Active" : "Inactive"}
                                                            </span>
                                                            <span className="text-xs text-gray-500">• Last active {agent.lastActive}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => showToast(`Agent "${agent.name}" options: Configure, Deactivate, View Logs`, "info")}
                                                    className="p-2 hover:bg-white/5 rounded-lg"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Transactions</p>
                                                    <p className="text-white font-medium">{agent.transactions.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Volume</p>
                                                    <p className="text-white font-medium">{agent.volume}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Approval Rate</p>
                                                    <p className="text-emerald-500 font-medium">{agent.approvalRate}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Audit Logs Page */}
                        {activeNav === "logs" && (
                            <motion.div
                                key="logs"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Filters */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search logs..."
                                            value={logSearch}
                                            onChange={(e) => setLogSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-[#222] rounded-lg text-white text-sm focus:outline-none focus:border-[#444]"
                                        />
                                    </div>
                                    <select
                                        value={logEventFilter}
                                        onChange={(e) => setLogEventFilter(e.target.value)}
                                        className="px-4 py-2.5 bg-[#111] border border-[#222] rounded-lg text-white text-sm focus:outline-none"
                                    >
                                        <option value="all">All Events</option>
                                        <option value="authorization">Authorization</option>
                                        <option value="config">Configuration</option>
                                        <option value="security">Security</option>
                                        <option value="api">API</option>
                                    </select>
                                    <select
                                        value={logTimeFilter}
                                        onChange={(e) => setLogTimeFilter(e.target.value)}
                                        className="px-4 py-2.5 bg-[#111] border border-[#222] rounded-lg text-white text-sm focus:outline-none"
                                    >
                                        <option value="24h">Last 24 hours</option>
                                        <option value="7d">Last 7 days</option>
                                        <option value="30d">Last 30 days</option>
                                    </select>
                                    <button
                                        onClick={() => handleExport("audit logs")}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-[#333] rounded-lg text-sm hover:bg-white/10"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                </div>

                                {/* Logs Timeline */}
                                <div className="space-y-2">
                                    {[
                                        { type: "authorization", icon: Shield, color: "emerald", title: "Transaction authorized", details: "procurement-bot authorized $1,249.99 at AWS", time: "2 min ago" },
                                        { type: "authorization", icon: Shield, color: "emerald", title: "Transaction authorized", details: "expense-agent authorized $499.00 at Stripe", time: "15 min ago" },
                                        { type: "authorization", icon: Clock, color: "yellow", title: "Transaction pending approval", details: "travel-assistant requested $2,847.50 at United Airlines", time: "32 min ago" },
                                        { type: "authorization", icon: XCircle, color: "red", title: "Transaction denied", details: "procurement-bot blocked - Gambling Site not allowed", time: "1 hr ago" },
                                        { type: "config", icon: Settings, color: "purple", title: "Settings updated", details: "Daily spending limit changed to $5,000", time: "2 hr ago" },
                                        { type: "api", icon: Key, color: "cyan", title: "API key created", details: "New test API key generated: aa_test_****m2Pq", time: "3 hr ago" },
                                        { type: "security", icon: Lock, color: "orange", title: "Login detected", details: "Admin login from 192.168.1.1 (San Francisco, US)", time: "5 hr ago" },
                                        { type: "config", icon: Webhook, color: "purple", title: "Webhook configured", details: "Added endpoint: https://api.example.com/webhooks", time: "1 day ago" },
                                        { type: "authorization", icon: Shield, color: "emerald", title: "Consent granted", details: "subscription-mgr granted access to manage recurring payments", time: "1 day ago" },
                                        { type: "security", icon: UserPlus, color: "blue", title: "Team member added", details: "sarah@company.com invited as Admin", time: "2 days ago" },
                                    ].map((log, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 bg-[#111] border border-[#222] rounded-xl hover:bg-white/[0.02]">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorBgMap[log.color] || "bg-gray-500/10"}`}>
                                                <log.icon className={`w-5 h-5 ${colorTextMap[log.color] || "text-gray-500"}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-medium text-sm">{log.title}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${colorBgMap[log.color] || "bg-gray-500/10"} ${colorTextMap[log.color] || "text-gray-500"}`}>
                                                        {log.type}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm mt-0.5">{log.details}</p>
                                            </div>
                                            <span className="text-xs text-gray-500">{log.time}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More */}
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => setVisibleLogs(prev => prev + 10)}
                                        className="px-6 py-2.5 bg-white/5 border border-[#333] rounded-lg text-sm hover:bg-white/10"
                                    >
                                        Load More
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* API Keys Page */}
                        {activeNav === "apikeys" && (
                            <motion.div
                                key="apikeys"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Info Banner */}
                                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-cyan-500 mt-0.5" />
                                    <div>
                                        <p className="text-white text-sm font-medium">Keep your API keys secure</p>
                                        <p className="text-gray-400 text-sm mt-0.5">Never share your API keys in public repositories or client-side code. Use environment variables instead.</p>
                                    </div>
                                </div>

                                {/* Create Key Section */}
                                <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6">
                                    <h3 className="text-white font-medium mb-4">Create New API Key</h3>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="Key name (e.g., Production, Staging)"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            className="flex-1 px-4 py-2.5 bg-white/5 border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-[#444]"
                                        />
                                        <select
                                            value={newKeyType}
                                            onChange={(e) => setNewKeyType(e.target.value as "live" | "test")}
                                            className="px-4 py-2.5 bg-white/5 border border-[#333] rounded-lg text-white text-sm focus:outline-none"
                                        >
                                            <option value="live">Live Key</option>
                                            <option value="test">Test Key</option>
                                        </select>
                                        <button
                                            onClick={handleCreateKey}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create Key
                                        </button>
                                    </div>
                                </div>

                                {/* Keys List */}
                                <div className="space-y-3">
                                    {[
                                        { name: "Production Key", key: "aa_live_sk_1a2b3c4d5e6f7g8h9i0j", created: "Jan 15, 2026", lastUsed: "2 min ago", isLive: true },
                                        { name: "Staging Key", key: "aa_live_sk_2b3c4d5e6f7g8h9i0j1k", created: "Jan 12, 2026", lastUsed: "1 hr ago", isLive: true },
                                        { name: "Test Key", key: "aa_test_sk_3c4d5e6f7g8h9i0j1k2l", created: "Jan 10, 2026", lastUsed: "3 days ago", isLive: false },
                                        { name: "Development Key", key: "aa_test_sk_4d5e6f7g8h9i0j1k2l3m", created: "Jan 8, 2026", lastUsed: "1 week ago", isLive: false },
                                    ].map((apiKey, i) => (
                                        <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${apiKey.isLive ? "bg-emerald-500/10" : "bg-gray-500/10"}`}>
                                                        <Key className={`w-5 h-5 ${apiKey.isLive ? "text-emerald-500" : "text-gray-500"}`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-medium">{apiKey.name}</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${apiKey.isLive ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"}`}>
                                                                {apiKey.isLive ? "Live" : "Test"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <code className="text-sm text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                                                {apiKey.key.substring(0, 12)}...{apiKey.key.substring(apiKey.key.length - 4)}
                                                            </code>
                                                            <span className="text-xs text-gray-500">Created {apiKey.created}</span>
                                                            <span className="text-xs text-gray-500">• Last used {apiKey.lastUsed}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(apiKey.key)}
                                                        className="p-2.5 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg"
                                                        title="Copy key"
                                                    >
                                                        <Copy className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => showToast(`Full key: ${apiKey.key}`, "info")}
                                                        className="p-2.5 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg"
                                                        title="Reveal key"
                                                    >
                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteKey(apiKey.name)}
                                                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg"
                                                        title="Delete key"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Webhooks Page */}
                        {activeNav === "webhooks" && (
                            <motion.div
                                key="webhooks"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Add Webhook Section */}
                                <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6">
                                    <h3 className="text-white font-medium mb-4">Add Webhook Endpoint</h3>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="https://your-server.com/webhooks/agentauth"
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                            className="flex-1 px-4 py-2.5 bg-white/5 border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-[#444]"
                                        />
                                        <button
                                            onClick={handleAddWebhook}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Endpoint
                                        </button>
                                    </div>
                                </div>

                                {/* Webhooks List */}
                                <div className="space-y-4">
                                    {[
                                        { url: "https://api.company.com/webhooks/agentauth", events: ["authorization.created", "authorization.denied"], status: "active", successRate: 99.8 },
                                        { url: "https://slack.company.com/hooks/notify", events: ["authorization.denied", "consent.requested"], status: "active", successRate: 100 },
                                        { url: "https://analytics.company.com/events", events: ["all"], status: "failing", successRate: 85.2 },
                                    ].map((webhook, i) => (
                                        <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${webhook.status === "active" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                                        <Webhook className={`w-5 h-5 ${webhook.status === "active" ? "text-emerald-500" : "text-red-500"}`} />
                                                    </div>
                                                    <div>
                                                        <code className="text-cyan-400 text-sm">{webhook.url}</code>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`inline-flex items-center gap-1 text-xs ${webhook.status === "active" ? "text-emerald-500" : "text-red-500"}`}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                                {webhook.status === "active" ? "Healthy" : "Failing"}
                                                            </span>
                                                            <span className="text-xs text-gray-500">• {webhook.successRate}% success rate</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleTestWebhook(webhook.url)}
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-xs"
                                                    >
                                                        <Send className="w-3.5 h-3.5 inline mr-1" />
                                                        Test
                                                    </button>
                                                    <button
                                                        onClick={() => showToast(`Editing webhook: ${webhook.url}`, "info")}
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteWebhook(webhook.url)}
                                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">Subscribed Events</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {webhook.events.map((event, j) => (
                                                        <span key={j} className="px-2.5 py-1 bg-white/5 rounded-lg text-xs text-gray-400">
                                                            {event}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Event Types Reference */}
                                <div className="mt-8">
                                    <h3 className="text-white font-medium mb-4">Available Event Types</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            "authorization.created", "authorization.denied", "authorization.pending",
                                            "consent.requested", "consent.granted", "consent.revoked",
                                            "agent.registered", "agent.updated", "agent.deactivated",
                                        ].map((event, i) => (
                                            <div key={i} className="px-4 py-3 bg-[#111] border border-[#222] rounded-lg">
                                                <code className="text-cyan-400 text-sm">{event}</code>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Team Page */}
                        {activeNav === "team" && (
                            <motion.div
                                key="team"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Invite Section */}
                                <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6">
                                    <h3 className="text-white font-medium mb-4">Invite Team Member</h3>
                                    <div className="flex gap-4">
                                        <input
                                            type="email"
                                            placeholder="colleague@company.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="flex-1 px-4 py-2.5 bg-white/5 border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-[#444]"
                                        />
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value)}
                                            className="px-4 py-2.5 bg-white/5 border border-[#333] rounded-lg text-white text-sm focus:outline-none"
                                        >
                                            <option>Admin</option>
                                            <option>Developer</option>
                                            <option>Viewer</option>
                                        </select>
                                        <button
                                            onClick={handleInvite}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-medium"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Send Invite
                                        </button>
                                    </div>
                                </div>

                                {/* Team Members */}
                                <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#222] bg-[#0d0d0d] text-left">
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { name: "John Doe", email: "john@company.com", role: "Owner", status: "active", lastActive: "Now", isOwner: true },
                                                { name: "Sarah Chen", email: "sarah@company.com", role: "Admin", status: "active", lastActive: "2 hr ago", isOwner: false },
                                                { name: "Mike Wilson", email: "mike@company.com", role: "Developer", status: "active", lastActive: "1 day ago", isOwner: false },
                                                { name: "Emily Brown", email: "emily@company.com", role: "Viewer", status: "pending", lastActive: "Invited 3 days ago", isOwner: false },
                                            ].map((member, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                                {member.name.split(" ").map(n => n[0]).join("")}
                                                            </div>
                                                            <div>
                                                                <div className="text-white text-sm font-medium flex items-center gap-2">
                                                                    {member.name}
                                                                    {member.isOwner && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                                                                </div>
                                                                <div className="text-gray-500 text-xs">{member.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                                                            member.role === "Owner" ? "bg-yellow-500/10 text-yellow-500" :
                                                            member.role === "Admin" ? "bg-purple-500/10 text-purple-500" :
                                                            member.role === "Developer" ? "bg-cyan-500/10 text-cyan-500" :
                                                            "bg-gray-500/10 text-gray-500"
                                                        }`}>
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 text-xs ${member.status === "active" ? "text-emerald-500" : "text-yellow-500"}`}>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                            {member.status === "active" ? "Active" : "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-500 text-sm">{member.lastActive}</td>
                                                    <td className="py-4 px-4">
                                                        {!member.isOwner && (
                                                            <button
                                                                onClick={() => showToast(`Options for ${member.name}: Change Role, Remove`, "info")}
                                                                className="p-2 hover:bg-white/5 rounded-lg"
                                                            >
                                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* Billing Page */}
                        {activeNav === "billing" && (
                            <motion.div
                                key="billing"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Current Plan */}
                                <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Package className="w-5 h-5 text-emerald-500" />
                                                <span className="text-white font-semibold text-lg">Pro Plan</span>
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-xs rounded">Active</span>
                                            </div>
                                            <p className="text-gray-400 text-sm">50,000 MAA • Unlimited API calls • Priority support</p>
                                            <p className="text-gray-500 text-xs mt-2">Next billing date: February 1, 2026</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-white">$199</div>
                                            <div className="text-gray-500 text-sm">/month</div>
                                            <button
                                                onClick={handleUpgradePlan}
                                                className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm"
                                            >
                                                Upgrade Plan
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage This Period */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <p className="text-xs text-gray-500 mb-2">Monthly Active Agents</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-semibold text-white">12,847</span>
                                            <span className="text-gray-500 text-sm mb-1">/ 50,000</span>
                                        </div>
                                        <div className="mt-3 h-2 bg-[#222] rounded overflow-hidden">
                                            <div className="h-full w-[26%] bg-gradient-to-r from-emerald-500 to-cyan-500 rounded" />
                                        </div>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <p className="text-xs text-gray-500 mb-2">API Requests</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-semibold text-white">847K</span>
                                            <span className="text-gray-500 text-sm mb-1">/ unlimited</span>
                                        </div>
                                        <div className="mt-3 h-2 bg-[#222] rounded overflow-hidden">
                                            <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded" />
                                        </div>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                                        <p className="text-xs text-gray-500 mb-2">Transaction Volume</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-semibold text-white">$847.2K</span>
                                        </div>
                                        <p className="text-xs text-emerald-500 mt-2">↑ 15.7% from last month</p>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="mb-8">
                                    <h3 className="text-white font-medium mb-4">Payment Method</h3>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                                                VISA
                                            </div>
                                            <div>
                                                <p className="text-white text-sm">Visa ending in 4242</p>
                                                <p className="text-gray-500 text-xs">Expires 12/2028</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUpdatePayment}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-sm"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>

                                {/* Invoices */}
                                <div>
                                    <h3 className="text-white font-medium mb-4">Recent Invoices</h3>
                                    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#222] bg-[#0d0d0d] text-left">
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$199.00", status: "paid" },
                                                    { id: "INV-2025-012", date: "Dec 1, 2025", amount: "$199.00", status: "paid" },
                                                    { id: "INV-2025-011", date: "Nov 1, 2025", amount: "$199.00", status: "paid" },
                                                    { id: "INV-2025-010", date: "Oct 1, 2025", amount: "$199.00", status: "paid" },
                                                ].map((invoice, i) => (
                                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Receipt className="w-4 h-4 text-gray-500" />
                                                                <span className="text-white text-sm">{invoice.id}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-gray-500 text-sm">{invoice.date}</td>
                                                        <td className="py-3.5 px-4 text-white font-medium">{invoice.amount}</td>
                                                        <td className="py-3.5 px-4">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Paid
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <button
                                                                onClick={() => handleExport(`invoice ${invoice.id}`)}
                                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-xs"
                                                            >
                                                                <Download className="w-3.5 h-3.5 inline mr-1" />
                                                                PDF
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Settings Page */}
                        {activeNav === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Account Settings */}
                                <div className="mb-8">
                                    <h3 className="text-white font-medium mb-4">Account Settings</h3>
                                    <div className="bg-[#111] border border-[#222] rounded-xl divide-y divide-[#222]">
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-sm">Organization Name</p>
                                                <p className="text-gray-500 text-xs mt-0.5">Your company or project name</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-400 text-sm">Acme Corporation</span>
                                                <button
                                                    onClick={() => handleEditSetting("Organization Name")}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-xs"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-sm">Organization URL</p>
                                                <p className="text-gray-500 text-xs mt-0.5">Your unique AgentAuth URL</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <code className="text-cyan-400 text-sm">acme.agentauth.in</code>
                                                <button
                                                    onClick={() => handleEditSetting("Organization URL")}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#333] rounded-lg text-xs"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-sm">Timezone</p>
                                                <p className="text-gray-500 text-xs mt-0.5">Used for reports and analytics</p>
                                            </div>
                                            <select className="px-3 py-1.5 bg-white/5 border border-[#333] rounded-lg text-sm text-white focus:outline-none">
                                                <option>UTC</option>
                                                <option>America/New_York</option>
                                                <option>America/Los_Angeles</option>
                                                <option>Europe/London</option>
                                                <option>Asia/Tokyo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Authorization Settings */}
                                <div className="mb-8">
                                    <h3 className="text-white font-medium mb-4">Authorization Settings</h3>
                                    <div className="bg-[#111] border border-[#222] rounded-xl divide-y divide-[#222]">
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-sm">Default Daily Limit</p>
                                                <p className="text-gray-500 text-xs mt-0.5">Maximum spending per agent per day</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">$</span>
                                                <input type="number" defaultValue="1000" className="w-24 px-3 py-1.5 bg-white/5 border border-[#333] rounded-lg text-white text-sm text-right focus:outline-none" />
                                            </div>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-sm">Default Monthly Limit</p>
                                                <p className="text-gray-500 text-xs mt-0.5">Maximum spending per agent per month</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">$</span>
                                                <input type="number" defaultValue="10000" className="w-24 px-3 py-1.5 bg-white/5 border border-[#333] rounded-lg text-white text-sm text-right focus:outline-none" />
                                            </div>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-sm">Require Approval Above</p>
                                                <p className="text-gray-500 text-xs mt-0.5">Transactions above this amount need manual approval</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">$</span>
                                                <input type="number" defaultValue="500" className="w-24 px-3 py-1.5 bg-white/5 border border-[#333] rounded-lg text-white text-sm text-right focus:outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="mb-8">
                                    <h3 className="text-white font-medium mb-4">Notifications</h3>
                                    <div className="bg-[#111] border border-[#222] rounded-xl divide-y divide-[#222]">
                                        {[
                                            { title: "Transaction Alerts", desc: "Get notified for denied transactions" },
                                            { title: "Consent Requests", desc: "Notify when agents request new permissions" },
                                            { title: "Weekly Reports", desc: "Receive weekly analytics summary" },
                                            { title: "Security Alerts", desc: "Important security notifications" },
                                        ].map((setting, i) => (
                                            <div key={i} className="p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white text-sm">{setting.title}</p>
                                                    <p className="text-gray-500 text-xs mt-0.5">{setting.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleNotification(i)}
                                                    className={`w-11 h-6 rounded-full transition-colors ${notifications[i] ? "bg-emerald-500" : "bg-[#333]"}`}
                                                >
                                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications[i] ? "translate-x-5" : "translate-x-0.5"}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div>
                                    <h3 className="text-red-500 font-medium mb-4">Danger Zone</h3>
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-sm">Delete Organization</p>
                                                <p className="text-gray-500 text-xs mt-0.5">Permanently delete your organization and all data</p>
                                            </div>
                                            <button
                                                onClick={handleDeleteOrg}
                                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm"
                                            >
                                                Delete Organization
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
