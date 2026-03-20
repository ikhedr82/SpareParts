const axios = require('axios');

async function testApi() {
    try {
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'platform@admin.com',
            password: 'admin123'
        });
        const token = loginRes.data.accessToken;

        console.log('Got token:', token.substring(0, 20) + '...');

        const result = await axios.get('http://localhost:3000/api/platform/tenants', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Tenants:', result.data);

        const stats = await axios.get('http://localhost:3000/api/platform/tenants/billing/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Stats:', stats.data);
    } catch (error) {
        console.error('Test Failed');
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testApi();
