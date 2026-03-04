import axios from 'axios';

async function testLogin() {
    try {
        console.log('Testing login for platform@admin.com...');
        const response = await axios.post('http://localhost:3000/auth/login', {
            email: 'platform@admin.com',
            password: 'admin123'
        });
        console.log('Login Success!');
        console.log('Token data:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
