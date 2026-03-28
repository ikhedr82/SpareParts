'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  CreditCard, ShieldAlert, TrendingDown, 
  BarChart, Search, Edit3, Lock, Unlock
} from 'lucide-react';

export default function CreditControlPage() {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be a specialized endpoint
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/business-clients');
        setAccounts(res.data);
      } catch (err) {
        console.error('Failed to fetch credit accounts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('crm.credit_control')}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage limits and automated order blocking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-red-50 p-4 border border-red-100 rounded-xl">
            <h4 className="text-xs font-bold text-red-600 uppercase flex items-center gap-1 mb-2">
               <ShieldAlert className="w-3 h-3" /> Over-Limit
            </h4>
            <p className="text-2xl font-bold text-red-700">8 Clients</p>
         </div>
         <div className="bg-yellow-50 p-4 border border-yellow-100 rounded-xl">
            <h4 className="text-xs font-bold text-yellow-600 uppercase flex items-center gap-1 mb-2">
               <ShieldAlert className="w-3 h-3" /> Near Limit
            </h4>
            <p className="text-2xl font-bold text-yellow-700">14 Clients</p>
         </div>
         <div className="bg-blue-50 p-4 border border-blue-100 rounded-xl md:col-span-2">
            <h4 className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1 mb-2">
               <BarChart className="w-3 h-3" /> Total Outstanding
            </h4>
            <p className="text-2xl font-bold text-blue-700">$1,452,000</p>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left">
         <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input type="text" placeholder="Search accounts..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm" />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead className="bg-gray-50/50">
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                     <th className="px-6 py-4">Client</th>
                     <th className="px-6 py-4">Credit Limit</th>
                     <th className="px-6 py-4">Balance</th>
                     <th className="px-6 py-4">Usage</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {accounts.map(acc => (
                     <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-gray-900">{acc.businessName}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">${Number(acc.creditLimit).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">${Number(acc.currentBalance).toLocaleString()}</td>
                        <td className="px-6 py-4">
                           <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                 className="h-full bg-blue-600" 
                                 style={{ width: `${Math.min(100, (Number(acc.currentBalance) / (Number(acc.creditLimit) || 1)) * 100)}%` }}
                              />
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Active</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-1">
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Adjust Limit">
                                 <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Block Ordering">
                                 <Lock className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
