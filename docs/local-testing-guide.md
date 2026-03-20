# Partivo Local Testing Guide

## 1. Local Service URLs
- **Backend API**: `http://localhost:3000`
- **Platform Admin Portal**: `http://localhost:3003/platform/`
- **Tenant Admin Portal**: `http://localhost:3003/tenant/`
- **Customer Portal**: `http://localhost:3004`
- **Driver Mobile App API**: `http://localhost:3000`
- **POS Mobile App API**: `http://localhost:3000`

*Note: The frontend packages use unique ports respectively. The Backend handles request routing based on the origin.*

## 2. Startup Commands
**Database & Backend:**
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run seed:demo
npm run start:dev
```

**Frontend Portals (Platform & Tenant Admin):**
```bash
cd frontend
npm install
npm run dev
```

**Customer Portal:**
```bash
cd admin-panel
npm install
npm run dev
```

**Mobile Apps:**
```bash
cd mobile-app
npm install
npx expo start
```

## 3. Mobile APK Builds
The mobile apps are built using React Native and Expo. You can generate an APK build for Android locally.

**Build Commands:**
```bash
cd mobile-app
npm install -g eas-cli
eas build --platform android --profile preview
```

**Installation Instructions:**
1. Wait for the EAS build to complete and download the `.apk` file.
2. Transfer the `.apk` file to your Android test device.
3. Enable "Install from Unknown Sources" in your device security settings.
4. Tap the APK file to install and open the application.

*Alternative: You can test directly through the Expo Go app during development by scanning the QR code resulting from `npx expo start`.*

## 4. Test Credentials
*These default users are loaded via the `npm run seed:demo` script.*

**Platform Admin**
- **Email**: `platform@admin.com`
- **Password**: `admin123`

**Tenant Admin (Alpha Motors)**
- **Email**: `admin@alpha.com`
- **Password**: `tenant123`

**POS Cashier**
- **Email**: `cashier@alpha.com`
- **Password**: `Pos123!`

**Driver**
- **Email**: `driver@alpha.com`
- **Password**: `Driver123!`

**Customer**
- **Email**: `customer1@alpha.com`
- **Password**: `Customer123!`

## 5. Test Tenant Information
- **Tenant Name**: Alpha Motors
- **Subdomain / Tenant ID**: alpha
- **Default Warehouse / Branch**: Main Branch
- **Base Currency**: EGP (Supported: EGP, USD, EUR)
- **Default Tax Rate**: Standard VAT (15%)
- **Default Suppliers**: Global Parts Corp, Local Auto Parts Egy
- **Default Inventory**: 30 stocked products (e.g. Bosch Oil Filter, NGK Spark Plugs, Brembo Brake Pads) with pre-allocated quantities across several categories.

## 6. API Documentation Base Routes
The backend NestJS API routes generally map to the following paths:

- **Authentication**: `POST http://localhost:3000/auth/login`
- **Products/Inventory**: `GET http://localhost:3000/public/inventory`
- **Orders**: `POST http://localhost:3000/orders`
- **Drivers**: `GET http://localhost:3000/logistics/drivers`
- **POS Sales**: `POST http://localhost:3000/sales`

*(Example Local cURL for Authentication)*:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alpha.com", "password": "tenant123"}'
```

## 7. Driver App Test Flow
1. **Login**: Inside the Driver App section, authenticate using the driver credentials.
2. **View Trips**: Check the "Assigned Trips" tab to discover assigned local logistics jobs.
3. **Accept Trip**: Select a pending trip and tap "Accept" to begin navigation.
4. **Pick Up Order**: Mark the logistics order components as "Picked Up" upon verifying goods at the "Main Branch".
5. **Navigate**: Use the routing view to map out to the local destination coordinates.
6. **Mark Delivered**: Tap on the active delivery stop and record the completed status.
7. **Upload Proof**: Trigger the camera component to take a photo of the completed delivery. Upload the proof configuration.

## 8. POS App Test Flow
1. **Login**: Launch the POS App workflow and log in with Cashier credentials.
2. **Search Products**: Type "Bosch" or "Brake Pads" in the lookup bar.
3. **Scan Barcode**: Use the barcode scanner button to emulate reading a product ID.
4. **Add Items to Cart**: Select an item variant and confirm addition to the POS shopping cart.
5. **Checkout**: Review the total amounts (which will dynamically apply the 15% Standard VAT).
6. **Select Payment Method**: Select "CASH" or "CARD" methods.
7. **Complete Sale**: Finalize the transaction to generate a local receipt entry in the backend `sales` table.
8. **View Sales History**: Check the previous shift's transactions and verify your recent checkout exists.

## 9. System Health Verification Checklist
- [ ] Backend is running at `http://localhost:3000` with no compilation errors.
- [ ] Database migrations applied and `npm run seed:demo` injected all data and the added Driver, Cashier, and Customer accounts.
- [ ] Platform admin login works smoothly inside `http://localhost:3003/platform/`.
- [ ] Tenant admin login routes correctly inside `http://localhost:3003/tenant/` showing "Alpha Motors".
- [ ] Customer portal inside `http://localhost:3004` loads the Alpha Motors Parts catalog.
- [ ] Mobile Expo terminal builds successfully and can communicate with the backend on port 3000.
- [ ] End-to-end POS checkout generates a completed backend transaction.
- [ ] Driver app login authenticates successfully with its allocated routing endpoints.
