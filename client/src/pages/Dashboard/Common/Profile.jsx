import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { CalendarDays, Fingerprint, KeyRound, Mail, Pencil } from 'lucide-react';
import useRole from '@/hooks/useRole.js';
import useAuth from '@/hooks/useAuth.jsx';
import UpdateProfileModal from '@/components/Modal/UpdateUserProfile.jsx';
import PageHeader from '@/components/Shared/PageHeader.jsx';
import UserAvatar from '@/components/Shared/UserAvatar.jsx';
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx';
import { ROLE_LABEL } from '@/components/Dashboard/Sidebar/navigation.js';
import { formatDate } from '@/api/utils/dateUtils.js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Detail = ({ icon: Icon, label, value }) => (
    <div className='flex items-start gap-3 rounded-lg bg-secondary/60 p-4'>
        <Icon className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
        <div className='min-w-0'>
            <p className='text-xs text-muted-foreground'>{label}</p>
            <p className='break-all text-sm font-medium'>{value || '—'}</p>
        </div>
    </div>
);

Detail.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.node,
};

const Profile = () => {
    const { user, loading, resetPassword } = useAuth();
    const [role, isLoading] = useRole();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sendingReset, setSendingReset] = useState(false);

    if (isLoading || loading) return <LoadingSpinner />;

    const handlePasswordReset = async () => {
        setSendingReset(true);
        try {
            await resetPassword(user.email);
            toast.success(`Password reset link sent to ${user.email}`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSendingReset(false);
        }
    };

    return (
        <>
            <PageHeader title='Profile' description='Your account details and security settings.' />

            <Card className='overflow-hidden'>
                <div className='h-28 bg-primary sm:h-36'>
                    <div className='h-full w-full opacity-20 [background-image:radial-gradient(hsl(var(--primary-foreground))_1px,transparent_1px)] [background-size:18px_18px]' />
                </div>
                <div className='px-6 pb-6'>
                    <div className='-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between'>
                        <UserAvatar
                            src={user?.photoURL}
                            name={user?.displayName}
                            email={user?.email}
                            className='h-24 w-24 border-4 border-card text-2xl sm:h-28 sm:w-28'
                        />
                        <div className='flex flex-wrap gap-2'>
                            <Button variant='outline' onClick={handlePasswordReset} disabled={sendingReset}>
                                <KeyRound className='h-4 w-4' /> Change password
                            </Button>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Pencil className='h-4 w-4' /> Edit profile
                            </Button>
                        </div>
                    </div>
                    <div className='mt-4 flex flex-wrap items-center gap-3'>
                        <h2 className='text-2xl font-bold'>{user?.displayName || 'Unnamed user'}</h2>
                        {role && <Badge>{ROLE_LABEL[role] || role}</Badge>}
                    </div>

                    <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                        <Detail icon={Mail} label='Email' value={user?.email} />
                        <Detail icon={CalendarDays} label='Member since' value={formatDate(user?.metadata?.creationTime)} />
                        <Detail icon={Fingerprint} label='User ID' value={user?.uid} />
                    </div>
                </div>
            </Card>

            <UpdateProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Profile;
