'use client';

import { useState } from 'react';
import { Truck, MapPin, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface DeliveryTrip {
    id: string;
    tripNumber: string;
    driverName: string;
    vehicle: string;
    status: 'PLANNED' | 'IN_TRANSIT' | 'COMPLETED' | 'DELAYED';
    totalStops: number;
    completedStops: number;
    eta: string;
}

interface DriverStatus {
    id: string;
    name: string;
    status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY';
    currentTrip?: string;
    lastActive: string;
}

export default function LogisticsPage() {
    const [activeTab, setActiveTab] = useState<'trips' | 'drivers'>('trips');

    // Mock Data
    const activeTrips: DeliveryTrip[] = [
        { id: '1', tripNumber: 'TRIP-2024-101', driverName: 'John Doe', vehicle: 'Van 1 (Ford Transit)', status: 'IN_TRANSIT', totalStops: 8, completedStops: 3, eta: '14:30' },
        { id: '2', tripNumber: 'TRIP-2024-102', driverName: 'Jane Smith', vehicle: 'Bike 3 (Yamaha)', status: 'PLANNED', totalStops: 4, completedStops: 0, eta: '16:00' },
        { id: '3', tripNumber: 'TRIP-2024-099', driverName: 'Mike Ross', vehicle: 'Truck 2 (Isuzu)', status: 'COMPLETED', totalStops: 12, completedStops: 12, eta: 'Done' },
        { id: '4', tripNumber: 'TRIP-2024-103', driverName: 'Sarah Connor', vehicle: 'Van 2 (Mercedes)', status: 'DELAYED', totalStops: 10, completedStops: 5, eta: '18:15' },
    ];

    const drivers: DriverStatus[] = [
        { id: '1', name: 'John Doe', status: 'ON_TRIP', currentTrip: 'TRIP-2024-101', lastActive: '2 min ago' },
        { id: '2', name: 'Jane Smith', status: 'AVAILABLE', lastActive: '10 min ago' },
        { id: '3', name: 'Mike Ross', status: 'AVAILABLE', lastActive: '5 min ago' },
        { id: '4', name: 'Sarah Connor', status: 'ON_TRIP', currentTrip: 'TRIP-2024-103', lastActive: '1 min ago' },
        { id: '5', name: 'Tom Hardy', status: 'OFF_DUTY', lastActive: '2 days ago' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Logistics & Delivery</h1>
                <div className="flex bg-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('trips')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'trips' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                        Active Trips
                    </button>
                    <button
                        onClick={() => setActiveTab('drivers')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'drivers' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                        Driver Status
                    </button>
                </div>
            </div>

            {activeTab === 'trips' ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700">Live Delivery Board</h2>
                        <span className="text-sm text-gray-500">Auto-refreshing in 30s</span>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver & Vehicle</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Progress</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeTrips.map((trip) => (
                                <tr key={trip.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-blue-600">{trip.tripNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{trip.driverName}</div>
                                        <div className="text-xs text-gray-500">{trip.vehicle}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm text-gray-900">{trip.completedStops} / {trip.totalStops}</div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(trip.completedStops / trip.totalStops) * 100}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                trip.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                                                    trip.status === 'DELAYED' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {trip.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" /> {trip.eta}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map(driver => (
                        <div key={driver.id} className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between border-l-4 border-transparent hover:border-blue-500 transition">
                            <div className="flex items-center">
                                <div className="p-3 bg-gray-100 rounded-full mr-4">
                                    <User className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{driver.name}</div>
                                    <div className="text-xs text-gray-500">Last Active: {driver.lastActive}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${driver.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                        driver.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                    {driver.status.replace('_', ' ')}
                                </span>
                                {driver.currentTrip && (
                                    <div className="text-xs text-blue-600 mt-1">{driver.currentTrip}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
