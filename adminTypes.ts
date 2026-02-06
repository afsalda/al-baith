// Admin and Booking Types for Al-Baith Admin Panel

export interface AdminUser {
    email: string;
    password: string;
    name: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface Booking {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
    roomId: string;
    guests: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
    createdAt: string;
    notes?: string;
}
