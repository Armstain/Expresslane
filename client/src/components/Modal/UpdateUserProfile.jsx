import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import useAuth from '@/hooks/useAuth.jsx';
import { imageUpload } from '@/api/utils';
import UserAvatar from '@/components/Shared/UserAvatar.jsx';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UpdateProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, saveUser } = useAuth();
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset the form to the current profile whenever the dialog opens
  useEffect(() => {
    if (isOpen) {
      setName(user?.displayName || '');
      setPhotoURL(user?.photoURL || '');
    }
  }, [isOpen, user]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      setPhotoURL(await imageUpload(file));
    } catch {
      toast.error('Image upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(name, photoURL);
      await saveUser({ displayName: name, photoURL, email: user.email });
      toast.success('Profile updated');
      onClose();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update how your name and photo appear across ExpressLane.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex items-center gap-4'>
            <UserAvatar src={photoURL} name={name} email={user?.email} className='h-16 w-16 text-lg' />
            <div className='space-y-1'>
              <Label htmlFor='photo-file' className='cursor-pointer text-primary hover:underline'>
                Upload new photo
              </Label>
              <input id='photo-file' type='file' accept='image/*' className='sr-only' onChange={handleFile} />
              <p className='text-xs text-muted-foreground'>Or paste an image URL below.</p>
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='profile-name'>Name</Label>
            <Input id='profile-name' value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='profile-photo'>Photo URL</Label>
            <Input id='profile-photo' type='url' value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} placeholder='https://…' />
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={saving}>
              {saving && <Loader2 className='h-4 w-4 animate-spin' />} Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

UpdateProfileModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default UpdateProfileModal;
