'use client';

import { ShellLayout } from '@/components/shell-layout';
import { NavItem } from '@/components/nav-item';
import { ShoppingBag, ListOrdered, Wallet, Receipt, XCircle } from 'lucide-react';
import { CashSessionProvider } from '@/lib/CashSessionContext';
import { OpenSessionModal } from '@/components/pos/open-session-modal';

export default function BranchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CashSessionProvider>
            <ShellLayout
                title="Branch POS"
                navigation={
                    <>
                        <NavItem href="/branch" icon={ShoppingBag} label="POS" />
                        <NavItem href="/branch/orders" icon={ListOrdered} label="Orders" />
                        <NavItem href="/branch/cash-drawer" icon={Wallet} label="Cash Drawer" />
                        <NavItem href="/branch/receipts" icon={Receipt} label="Receipts" />
                        <NavItem href="/branch/close-day" icon={XCircle} label="Close Day" />
                    </>
                }
            >
                {children}
                <OpenSessionModal />
            </ShellLayout>
        </CashSessionProvider>
    );
}
