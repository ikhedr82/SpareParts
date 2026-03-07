'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Plus, Edit, Trash2, X, Loader2, Percent } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface TaxRate {
    id: string;
    name: string;
    percentage: number;
}

export default function TaxesPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const [taxes, setTaxes] = useState<TaxRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTax, setEditingTax] = useState<TaxRate | null>(null);
    const [formData, setFormData] = useState({ name: '', percentage: '' });

    const fetchTaxes = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/taxes');
            setTaxes(res.data);
        } catch (error) {
            console.error('Failed to fetch taxes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                percentage: Number(formData.percentage)
            };

            if (editingTax) {
                await apiClient.patch(`/taxes/${editingTax.id}`, payload);
            } else {
                await apiClient.post('/taxes', payload);
            }
            setShowModal(false);
            setEditingTax(null);
            setFormData({ name: '', percentage: '' });
            fetchTaxes();
        } catch (error) {
            console.error('Failed to save tax rate:', error);
        }
    };

    const openEdit = (tax: TaxRate) => {
        setEditingTax(tax);
        setFormData({ name: tax.name, percentage: tax.percentage.toString() });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('finance.delete_tax_confirm'))) return;
        try {
            await apiClient.delete(`/taxes/${id}`);
            fetchTaxes();
        } catch (error) {
            console.error('Failed to delete tax rate:', error);
        }
    };

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('finance.taxes')}</h1>
                    <p className="text-slate-600">{t('finance.taxes_desc')}</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTax(null);
                        setFormData({ name: '', percentage: '' });
                        setShowModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> {t('finance.add_tax')}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-900">{t('finance.tax_name')}</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">{t('finance.percentage')}</th>
                            <th className={`px-6 py-4 font-semibold text-slate-900 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan={3} className="p-12 text-center text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                {t('common.loading')}
                            </td></tr>
                        ) : taxes.length === 0 ? (
                            <tr><td colSpan={3} className="p-12 text-center text-slate-500">
                                <Percent className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                {t('finance.no_taxes') || t('common.no_data')}
                            </td></tr>
                        ) : (
                            taxes.map((tax) => (
                                <tr key={tax.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{tax.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{tax.percentage}%</td>
                                    <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                        <button onClick={() => openEdit(tax)} className="text-slate-400 hover:text-indigo-600 p-2" title={t('common.edit')}>
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(tax.id)} className="text-slate-400 hover:text-red-600 p-2" title={t('common.delete')}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingTax ? t('finance.edit_tax') : t('finance.new_tax')}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('finance.tax_name')}</label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('finance.percentage')} (%)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                                    value={formData.percentage}
                                    onChange={e => setFormData({ ...formData, percentage: e.target.value })}
                                />
                            </div>
                            <div className={`flex justify-end gap-3 mt-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    {editingTax ? t('finance.save_tax') : t('finance.add_tax')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
