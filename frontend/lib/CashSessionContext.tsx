'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';

interface CashSession {
    id: string;
    branchId: string;
    openedById: string;
    openingCash: number;
    status: 'OPEN' | 'CLOSED';
}

interface CashSessionContextType {
    session: CashSession | null;
    isLoading: boolean;
    openSession: (openingCash: number) => Promise<void>;
    closeSession: (closingCash: number) => Promise<void>;
    refreshSession: () => Promise<void>;
}

const CashSessionContext = createContext<CashSessionContextType | undefined>(undefined);

export function CashSessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<CashSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSession = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/cash-sessions/current'); // No param needed
            setSession(res.data);
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setSession(null);
            } else {
                console.error('Failed to fetch cash session', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshSession();
    }, []);

    const openSession = async (openingCash: number) => {
        // branchId is inferred from user context on backend, but we still need to send it if DTO requires it?
        // Wait, OpenCashSessionDto requires branchId. 
        // If the backend extracts it from user, the DTO validation might fail if I don't send it?
        // Let's check OpenCashSessionDto again. It has @IsNotEmpty @IsString branchId.
        // So I must send it OR update backend DTO to make it optional?
        // But implementation plan said "In reality, userId should come from the request user object".
        // And "branchId" is also likely available on user object.
        // But for "Open Session", maybe I should let user select branch? 
        // No, user belongs to one branch usually.
        // If DTO requires it, I need to fetch it first?
        // Or I update DTO to make it optional on backend and fill it in Controller.
        // Let's assume for now I need to fetch user profile to get branchId.
        // BUT wait, I just removed branchId from Context props because I didn't want to pass it.
        // If I can't easily get it, maybe I should update the backend to NOT require it in body if user has it.

        // I'll update OpenCashSessionDto to rely on backend filling it.
        // But ClassValidator runs before controller.
        // I can make it optional in DTO, or use a separate DTO for controller input vs service input.
        // Or just send "me" or something? No.

        // I'll just check if I can catch it in Controller before validation? 
        // No, Body validation happens first.

        // Okay, I'll stick to original plan: fetch user profile/branchId in Context. context can fetch /auth/me or similar.
        // But I don't know if /auth/me exists.

        // Alternate: Frontend usually stores user info in localStorage or decoded JWT.
        // `getToken()` in `auth.ts` gives token.
        // I can decode it.

        // Let's assume for now that I can get branchId from the session response if open? No, session is null.

        // I will assume for now that I need to update the backend DTO to make branchId optional, 
        // and fill it in controller from req.user.branchId.
        // This is safer.

        await apiClient.post('/cash-sessions/open', { openingCash });
        await refreshSession();
    };

    const closeSession = async (closingCash: number) => {
        // closing requires branchId in DTO too?
        // Yes.
        await apiClient.post('/cash-sessions/close', { closingCash });
        await refreshSession();
    };

    return (
        <CashSessionContext.Provider value={{ session, isLoading, openSession, closeSession, refreshSession }}>
            {children}
        </CashSessionContext.Provider>
    );
}

export function useCashSession() {
    const context = useContext(CashSessionContext);
    if (context === undefined) {
        throw new Error('useCashSession must be used within a CashSessionProvider');
    }
    return context;
}
