'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export function useCMSContent(key: string) {
    return useQuery({
        queryKey: ['cms-content', key],
        queryFn: async () => {
            const { data } = await apiClient.get(`/api/public/content/${key}`);
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCMSTestimonials() {
    return useQuery({
        queryKey: ['cms-testimonials'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/public/testimonials');
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useCMSFAQs() {
    return useQuery({
        queryKey: ['cms-faqs'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/public/faqs');
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useCMSLegal(type: string) {
    return useQuery({
        queryKey: ['cms-legal', type],
        queryFn: async () => {
            const { data } = await apiClient.get(`/api/public/legal/${type}`);
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}
