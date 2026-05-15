import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', { name });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/users/me/password', pwForm);
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password update failed');
    } finally { setSavingPw(false); }
  };

  return (
    <div className="page-container py-10 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <User size={28} className="text-brand-500" />
        <h1 className="font-display text-3xl font-bold text-ink">My Profile</h1>
      </div>

      <div className="space-y-6">
        {/* Profile info */}
        <form onSubmit={handleSaveProfile} className="card p-6">
          <h2 className="font-display text-xl font-semibold mb-5">Account Details</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input bg-cream-50" value={user?.email} disabled />
              <p className="text-xs text-ink-muted mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Member Since</label>
              <input className="input bg-cream-50" value={new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} disabled />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary mt-5">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={handleChangePassword} className="card p-6">
          <h2 className="font-display text-xl font-semibold mb-5 flex items-center gap-2">
            <Lock size={20} className="text-brand-500" /> Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" required
                     value={pwForm.currentPassword} onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" required minLength={8}
                     placeholder="Min. 8 characters"
                     value={pwForm.newPassword} onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={savingPw} className="btn-primary mt-5">
            <Lock size={16} /> {savingPw ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
