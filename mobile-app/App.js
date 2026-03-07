import React from 'react';
import { LanguageProvider } from './src/i18n/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    return (
        <LanguageProvider>
            <AppNavigator />
        </LanguageProvider>
    );
}
