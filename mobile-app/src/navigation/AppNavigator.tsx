import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BRAND from '../config/brand';

// Driver Screens
import DriverLoginScreen from '../screens/driver/DriverLoginScreen';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import DeliveryDetailScreen from '../screens/driver/TripDetailScreen';

// Warehouse Screens
import WarehouseLoginScreen from '../screens/warehouse/WarehouseLoginScreen';
import WarehouseHomeScreen from '../screens/warehouse/WarehouseHomeScreen';
import StockLookupScreen from '../screens/warehouse/StockLookupScreen';
import PickListScreen from '../screens/warehouse/PickListScreen';

// POS Screens
import POSLoginScreen from '../screens/pos/POSLoginScreen';
import POSHomeScreen from '../screens/pos/POSHomeScreen';
import ProductSearchScreen from '../screens/pos/ProductSearchScreen';
import CartScreen from '../screens/pos/CartScreen';
import CheckoutScreen from '../screens/pos/CheckoutScreen';
import SalesHistoryScreen from '../screens/pos/SalesHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
    headerStyle: { backgroundColor: '#FFFFFF' },
    headerTintColor: BRAND.colors.textPrimary,
    headerTitleStyle: { fontWeight: '700' as const },
};

function DriverStack() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="DriverLogin" component={DriverLoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DriverHome" component={DriverHomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} options={{ title: 'Delivery Details' }} />
        </Stack.Navigator>
    );
}

function WarehouseStack() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="WarehouseLogin" component={WarehouseLoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="WarehouseHome" component={WarehouseHomeScreen} options={{ title: 'Warehouse' }} />
            <Stack.Screen name="StockLookup" component={StockLookupScreen} options={{ title: 'Stock Lookup' }} />
            <Stack.Screen name="PickList" component={PickListScreen} options={{ title: 'Pick Lists' }} />
        </Stack.Navigator>
    );
}

function POSStack() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="POSLogin" component={POSLoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="POSHome" component={POSHomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProductSearch" component={ProductSearchScreen} options={{ title: 'Products' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
            <Stack.Screen name="SalesHistory" component={SalesHistoryScreen} options={{ title: 'Sales History' }} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: BRAND.colors.primary,
                    tabBarInactiveTintColor: '#94A3B8',
                    tabBarStyle: { borderTopColor: '#E2E8F0' },
                }}
            >
                <Tab.Screen name="DriverApp" component={DriverStack} options={{ title: 'Driver', tabBarIcon: () => null }} />
                <Tab.Screen name="POSApp" component={POSStack} options={{ title: 'POS', tabBarIcon: () => null }} />
                <Tab.Screen name="WarehouseApp" component={WarehouseStack} options={{ title: 'Warehouse', tabBarIcon: () => null }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
