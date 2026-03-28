'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  Search, Filter, Plus, User, MoreVertical, 
  TrendingUp, AlertTriangle, ShieldCheck, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/business-clients');
        setCustomers(res.data);
      } catch (err) {
        console.error('Failed to fetch customers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.primaryEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getSegmentationBadge = (segment: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Risky': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('crm.customers')}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your B2B relationships and credit accounts</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 me-2" />
          {t('common.create')}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 me-4">
                <User className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600 me-4">
                <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">High Risk Clients</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600 me-4">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">VIP Segment</p>
                <p className="text-2xl font-bold text-gray-900">12%</p>
            </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('inventory.search_placeholder')}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4 me-2" />
            {t('common.filter')}
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('crm.customers')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('crm.segmentation')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('crm.risk_level')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('financials.credit_limit')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      {t('common.loading')}
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('common.no_results')}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold me-3 shadow-sm">
                          {customer.businessName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{customer.businessName}</p>
                          <p className="text-xs text-gray-500">{customer.primaryEmail || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSegmentationBadge(customer.segmentation || 'Active')}`}>
                        {customer.segmentation || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskBadge(customer.riskLevel || 'LOW')}`}>
                        {customer.riskLevel || 'LOW'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">${Number(customer.creditLimit).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Balance: ${Number(customer.currentBalance).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full me-1.5 ${
                          customer.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/crm/customers/${customer.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View 360"
                        >
                          <ShieldCheck className="w-5 h-5" />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
