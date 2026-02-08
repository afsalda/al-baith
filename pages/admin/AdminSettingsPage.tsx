import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState({
        hotel_name: '',
        address: '',
        phone: '',
        map_url: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/admin/settings');
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Failed to fetch settings', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                alert('Settings updated successfully!');
            } else {
                alert('Failed to update settings');
            }
        } catch (error) {
            console.error('Error saving settings', error);
            alert('Error saving settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="max-w-3xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Hotel Settings</h1>
                <p className="text-gray-500">Manage general information about your property.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Name</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                            value={settings.hotel_name || ''}
                            onChange={e => setSettings({ ...settings, hotel_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none h-24 resize-none"
                            value={settings.address || ''}
                            onChange={e => setSettings({ ...settings, address: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                            value={settings.phone || ''}
                            onChange={e => setSettings({ ...settings, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Google Maps Embed URL</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                            placeholder="https://www.google.com/maps/embed?..."
                            value={settings.map_url || ''}
                            onChange={e => setSettings({ ...settings, map_url: e.target.value })}
                        />
                        <p className="text-xs text-gray-400 mt-2">Paste the 'src' attribute from the Google Maps Embed code.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            <Save size={20} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
