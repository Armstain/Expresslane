import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const UpdateUserModal = ({ user, onUpdate }) => {
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleUpdate = async () => {
        await onUpdate(user._id, selectedRole);
        setShowConfirm(false);
    };

    const handleRoleChange = (value) => {
        setSelectedRole(value);
        setShowConfirm(value !== user.role); // Show only when the role changes
    };

    return (
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={user.role === "admin"}>Update Role</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update User Role</DialogTitle>
                    <DialogDescription>
                        Change the role for <b>{user.displayName}</b>
                    </DialogDescription>
                </DialogHeader>
                <Select onValueChange={handleRoleChange} defaultValue={user.role}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="DeliveryMen">DeliveryMen</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                {showConfirm && (
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowConfirm(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleUpdate}>
                            Update
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UpdateUserModal;