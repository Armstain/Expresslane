import { Helmet } from 'react-helmet-async';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import UpdateUserModal from '@/components/Modal/UpdateUserModal.jsx';
import useAuth from '@/hooks/useAuth.jsx';
import toast from 'react-hot-toast';

const AllUsers = () => {
    const axiosSecure = useAxiosSecure();
    const { user, loading } = useAuth();

    const { mutateAsync } = useMutation({
        mutationFn: async (updatedUserData) => {
            const { data } = await axiosSecure.patch(`/users/update/${updatedUserData._id}`, { role: updatedUserData.role });
            return data;
        },
        onSuccess: () => {
            refetch();
            toast.success('Role updated successfully');
        },
    });

    const handleUpdateRole = async (userId, role) => {
        try {
            await mutateAsync({ _id: userId, role });
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        }
    };

    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await axiosSecure(`/users`);
            return data;
        },
    });

    console.log(users);

    if (isLoading) return <LoaderCircle />;
    return (
        <>
            <div className='container mx-auto px-4 sm:px-8'>
                <Helmet>
                    <title>Manage Users</title>
                </Helmet>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Parcel Booked</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user?._id}>
                                <TableCell className="font-medium">{user?.displayName}</TableCell>
                                <TableCell>{user.phoneNumber || '-'}</TableCell>
                                <TableCell>{user.parcelBooked}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <UpdateUserModal user={user} onUpdate={handleUpdateRole} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};

export default AllUsers;