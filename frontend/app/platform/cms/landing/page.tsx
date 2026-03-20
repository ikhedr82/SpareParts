'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CMSPageLayout } from '@/components/platform/cms-layout';
import apiClient from '@/lib/api';
import { Save, Layout, Zap, Megaphone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PageContent {
    id: string;
    key: string;
    titleEn?: string;
    titleAr?: string;
    contentEn: any;
    contentAr?: any;
}

export default function LandingSectionsPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('hero');

    const { data: contents, isLoading } = useQuery<PageContent[]>({
        queryKey: ['platform-cms-content'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/cms/content');
            return data;
        }
    });

    const getSection = (key: string) => contents?.find(c => c.key === key);

    const upsertMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiClient.post('/api/platform/cms/content', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-cms-content'] });
            toast.success(t('platform.cms.save_success'));
        },
        onError: () => {
            toast.error(t('platform.cms.save_error'));
        }
    });

    const handleHeroSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        upsertMutation.mutate({
            key: 'hero',
            titleEn: data.titleEn,
            titleAr: data.titleAr,
            contentEn: {
                badge: data.badgeEn,
                subtitle: data.subtitleEn,
                ctaStart: data.ctaStartEn,
                ctaLogin: data.ctaLoginEn,
                learnMore: data.learnMoreEn
            },
            contentAr: {
                badge: data.badgeAr,
                subtitle: data.subtitleAr,
                ctaStart: data.ctaStartAr,
                ctaLogin: data.ctaLoginAr,
                learnMore: data.learnMoreAr
            }
        });
    };

    const tabs = [
        { id: 'hero', label: t('platform.cms.hero'), icon: Layout },
        { id: 'features', label: t('platform.cms.features'), icon: Zap },
        { id: 'cta', label: 'CTA Section', icon: Megaphone },
        { id: 'footer', label: 'Footer Info', icon: Info },
    ];

    const hero = getSection('hero');

    return (
        <CMSPageLayout
            title={t('platform.cms.landing_sections')}
            subtitle="Fine-tune the core marketing message and visual sections of the landing page"
        >
            <div className="flex flex-col gap-8">
                {/* Custom Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[2rem] w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-bold text-sm transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="font-bold text-slate-400">Loading Configuration...</p>
                        </div>
                    ) : activeTab === 'hero' ? (
                        <form onSubmit={handleHeroSave}>
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900">Hero Section Editor</h3>
                                <Button type="submit" disabled={upsertMutation.isPending} className="rounded-full px-8 font-bold">
                                    <Save className="h-4 w-4 mr-2 rtl:ml-2" />
                                    {upsertMutation.isPending ? t('common.loading') : t('common.save')}
                                </Button>
                            </div>
                            
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* English Hero */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">
                                        <span className="w-8 h-[2px] bg-indigo-600" />
                                        English Version
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">Badge Text</Label>
                                        <Input name="badgeEn" defaultValue={hero?.contentEn?.badge} className="rounded-xl border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">Main Title</Label>
                                        <Input name="titleEn" defaultValue={hero?.titleEn} className="rounded-xl border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">Subtitle</Label>
                                        <textarea name="subtitleEn" defaultValue={hero?.contentEn?.subtitle} className="w-full rounded-xl border-slate-200 border p-3 min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700">CTA Primary</Label>
                                            <Input name="ctaStartEn" defaultValue={hero?.contentEn?.ctaStart} className="rounded-xl border-slate-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700">CTA Secondary</Label>
                                            <Input name="ctaLoginEn" defaultValue={hero?.contentEn?.ctaLogin} className="rounded-xl border-slate-200" />
                                        </div>
                                    </div>
                                </div>

                                {/* Arabic Hero */}
                                <div className="space-y-6" dir="rtl">
                                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">
                                        <span className="w-8 h-[2px] bg-indigo-600" />
                                        النسخة العربية
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700 text-right block">نص الشارة (Badge)</Label>
                                        <Input name="badgeAr" defaultValue={hero?.contentAr?.badge} className="rounded-xl border-slate-200 font-arabic" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700 text-right block">العنوان الرئيسي</Label>
                                        <Input name="titleAr" defaultValue={hero?.titleAr} className="rounded-xl border-slate-200 font-arabic text-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700 text-right block">الوصف الفرعي</Label>
                                        <textarea name="subtitleAr" defaultValue={hero?.contentAr?.subtitle} className="w-full rounded-xl border-slate-200 border p-3 min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500 font-arabic leading-relaxed" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700 text-right block">الزر الرئيسي</Label>
                                            <Input name="ctaStartAr" defaultValue={hero?.contentAr?.ctaStart} className="rounded-xl border-slate-200 font-arabic" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700 text-right block">الزر الثانوي</Label>
                                            <Input name="ctaLoginAr" defaultValue={hero?.contentAr?.ctaLogin} className="rounded-xl border-slate-200 font-arabic" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : activeTab === 'features' ? (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const featuresEn = [];
                            const featuresAr = [];
                            for (let i = 0; i < 6; i++) {
                                featuresEn.push({
                                    title: formData.get(`fTitleEn${i}`),
                                    description: formData.get(`fDescEn${i}`)
                                });
                                featuresAr.push({
                                    title: formData.get(`fTitleAr${i}`),
                                    description: formData.get(`fDescAr${i}`)
                                });
                            }
                            upsertMutation.mutate({
                                key: 'features',
                                titleEn: formData.get('fMainTitleEn'),
                                titleAr: formData.get('fMainTitleAr'),
                                contentEn: { features: featuresEn, subtitle: formData.get('fMainSubtitleEn') },
                                contentAr: { features: featuresAr, subtitle: formData.get('fMainSubtitleAr') }
                            });
                        }}>
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900">Features Grid Editor</h3>
                                <Button type="submit" disabled={upsertMutation.isPending} className="rounded-full px-8 font-bold">
                                    <Save className="h-4 w-4 mr-2 rtl:ml-2" />
                                    {upsertMutation.isPending ? t('common.loading') : t('common.save')}
                                </Button>
                            </div>
                            
                            <div className="p-8 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="font-bold">Main Section Title (EN)</Label>
                                        <Input name="fMainTitleEn" defaultValue={getSection('features')?.titleEn} />
                                        <Label className="font-bold">Main Section Subtitle (EN)</Label>
                                        <Input name="fMainSubtitleEn" defaultValue={getSection('features')?.contentEn?.subtitle} />
                                    </div>
                                    <div className="space-y-4" dir="rtl">
                                        <Label className="font-bold">عنوان القسم الرئيسي (AR)</Label>
                                        <Input name="fMainTitleAr" defaultValue={getSection('features')?.titleAr} dir="rtl" className="font-arabic" />
                                        <Label className="font-bold">الوصف الفرعي الرئيسي (AR)</Label>
                                        <Input name="fMainSubtitleAr" defaultValue={getSection('features')?.contentAr?.subtitle} dir="rtl" className="font-arabic" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-slate-50">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card #{i+1}</span>
                                                <Zap className="h-4 w-4 text-amber-500" />
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <Input name={`fTitleEn${i}`} defaultValue={getSection('features')?.contentEn?.features?.[i]?.title} placeholder="Title (EN)" className="text-xs font-bold" />
                                                    <textarea name={`fDescEn${i}`} defaultValue={getSection('features')?.contentEn?.features?.[i]?.description} placeholder="Description (EN)" className="w-full mt-2 text-xs p-2 rounded-lg border border-slate-200 outline-none min-h-[60px]" />
                                                </div>
                                                <div dir="rtl">
                                                    <Input name={`fTitleAr${i}`} defaultValue={getSection('features')?.contentAr?.features?.[i]?.title} placeholder="العنوان (AR)" className="text-xs font-bold font-arabic" />
                                                    <textarea name={`fDescAr${i}`} defaultValue={getSection('features')?.contentAr?.features?.[i]?.description} placeholder="الوصف (AR)" className="w-full mt-2 text-xs p-2 rounded-lg border border-slate-200 outline-none min-h-[60px] font-arabic" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    ) : activeTab === 'cta' ? (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            upsertMutation.mutate({
                                key: 'cta',
                                titleEn: formData.get('ctaTitleEn'),
                                titleAr: formData.get('ctaTitleAr'),
                                contentEn: { 
                                    subtitle: formData.get('ctaSubtitleEn'),
                                    buttonText: formData.get('ctaBtnEn'),
                                    buttonSecondary: formData.get('ctaBtnSecEn')
                                },
                                contentAr: { 
                                    subtitle: formData.get('ctaSubtitleAr'),
                                    buttonText: formData.get('ctaBtnAr'),
                                    buttonSecondary: formData.get('ctaBtnSecAr')
                                }
                            });
                        }}>
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900">Call to Action (CTA) Editor</h3>
                                <Button type="submit" disabled={upsertMutation.isPending} className="rounded-full px-8 font-bold">
                                    <Save className="h-4 w-4 mr-2 rtl:ml-2" />
                                    {upsertMutation.isPending ? t('common.loading') : t('common.save')}
                                </Button>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold">CTA Title (EN)</Label>
                                        <Input name="ctaTitleEn" defaultValue={getSection('cta')?.titleEn} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">CTA Subtitle (EN)</Label>
                                        <textarea name="ctaSubtitleEn" defaultValue={getSection('cta')?.contentEn?.subtitle} className="w-full rounded-xl border border-slate-200 p-3" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input name="ctaBtnEn" defaultValue={getSection('cta')?.contentEn?.buttonText} placeholder="Primary Button (EN)" />
                                        <Input name="ctaBtnSecEn" defaultValue={getSection('cta')?.contentEn?.buttonSecondary} placeholder="Secondary Button (EN)" />
                                    </div>
                                </div>
                                <div className="space-y-6" dir="rtl">
                                    <div className="space-y-2">
                                        <Label className="font-bold">عنوان الدعوة لاتخاذ إجراء (AR)</Label>
                                        <Input name="ctaTitleAr" defaultValue={getSection('cta')?.titleAr} dir="rtl" className="font-arabic" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">العنوان الفرعي (AR)</Label>
                                        <textarea name="ctaSubtitleAr" defaultValue={getSection('cta')?.contentAr?.subtitle} className="w-full rounded-xl border border-slate-200 p-3 font-arabic" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input name="ctaBtnAr" defaultValue={getSection('cta')?.contentAr?.buttonText} placeholder="الزر الأساسي (AR)" dir="rtl" className="font-arabic" />
                                        <Input name="ctaBtnSecAr" defaultValue={getSection('cta')?.contentAr?.buttonSecondary} placeholder="الزر الثانوي (AR)" dir="rtl" className="font-arabic" />
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : activeTab === 'footer' ? (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            upsertMutation.mutate({
                                key: 'footer',
                                contentEn: { 
                                    address: formData.get('fAddressEn'),
                                    email: formData.get('fEmail'),
                                    phone: formData.get('fPhone'),
                                    copyright: formData.get('fCopyrightEn')
                                },
                                contentAr: { 
                                    address: formData.get('fAddressAr'),
                                    copyright: formData.get('fCopyrightAr')
                                }
                            });
                        }}>
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900">Footer Content Editor</h3>
                                <Button type="submit" disabled={upsertMutation.isPending} className="rounded-full px-8 font-bold">
                                    <Save className="h-4 w-4 mr-2 rtl:ml-2" />
                                    {upsertMutation.isPending ? t('common.loading') : t('common.save')}
                                </Button>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Address (EN)</Label>
                                        <Input name="fAddressEn" defaultValue={getSection('footer')?.contentEn?.address} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Copyright Text (EN)</Label>
                                        <Input name="fCopyrightEn" defaultValue={getSection('footer')?.contentEn?.copyright} />
                                    </div>
                                </div>
                                <div className="space-y-6" dir="rtl">
                                    <div className="space-y-2">
                                        <Label className="font-bold">العنوان (AR)</Label>
                                        <Input name="fAddressAr" defaultValue={getSection('footer')?.contentAr?.address} dir="rtl" className="font-arabic" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">نص حقوق النشر (AR)</Label>
                                        <Input name="fCopyrightAr" defaultValue={getSection('footer')?.contentAr?.copyright} dir="rtl" className="font-arabic" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Global Email</Label>
                                        <Input name="fEmail" defaultValue={getSection('footer')?.contentEn?.email} placeholder="info@partivo.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Global Phone</Label>
                                        <Input name="fPhone" defaultValue={getSection('footer')?.contentEn?.phone} placeholder="+966 ..." />
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="p-20 text-center text-slate-400">
                            <Info className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold italic">Editor for "{activeTab}" is coming in the next sub-phase.</p>
                        </div>
                    )}
                </div>
            </div>
        </CMSPageLayout>
    );
}
