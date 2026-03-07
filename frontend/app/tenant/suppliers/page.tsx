'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Plus, Edit, Trash2, X, Truck, AlertTriangle } from 'lucide-react';

interface Supplier { id: string; name: string; balance: number; }

export default function SuppliersPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuppliers = async () => {
        try {
            const res = await apiClient.get('/suppliers');
            setSuppliers(res.data);
        } catch (err) { console.error('Failed to fetch suppliers:', err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSuppliers(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (editingSupplier) {
                await apiClient.patch(`/suppliers/${editingSupplier.id}`, formData);
            } else {
                await apiClient.post('/suppliers', formData);
            }
            setShowModal(false); setEditingSupplier(null); setFormData({ name: '' }); fetchSuppliers();
        } catch (err: any) {
            setError(err.response?.data?.message || t('common.error_occurred'));
        } finally { setSubmitting(false); }
    };

    const openEdit = (s: Supplier) => {
        setEditingSupplier(s); setFormData({ name: s.name }); setError(null); setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('suppliers.delete_confirm'))) return;
        try { await apiClient.delete(`/suppliers/${id}`); fetchSuppliers(); }
        catch (err) { console.error('Failed to delete supplier:', err); }
    };

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Truck className="h-8 w-8 text-indigo-600" />
                        {t('suppliers.title')}
                    </h1>
                    <p className="text-slate-600 mt-1">{t('suppliers.subtitle')}</p>
                </div>
                <button
                    onClick={() => { setEditingSupplier(null); setFormData({ name: '' }); setError(null); setShowModal(true); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> {t('suppliers.add')}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">{t('common.name')}</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">{t('suppliers.balance')}</th>
                            <th className={`px-6 py-4 font-semibold text-slate-700 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan={3} className="p-8 text-center text-slate-500">{t('common.loading')}</td></tr>
                        ) : suppliers.length === 0 ? (
                            <tr><td colSpan={3} className="p-12 text-center text-slate-500">
                                <Truck className="h-10 w-10 mx-auto mb-2 opacity-20" /><p>{t('suppliers.no_suppliers')}</p>
                            </td></tr>
                        ) : suppliers.map(supplier => (
                            <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{supplier.name}</td>
                                <td className={`px-6 py-4 font-medium ${supplier.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {Number(supplier.balance).toFixed(2)}
                                </td>
                                <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                    <button onClick={() => openEdit(supplier)} className="text-slate-400 hover:text-indigo-600 p-2"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(supplier.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
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
                                {editingSupplier ? t('suppliers.edit_title') : t('suppliers.new_title')}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.name')}</label>
                                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.name} onChange={e => setFormData({ name: e.target.value })} />
                            </div>
                            {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {error}</p>}
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50">
                                    {submitting ? t('common.loading') : editingSupplier ? t('suppliers.save_changes') : t('suppliers.create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
