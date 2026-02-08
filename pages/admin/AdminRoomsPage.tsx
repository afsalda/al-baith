import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Room {
    id: number;
    room_type: string;
    price: string;
    description: string;
    image_url: string;
}

const AdminRoomsPage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        room_type: '',
        price: '',
        description: '',
        image_url: ''
    });

    const token = localStorage.getItem('adminToken');

    const fetchRooms = async () => {
        try {
            const response = await fetch('/api/admin/rooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRooms(data);
            }
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingRoom
                ? `/api/admin/rooms/${editingRoom.id}` // PUT
                : '/api/admin/rooms'; // POST

            const method = editingRoom ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                closeModal();
                fetchRooms();
            } else {
                alert('Failed to save room');
            }
        } catch (error) {
            console.error('Error saving room', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;

        try {
            const response = await fetch(`/api/admin/rooms/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                fetchRooms();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete room');
            }
        } catch (error) {
            console.error('Error deleting room', error);
        }
    };

    const openModal = (room?: Room) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                room_type: room.room_type,
                price: room.price,
                description: room.description || '',
                image_url: room.image_url || ''
            });
        } else {
            setEditingRoom(null);
            setFormData({ room_type: '', price: '', description: '', image_url: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    if (isLoading) return <div className="p-8">Loading rooms...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Rooms</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus size={20} />
                    Add Room
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                            <th className="p-4 font-medium">Image</th>
                            <th className="p-4 font-medium">Room Type</th>
                            <th className="p-4 font-medium">Price</th>
                            <th className="p-4 font-medium">Description</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="p-4">
                                    {room.image_url && (
                                        <img src={room.image_url} alt={room.room_type} className="w-16 h-12 object-cover rounded-md" />
                                    )}
                                </td>
                                <td className="p-4 font-semibold text-gray-900">{room.room_type}</td>
                                <td className="p-4 text-gray-600">₹{room.price}</td>
                                <td className="p-4 text-gray-500 text-sm max-w-xs truncate">{room.description}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openModal(room)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rooms.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No rooms found. Add one to get started.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingRoom ? 'Edit Room' : 'Add New Room'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Room Type</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                                    placeholder="e.g. Deluxe Room"
                                    value={formData.room_type}
                                    onChange={e => setFormData({ ...formData, room_type: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                                    placeholder="e.g. 2500"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                                    placeholder="https://..."
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none h-24 resize-none"
                                    placeholder="Room details..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 text-gray-700 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    {editingRoom ? 'Save Changes' : 'Create Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRoomsPage;
