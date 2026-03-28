'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  Calendar, Phone, Mail, Users, CheckCircle2, 
  Clock, AlertCircle, Filter, Search, Plus
} from 'lucide-react';

export default function ActivitiesPage() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/crm/activities');
        setActivities(res.data);
      } catch (err) {
        console.error('Failed to fetch activities', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="w-4 h-4" />;
      case 'MEETING': return <Users className="w-4 h-4" />;
      case 'EMAIL': return <Mail className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CALL': return 'bg-blue-100 text-blue-600';
      case 'MEETING': return 'bg-purple-100 text-purple-600';
      case 'EMAIL': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('crm.activities')}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage follow-ups and client interactions</p>
        </div>
        <button className="btn-primary flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 me-2" />
          Schedule Activity
        </button>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search activities..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
          <Filter className="w-4 h-4 me-2" />
          Filter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading activities...</td></tr>
            ) : activities.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No scheduled activities found</td></tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`p-2 rounded-lg inline-flex ${getTypeColor(activity.type)}`}>
                      {getTypeIcon(activity.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{activity.subject}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{activity.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600 font-medium">
                      <Clock className="w-3.5 h-3.5 me-2 text-gray-400" />
                      {activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : 'No date'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit ${
                      activity.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {activity.isCompleted ? <CheckCircle2 className="w-3 h-3 me-1.5" /> : <AlertCircle className="w-3 h-3 me-1.5" />}
                      {activity.isCompleted ? 'Completed' : 'Upcoming'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Mark Done</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
