'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CMSPageLayout } from '@/components/platform/cms-layout';
import apiClient from '@/lib/api';
import { Plus, Edit2, Trash2, Check, X, GripVertical } from 'lucide-react';
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

interface Testimonial {
    id: string;
    authorName: string;
    authorNameAr: string;
    role: string;
    roleAr: string;
    company: string;
    companyAr: string;
    content: string;
    contentAr: string;
    avatarUrl?: string;
    order: number;
    isActive: boolean;
}

export default function TestimonialsPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

    const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
        queryKey: ['platform-cms-testimonials'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/cms/testimonials');
            return data;
        }
    });

    const upsertMutation = useMutation({
        mutationFn: async (data: any) => {
            if (data.id) {
                return apiClient.patch(`/api/platform/cms/testimonials/${data.id}`, data);
            }
            return apiClient.post('/api/platform/cms/testimonials', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-cms-testimonials'] });
            setIsModalOpen(false);
            setEditingTestimonial(null);
            toast.success(t('platform.cms.save_success'));
        },
        onError: () => {
            toast.error(t('platform.cms.save_error'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiClient.delete(`/api/platform/cms/testimonials/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-cms-testimonials'] });
            toast.success('Deleted successfully');
        }
    });

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        upsertMutation.mutate({
            ...editingTestimonial,
            ...data,
            order: parseInt(data.order as string) || 0,
            isActive: data.isActive === 'on'
        });
    };

    return (
        <CMSPageLayout
            title={t('platform.cms.testimonials')}
            subtitle="Manage client success stories and feedback on the landing portal"
            actions={
                <Button onClick={() => { setEditingTestimonial(null); setIsModalOpen(true); }} className="rounded-full px-6 font-bold shadow-lg shadow-indigo-100">
                    <Plus className="h-5 w-5 mr-2 rtl:ml-2" />
                    {t('common.add') || 'Add New'}
                </Button>
            }
        >
            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : testimonials?.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
                        <Quote className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No testimonials found</h3>
                        <p className="text-slate-500 mt-2">Start by adding your first client success story.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {testimonials?.map((t2) => (
                            <div key={t2.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow group">
                                <div className="hidden md:flex flex-col gap-1 text-slate-300 group-hover:text-slate-400 transition-colors">
                                    <GripVertical className="h-6 w-6 cursor-grab" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                                {t2.authorName[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{isRtl ? t2.authorNameAr : t2.authorName}</h4>
                                                <p className="text-sm text-slate-500">{isRtl ? `${t2.roleAr} @ ${t2.companyAr}` : `${t2.role} @ ${t2.company}`}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingTestimonial(t2); setIsModalOpen(true); }} className="rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(t2.id); }} className="rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4 rtl:border-r-4 rtl:border-l-0 rtl:pl-0 rtl:pr-4">
                                        "{isRtl ? t2.contentAr : t2.content}"
                                    </p>
                                    <div className="flex items-center gap-4 text-[10px] font-black tracking-widest uppercase">
                                        <span className={`px-3 py-1 rounded-full ${t2.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {t2.isActive ? 'Active' : 'Draft'}
                                        </span>
                                        <span className="text-slate-400">Order: {t2.order}</span>
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
                                {editingTestimonial ? 'Update Testimonial' : 'New Testimonial'}
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">{t('platform.cms.title_en')}</Label>
                                <Input name="authorName" defaultValue={editingTestimonial?.authorName} required className="rounded-xl border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">{t('platform.cms.title_ar')}</Label>
                                <Input name="authorNameAr" defaultValue={editingTestimonial?.authorNameAr} required className="rounded-xl border-slate-200" dir="rtl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Role (EN)</Label>
                                <Input name="role" defaultValue={editingTestimonial?.role} required className="rounded-xl border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Role (AR)</Label>
                                <Input name="roleAr" defaultValue={editingTestimonial?.roleAr} required className="rounded-xl border-slate-200" dir="rtl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Company (EN)</Label>
                                <Input name="company" defaultValue={editingTestimonial?.company} required className="rounded-xl border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Company (AR)</Label>
                                <Input name="companyAr" defaultValue={editingTestimonial?.companyAr} required className="rounded-xl border-slate-200" dir="rtl" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label className="font-bold text-slate-700">{t('platform.cms.content_en')}</Label>
                                <textarea name="content" defaultValue={editingTestimonial?.content} required className="w-full rounded-xl border-slate-200 border p-3 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label className="font-bold text-slate-700">{t('platform.cms.content_ar')}</Label>
                                <textarea name="contentAr" defaultValue={editingTestimonial?.contentAr} required dir="rtl" className="w-full rounded-xl border-slate-200 border p-3 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">{t('platform.cms.order')}</Label>
                                <Input type="number" name="order" defaultValue={editingTestimonial?.order || 0} className="rounded-xl border-slate-200" />
                            </div>
                            <div className="flex items-center gap-3 pt-8">
                                <input type="checkbox" name="isActive" id="isActive" defaultChecked={editingTestimonial?.isActive !== false} className="w-5 h-5 accent-indigo-600 rounded" />
                                <Label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">{t('platform.cms.is_active')}</Label>
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
