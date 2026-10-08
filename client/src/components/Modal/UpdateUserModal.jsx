import { useState } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABEL } from "@/components/Dashboard/Sidebar/navigation.js";

const UpdateUserModal = ({ user, onUpdate }) => {
    const [open, setOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [saving, setSaving] = useState(false);

    const handleOpenChange = (next) => {
        if (next) setSelectedRole(user.role);
        setOpen(next);
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            await onUpdate(user._id, selectedRole);
            setOpen(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={user.role === "admin"}>
                    Change role
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change role</DialogTitle>
                    <DialogDescription>
                        Choose what <span className="font-medium text-foreground">{user.displayName || user.email}</span> can access.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor={`role-${user._id}`}>Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger id={`role-${user._id}`}>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(ROLE_LABEL).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={handleUpdate} disabled={saving || selectedRole === user.role}>
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

UpdateUserModal.propTypes = {
    user: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default UpdateUserModal;
