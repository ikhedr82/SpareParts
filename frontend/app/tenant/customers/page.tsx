'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Plus, Edit, Trash2, X, Users, AlertTriangle } from 'lucide-react';

interface Customer { id: string; name: string; email: string; phone: string; balance: number; }

export default function CustomersPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = async () => {
        try {
            const res = await apiClient.get('/customers');
            setCustomers(res.data);
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (editingCustomer) {
                await apiClient.patch(`/customers/${editingCustomer.id}`, formData);
            } else {
                await apiClient.post('/customers', formData);
            }
            setShowModal(false);
            setEditingCustomer(null);
            setFormData({ name: '', email: '', phone: '' });
            fetchCustomers();
        } catch (err: any) {
            setError(err.response?.data?.message || t('common.error_occurred'));
        } finally { setSubmitting(false); }
    };

    const openEdit = (c: Customer) => {
        setEditingCustomer(c);
        setFormData({ name: c.name, email: c.email, phone: c.phone });
        setError(null);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('customers.delete_confirm'))) return;
        try { await apiClient.delete(`/customers/${id}`); fetchCustomers(); }
        catch (err) { console.error('Failed to delete customer:', err); }
    };

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('customers.title')}</h1>
                    <p className="text-slate-600 mt-1">{t('customers.subtitle')}</p>
                </div>
                <button
                    onClick={() => { setEditingCustomer(null); setFormData({ name: '', email: '', phone: '' }); setError(null); setShowModal(true); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> {t('customers.add')}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">{t('common.name')}</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">{t('customers.contact')}</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">{t('customers.balance')}</th>
                            <th className={`px-6 py-4 font-semibold text-slate-700 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">{t('common.loading')}</td></tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-slate-500">
                                    <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p>{t('customers.no_customers')}</p>
                                </td>
                            </tr>
                        ) : customers.map(customer => (
                            <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div>{customer.email}</div>
                                    <div className="text-xs text-slate-400">{customer.phone}</div>
                                </td>
                                <td className={`px-6 py-4 font-medium ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {Number(customer.balance).toFixed(2)}
                                </td>
                                <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                    <button onClick={() => openEdit(customer)} className="text-slate-400 hover:text-indigo-600 p-2"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(customer.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingCustomer ? t('customers.edit_title') : t('customers.new_title')}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.name')}</label>
                                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.email')}</label>
                                <input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('branches.phone')}</label>
                                <input type="tel" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{error}</p>}
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50">
                                    {submitting ? t('common.loading') : editingCustomer ? t('customers.save_changes') : t('customers.create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
