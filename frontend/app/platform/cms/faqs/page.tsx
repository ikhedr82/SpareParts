'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CMSPageLayout } from '@/components/platform/cms-layout';
import apiClient from '@/lib/api';
import { Plus, Edit2, Trash2, GripVertical, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface FAQ {
    id: string;
    question: string;
    questionAr: string;
    answer: string;
    answerAr: string;
    order: number;
    isActive: boolean;
}

export default function FAQsPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<Partial<FAQ> | null>(null);

    const { data: faqs, isLoading } = useQuery<FAQ[]>({
        queryKey: ['platform-cms-faqs'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/cms/faqs');
            return data;
        }
    });

    const upsertMutation = useMutation({
        mutationFn: async (data: any) => {
            if (data.id) {
                return apiClient.patch(`/api/platform/cms/faqs/${data.id}`, data);
            }
            return apiClient.post('/api/platform/cms/faqs', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-cms-faqs'] });
            setIsModalOpen(false);
            setEditingFAQ(null);
            toast.success(t('platform.cms.save_success'));
        },
        onError: () => {
            toast.error(t('platform.cms.save_error'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiClient.delete(`/api/platform/cms/faqs/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-cms-faqs'] });
            toast.success('Deleted successfully');
        }
    });

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        upsertMutation.mutate({
            ...editingFAQ,
            ...data,
            order: parseInt(data.order as string) || 0,
            isActive: data.isActive === 'on'
        });
    };

    return (
        <CMSPageLayout
            title={t('platform.cms.faqs')}
            subtitle="Manage help articles and common questions to assist portal visitors"
            actions={
                <Button onClick={() => { setEditingFAQ(null); setIsModalOpen(true); }} className="rounded-full px-6 font-bold shadow-lg shadow-indigo-100">
                    <Plus className="h-5 w-5 mr-2 rtl:ml-2" />
                    {t('common.add') || 'Add FAQ'}
                </Button>
            }
        >
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : faqs?.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
                        <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No FAQs found</h3>
                        <p className="text-slate-500 mt-2">Help your users by adding common questions.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs?.map((faq) => (
                            <div key={faq.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow group">
                                <div className="hidden md:flex flex-col gap-1 text-slate-200 group-hover:text-slate-300 transition-colors">
                                    <GripVertical className="h-5 w-5 cursor-grab" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-slate-900 text-lg">
                                            {isRtl ? faq.questionAr : faq.question}
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingFAQ(faq); setIsModalOpen(true); }} className="rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(faq.id); }} className="rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 line-clamp-2">
                                        {isRtl ? faq.answerAr : faq.answer}
                                    </p>
                                    <div className="flex items-center gap-4 text-[10px] font-black tracking-widest uppercase pt-2">
                                        <span className={`px-3 py-1 rounded-full ${faq.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {faq.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                        <span className="text-slate-400">Order: {faq.order}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upsert Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <form onSubmit={handleSave}>
                        <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100">
                            <DialogTitle className="text-2xl font-black text-slate-900">
                                {editingFAQ ? 'Update FAQ' : 'New FAQ'}
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Question (EN)</Label>
                                    <Input name="question" defaultValue={editingFAQ?.question} required className="rounded-xl border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Question (AR)</Label>
                                    <Input name="questionAr" defaultValue={editingFAQ?.questionAr} required dir="rtl" className="rounded-xl border-slate-200 font-arabic" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Answer (EN)</Label>
                                <textarea name="answer" defaultValue={editingFAQ?.answer} required className="w-full rounded-xl border-slate-200 border p-3 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Answer (AR)</Label>
                                <textarea name="answerAr" defaultValue={editingFAQ?.answerAr} required dir="rtl" className="w-full rounded-xl border-slate-200 border p-3 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none font-arabic" />
                            </div>

                            <div className="grid grid-cols-2 gap-6 items-center">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">{t('platform.cms.order')}</Label>
                                    <Input type="number" name="order" defaultValue={editingFAQ?.order || 0} className="rounded-xl border-slate-200" />
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <input type="checkbox" name="isActive" id="isActive" defaultChecked={editingFAQ?.isActive !== false} className="w-5 h-5 accent-indigo-600 rounded" />
                                    <Label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">{t('platform.cms.is_active')}</Label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={upsertMutation.isPending} className="rounded-xl font-bold px-8 shadow-xl shadow-indigo-100">
                                {upsertMutation.isPending ? t('common.loading') : t('common.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </CMSPageLayout>
    );
}
