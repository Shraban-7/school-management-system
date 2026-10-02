import React from 'react';
import {
    Activity,
    AlertCircle,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Award,
    Bell,
    BookOpen,
    Briefcase,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    Cog,
    CreditCard,
    Database,
    Download,
    EllipsisVertical,
    Eye,
    EyeOff,
    FileText,
    Filter,
    Globe,
    GraduationCap,
    Home,
    Key,
    Layers,
    LayoutGrid,
    List,
    Lock,
    LogOut,
    Mail,
    Megaphone,
    Menu,
    Moon,
    PanelLeft,
    Phone,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Send,
    Server,
    Settings,
    Shield,
    Sparkles,
    Sun,
    Trash2,
    TrendingDown,
    TrendingUp,
    User,
    Users,
    Wallet,
    Wifi,
    WifiOff,
    X,
    type LucideProps,
} from 'lucide-react';

export type IconName =
    | 'home'
    | 'user'
    | 'users'
    | 'cog'
    | 'logout'
    | 'search'
    | 'bell'
    | 'sun'
    | 'moon'
    | 'menu'
    | 'close'
    | 'chevron-left'
    | 'chevron-right'
    | 'chevron-down'
    | 'chevron-up'
    | 'check'
    | 'plus'
    | 'pencil'
    | 'trash'
    | 'filter'
    | 'download'
    | 'activity'
    | 'shield'
    | 'settings'
    | 'grid'
    | 'list'
    | 'eye'
    | 'eye-off'
    | 'arrow-up'
    | 'arrow-down'
    | 'arrow-right'
    | 'arrow-left'
    | 'dots-vertical'
    | 'mail'
    | 'phone'
    | 'calendar'
    | 'clock'
    | 'sparkles'
    | 'trend-up'
    | 'trend-down'
    | 'database'
    | 'server'
    | 'globe'
    | 'key'
    | 'lock'
    | 'book-open'
    | 'graduation-cap'
    | 'briefcase'
    | 'megaphone'
    | 'wallet'
    | 'panel-left'
    | 'credit-card'
    | 'file-text'
    | 'check-circle'
    | 'alert-circle'
    | 'refresh'
    | 'send'
    | 'award'
    | 'layers'
    | 'wifi'
    | 'wifi-off';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
    home: Home,
    user: User,
    users: Users,
    cog: Cog,
    logout: LogOut,
    search: Search,
    bell: Bell,
    sun: Sun,
    moon: Moon,
    menu: Menu,
    close: X,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'chevron-down': ChevronDown,
    'chevron-up': ChevronUp,
    check: Check,
    plus: Plus,
    pencil: Pencil,
    trash: Trash2,
    filter: Filter,
    download: Download,
    activity: Activity,
    shield: Shield,
    settings: Settings,
    grid: LayoutGrid,
    list: List,
    eye: Eye,
    'eye-off': EyeOff,
    'arrow-up': ArrowUp,
    'arrow-down': ArrowDown,
    'arrow-right': ArrowRight,
    'arrow-left': ArrowLeft,
    'dots-vertical': EllipsisVertical,
    mail: Mail,
    phone: Phone,
    calendar: Calendar,
    clock: Clock,
    sparkles: Sparkles,
    'trend-up': TrendingUp,
    'trend-down': TrendingDown,
    database: Database,
    server: Server,
    globe: Globe,
    key: Key,
    lock: Lock,
    'book-open': BookOpen,
    'graduation-cap': GraduationCap,
    briefcase: Briefcase,
    megaphone: Megaphone,
    wallet: Wallet,
    'panel-left': PanelLeft,
    'credit-card': CreditCard,
    'file-text': FileText,
    'check-circle': CheckCircle2,
    'alert-circle': AlertCircle,
    refresh: RefreshCw,
    send: Send,
    award: Award,
    layers: Layers,
    wifi: Wifi,
    'wifi-off': WifiOff,
};

interface AppIconProps {
    name: string;
    className?: string;
    class?: string;
}

export default function AppIcon({ name, className, class: classProp }: AppIconProps) {
    const Component = iconMap[name] || LayoutGrid;
    return (
        <Component
            className={className || classProp || 'h-5 w-5'}
            strokeWidth={1.8}
            aria-hidden="true"
        />
    );
}
