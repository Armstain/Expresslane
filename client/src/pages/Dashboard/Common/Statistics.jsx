import { useState } from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';
import { useQueries } from '@tanstack/react-query';
import { BarChart3, CheckCircle2, Clock, Package, Table2, Users } from 'lucide-react';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useTheme } from '@/components/theme-provider.jsx';
import { formatDate } from '@/api/utils/dateUtils.js';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/Shared/EmptyState.jsx';
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx';
import PageHeader from '@/components/Shared/PageHeader.jsx';
import StatCard from '@/components/Shared/StatCard.jsx';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Series colors match --chart-1 / --chart-2 (validated for CVD separation and contrast in both modes)
const PALETTE = {
    light: { series: ['#5144e4', '#0f9468'], text: '#5f6676', grid: '#e3e6ee' },
    dark: { series: ['#7468f3', '#199e70'], text: '#9aa1b2', grid: '#262a37' },
};

const dayKey = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const ChartCard = ({ title, description, legend, chart, table }) => {
    const [view, setView] = useState('chart');
    return (
        <Card className='p-5 sm:p-6'>
            <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
                <div>
                    <h2 className='font-semibold'>{title}</h2>
                    {description && <p className='text-sm text-muted-foreground'>{description}</p>}
                </div>
                <div className='flex rounded-lg border p-0.5' role='group' aria-label={`${title} view`}>
                    {[
                        { id: 'chart', icon: BarChart3, label: 'Chart' },
                        { id: 'table', icon: Table2, label: 'Table' },
                    ].map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setView(id)}
                            aria-pressed={view === id}
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                view === id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className='h-3.5 w-3.5' /> {label}
                        </button>
                    ))}
                </div>
            </div>
            {legend}
            {view === 'chart' ? chart : <div className='max-h-[320px] overflow-y-auto rounded-lg border'>{table}</div>}
        </Card>
    );
};

ChartCard.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    legend: PropTypes.node,
    chart: PropTypes.node,
    table: PropTypes.node,
};

const Statistics = () => {
    const axiosSecure = useAxiosSecure();
    const { theme } = useTheme();
    const colors = PALETTE[theme === 'dark' ? 'dark' : 'light'];
    const get = (url) => async () => (await axiosSecure.get(url)).data;

    const [statsQ, bookingsQ, parcelsQ] = useQueries({
        queries: [
            { queryKey: ['statistics'], queryFn: get('/statistics') },
            { queryKey: ['bookingsByDate'], queryFn: get('/bookingsByDate') },
            { queryKey: ['parcels'], queryFn: get('/parcels') },
        ],
    });

    if (statsQ.isLoading || bookingsQ.isLoading || parcelsQ.isLoading) return <LoadingSpinner />;

    if (bookingsQ.isError || parcelsQ.isError) {
        return (
            <>
                <PageHeader title='Statistics' />
                <Card>
                    <EmptyState icon={BarChart3} title='Could not load statistics' description='Please refresh the page to try again.' />
                </Card>
            </>
        );
    }

    const parcels = parcelsQ.data || [];
    const bookings = (bookingsQ.data || [])
        .filter((b) => b._id)
        .map((b) => ({ date: b._id, count: b.count }));

    // Booked vs delivered, bucketed by requested date
    const byDate = {};
    parcels.forEach((p) => {
        const key = dayKey(p.deliveryDate);
        if (!key) return;
        byDate[key] ??= { booked: 0, delivered: 0 };
        byDate[key].booked += 1;
        if (p.status === 'delivered') byDate[key].delivered += 1;
    });
    const trend = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v }));

    const delivered = parcels.filter((p) => p.status === 'delivered').length;
    const pending = parcels.filter((p) => p.status === 'pending').length;

    const baseOptions = {
        chart: {
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            foreColor: colors.text,
            background: 'transparent',
        },
        theme: { mode: theme === 'dark' ? 'dark' : 'light' },
        grid: { borderColor: colors.grid, strokeDashArray: 4, xaxis: { lines: { show: false } } },
        xaxis: {
            type: 'datetime',
            axisBorder: { color: colors.grid },
            axisTicks: { color: colors.grid },
            labels: { datetimeUTC: false },
        },
        yaxis: { labels: { formatter: (v) => Math.round(v) }, min: 0, forceNiceScale: true },
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: { x: { format: 'dd MMM yyyy' } },
    };

    const barOptions = {
        ...baseOptions,
        colors: [colors.series[0]],
        fill: { opacity: 1 },
        plotOptions: {
            bar: { columnWidth: '45%', borderRadius: 4, borderRadiusApplication: 'end' },
        },
        states: { hover: { filter: { type: 'darken', value: 0.9 } } },
    };

    const lineOptions = {
        ...baseOptions,
        colors: colors.series,
        stroke: { width: 2, curve: 'straight' },
        markers: { size: 4, hover: { size: 6 }, strokeColors: theme === 'dark' ? '#14161f' : '#ffffff', strokeWidth: 2 },
        tooltip: { ...baseOptions.tooltip, shared: true, intersect: false },
    };

    const toPoints = (rows, key) => rows.map((r) => ({ x: new Date(r.date).getTime(), y: r[key] }));

    return (
        <>
            <PageHeader title='Statistics' description='Bookings and deliveries across the platform.' />

            <div className='mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                <StatCard label='Total parcels' value={parcels.length} icon={Package} />
                <StatCard
                    label='Delivered'
                    value={delivered}
                    icon={CheckCircle2}
                    hint={parcels.length ? `${Math.round((delivered / parcels.length) * 100)}% of all parcels` : undefined}
                />
                <StatCard label='Awaiting rider' value={pending} icon={Clock} />
                <StatCard label='Registered users' value={statsQ.data?.totalUsers ?? '—'} icon={Users} />
            </div>

            <div className='grid gap-6 xl:grid-cols-2'>
                <ChartCard
                    title='Parcels booked per day'
                    description='By booking date'
                    chart={
                        bookings.length ? (
                            <Chart
                                options={barOptions}
                                series={[{ name: 'Booked parcels', data: toPoints(bookings, 'count') }]}
                                type='bar'
                                height={300}
                            />
                        ) : (
                            <EmptyState icon={BarChart3} title='No bookings yet' />
                        )
                    }
                    table={
                        <Table>
                            <TableHeader>
                                <TableRow className='hover:bg-transparent'>
                                    <TableHead>Date</TableHead>
                                    <TableHead className='text-right'>Booked</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.map((b) => (
                                    <TableRow key={b.date}>
                                        <TableCell>{formatDate(b.date)}</TableCell>
                                        <TableCell className='text-right tabular-nums'>{b.count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                />

                <ChartCard
                    title='Booked vs delivered'
                    description='By requested pickup date'
                    legend={
                        <ul className='mb-2 flex gap-4 text-sm'>
                            {['Booked', 'Delivered'].map((name, i) => (
                                <li key={name} className='flex items-center gap-2'>
                                    <span className='h-0.5 w-4 rounded-full' style={{ backgroundColor: colors.series[i] }} />
                                    {name}
                                </li>
                            ))}
                        </ul>
                    }
                    chart={
                        trend.length ? (
                            <Chart
                                options={lineOptions}
                                series={[
                                    { name: 'Booked', data: toPoints(trend, 'booked') },
                                    { name: 'Delivered', data: toPoints(trend, 'delivered') },
                                ]}
                                type='line'
                                height={300}
                            />
                        ) : (
                            <EmptyState icon={BarChart3} title='No parcels yet' />
                        )
                    }
                    table={
                        <Table>
                            <TableHeader>
                                <TableRow className='hover:bg-transparent'>
                                    <TableHead>Date</TableHead>
                                    <TableHead className='text-right'>Booked</TableHead>
                                    <TableHead className='text-right'>Delivered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trend.map((r) => (
                                    <TableRow key={r.date}>
                                        <TableCell>{formatDate(r.date)}</TableCell>
                                        <TableCell className='text-right tabular-nums'>{r.booked}</TableCell>
                                        <TableCell className='text-right tabular-nums'>{r.delivered}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                />
            </div>
        </>
    );
};

export default Statistics;
