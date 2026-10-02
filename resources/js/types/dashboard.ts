export type StatStatus = 'ok' | 'warn' | 'down' | 'good' | 'bad' | 'neutral';
export type StatTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';

export interface Stat {
    label: string;
    value: string | number;
    icon?: string;
    trend?: number;
    trendLabel?: string;
    tone?: StatTone;
    href?: string;
    status?: StatStatus;
}

export interface StatCard {
    title?: string;
    items: Stat[];
}

export interface AttendanceSummary {
    marked_today: number;
    total_students: number;
    present: number;
    absent: number;
    late: number;
    rate: number;
    date_formatted: string;
}

export interface FinanceSummary {
    total_invoiced: number;
    total_collected: number;
    total_due: number;
    collection_rate: number;
    currency: string;
}

export interface UpcomingExamItem {
    id: number;
    name: string;
    session: string;
    start_date: string | null;
    end_date: string | null;
    is_published: boolean;
    status: 'Ongoing' | 'Upcoming' | 'Completed';
}

export interface NoticeItem {
    id: number;
    title: string;
    slug: string;
    time: string;
    date: string;
}

export interface ZktecoDeviceItem {
    id: number;
    device_name: string;
    ip_address: string;
    port: number;
    status: string;
    is_enabled: boolean;
    last_sync_at: string;
}

export interface ZktecoSummary {
    total: number;
    online: number;
    offline: number;
    devices: ZktecoDeviceItem[];
}

export interface CommunicationSummary {
    sms_sent: number;
    email_sent: number;
    total: number;
}

export interface SchoolInfo {
    name: string;
    name_bn?: string;
    eiin?: string | number;
    session?: string;
    logo_url?: string | null;
}

