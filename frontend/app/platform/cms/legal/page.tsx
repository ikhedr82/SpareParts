'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CMSPageLayout } from '@/components/platform/cms-layout';
import apiClient from '@/lib/api';
import { Save, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LegalContent {
    id: string;
    type: string;
    titleEn: string;
    titleAr: string;
    contentEn: string;
    contentAr: string;
    updatedAt: string;
}

export default function LegalPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const queryClient = useQueryClient();
    const [selectedType, setSelectedType] = useState<'privacy' | 'terms'>('privacy');

    const { data: legalItems, isLoading } = useQuery<LegalContent[]>({
        queryKey: ['platform-cms-legal'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/cms/legal');
            return data;
        }
    });

    const selectedItem = legalItems?.find(i => i.type === selectedType);

    const upsertMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiClient.post('/api/platform/cms/legal', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-cms-legal'] });
            toast.success(t('platform.cms.save_success'));
        },
        onError: () => {
            toast.error(t('platform.cms.save_error'));
        }
    });

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        upsertMutation.mutate({
            type: selectedType,
            ...data
        });
    };

    return (
        <CMSPageLayout
            title={t('platform.cms.legal_pages')}
            subtitle="Draft and publish legal frameworks for the platform ecosystem"
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Selector */}
                <div className="lg:col-span-1 space-y-2">
                    {['privacy', 'terms'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type as any)}
                            className={`w-full p-6 rounded-3xl flex items-center justify-between group transition-all ${
                                selectedType === type 
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className={`h-5 w-5 ${selectedType === type ? 'text-indigo-200' : 'text-slate-400'}`} />
                                <span className="font-bold capitalize">{type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}</span>
                            </div>
                            <ChevronRight className={`h-4 w-4 transition-transform ${selectedType === type ? 'translate-x-1 opacity-100' : 'opacity-0'} ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                    ))}
                    
                    <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                        <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Drafting Tip
                        </h4>
                        <p className="text-amber-700 text-xs leading-relaxed">
                            Use clear, professional language. All changes are immediate upon saving.
                        </p>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3">
                    {isLoading ? (
                        <div className="h-[600px] bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
                    ) : (
                        <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 capitalize">
                                        {selectedType === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
                                    </h3>
                                    <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-widest">
                                        Last updated: {selectedItem ? new Date(selectedItem.updatedAt).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                                <Button type="submit" disabled={upsertMutation.isPending} className="rounded-full px-8 font-bold shadow-lg shadow-indigo-100">
                                    <Save className="h-4 w-4 mr-2 rtl:ml-2" />
                                    {upsertMutation.isPending ? t('common.loading') : t('common.save')}
                                </Button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">{t('platform.cms.title_en')}</Label>
                                        <Input name="titleEn" defaultValue={selectedItem?.titleEn} required className="rounded-xl border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">{t('platform.cms.title_ar')}</Label>
                                        <Input name="titleAr" defaultValue={selectedItem?.titleAr} required dir="rtl" className="rounded-xl border-slate-200 font-arabic text-lg" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">{t('platform.cms.content_en')}</Label>
                                    <textarea 
                                        name="contentEn" 
                                        defaultValue={selectedItem?.contentEn} 
                                        required 
                                        className="w-full rounded-2xl border-slate-200 border p-6 min-h-[400px] focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600 leading-relaxed font-mono text-sm" 
                                        placeholder="Supports plain text or HTML blocks..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">{t('platform.cms.content_ar')}</Label>
                                    <textarea 
                                        name="contentAr" 
                                        defaultValue={selectedItem?.contentAr} 
                                        required 
                                        dir="rtl" 
                                        className="w-full rounded-2xl border-slate-200 border p-6 min-h-[400px] focus:ring-2 focus:ring-indigo-500 outline-none font-arabic text-lg leading-loose" 
                                        placeholder="ادخل المحتوى القانوني باللغة العربية هنا..."
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </CMSPageLayout>
    );
}
