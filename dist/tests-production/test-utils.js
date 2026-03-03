"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = exports.prisma = exports.API_URL = void 0;
exports.login = login;
exports.loginAsAdmin = loginAsAdmin;
exports.headers = headers;
exports.cleanupTestTenant = cleanupTestTenant;
const client_1 = require("@prisma/client");
const supertest = require("supertest");
exports.API_URL = 'http://localhost:3000';
exports.prisma = new client_1.PrismaClient();
exports.request = supertest(exports.API_URL);
async function login(email, password) {
    const res = await exports.request
        .post('/auth/login')
        .send({ email, password });
    if (res.status !== 201 && res.status !== 200) {
        throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
    }
    return res.body.accessToken;
}
async function loginAsAdmin() {
    return login('platform@admin.com', 'admin123');
}
function headers(token, idempotencyKey) {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey || 'test-key-' + Math.random().toString(36).substring(7) + '-' + Date.now()
    };
}
async function cleanupTestTenant(subdomain) {
    const tenant = await exports.prisma.tenant.findUnique({ where: { subdomain } });
    if (tenant) {
        await exports.prisma.tenant.delete({ where: { id: tenant.id } });
    }
}
//# sourceMappingURL=test-utils.js.map