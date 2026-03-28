'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  ArrowLeft, Mail, Phone, MapPin, CreditCard, 
  History, MessageSquare, Calendar, Shield,
  CheckCircle2, Clock, DollarSign, Package
} from 'lucide-react';
import Link from 'next/link';

interface Customer360 {
  profile: any;
  contacts: any[];
  addresses: any[];
  orderHistory: any[];
  paymentHistory: any[];
  invoiceHistory: any[];
  timeline: any[];
  credit: any;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, dir } = useLanguage();
  const [data, setData] = useState<Customer360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetch360 = async () => {
      try {
        const res = await api.get(`/crm/customers/${id}/360`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch 360 view', err);
      } finally {
        setLoading(false);
      }
    };
    fetch360();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div>{t('common.no_data')}</div>;

  const { profile, credit, timeline, orderHistory, paymentHistory } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/crm/customers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              profile.segmentation === 'VIP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {profile.segmentation}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                profile.riskLevel === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
                {profile.riskLevel} Risk
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Profile info & Credit */}
        <div className="lg:col-span-1 space-y-6">
           {/* Profile Card */}
           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 me-2 text-blue-600" />
                Profile Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 me-3 text-gray-400" />
                  {profile.email || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 me-3 text-gray-400" />
                  {profile.phone || 'N/A'}
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 me-3 mt-0.5 text-gray-400" />
                  <span>{data.addresses[0]?.addressLine1 || 'No address provided'}</span>
                </div>
              </div>
           </div>

           {/* Credit Card */}
           <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
             credit?.status === 'BLOCKED' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
           }`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 me-2 text-indigo-600" />
                  Credit Account
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  credit?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {credit?.status || 'ACTIVE'}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Credit Usage</span>
                      <span>{Math.round((Number(credit?.balance || 0) / Number(credit?.creditLimit || 1)) * 100)}%</span>
                   </div>
                   <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          credit?.status === 'BLOCKED' ? 'bg-red-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, (Number(credit?.balance || 0) / Number(credit?.creditLimit || 1)) * 100)}%` }}
                      />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Limit</p>
                    <p className="text-lg font-bold">${Number(credit?.creditLimit || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Balance</p>
                    <p className="text-lg font-bold">${Number(credit?.balance || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Right Col: Tabs & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['overview', 'orders', 'payments', 'timeline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold capitalize transition-colors relative ${
                  activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-white min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                   <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center mb-4">
                     <History className="w-4 h-4 me-2" /> Recent Orders
                   </h3>
                   <div className="space-y-3">
                      {orderHistory.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                           <div>
                              <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
                              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                           </div>
                           <span className="text-sm font-bold text-gray-900">${Number(order.total).toLocaleString()}</span>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center mb-4">
                      <MessageSquare className="w-4 h-4 me-2" /> Recent Notes
                    </h3>
                    <div className="space-y-3">
                       {timeline.filter(t => t.type === 'NOTE').slice(0, 3).map((note, idx) => (
                         <div key={idx} className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-700 leading-relaxed">{note.data.content}</p>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold">{new Date(note.timestamp).toLocaleString()}</p>
                         </div>
                       ))}
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="p-2 space-y-4">
                {timeline.map((item, idx) => (
                   <div key={idx} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 ${
                           item.type === 'ACTIVITY' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                         }`}>
                            {item.type === 'ACTIVITY' ? <Calendar className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                         </div>
                         {idx < timeline.length - 1 && <div className="w-0.5 h-full bg-gray-100 -mt-2 group-last:hidden" />}
                      </div>
                      <div className="pb-8 pt-1">
                         <p className="text-sm font-bold text-gray-900">
                           {item.type === 'ACTIVITY' ? item.data.subject : 'Internal Note'}
                         </p>
                         <p className="text-xs text-gray-500 transition-colors group-hover:text-blue-600 font-medium">
                           {new Date(item.timestamp).toLocaleString()}
                         </p>
                         <div className="mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-700 leading-relaxed shadow-sm">
                           {item.type === 'ACTIVITY' ? item.data.description : item.data.content}
                         </div>
                      </div>
                   </div>
                ))}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Order #</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Items</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orderHistory.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{order.items?.length || 0} items</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">${Number(order.total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
