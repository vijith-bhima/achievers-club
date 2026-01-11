const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { 
            name, 
            email, 
            whatsapp, 
            payment_id, 
            order_id, 
            amount,
            status,
            failure_reason
        } = JSON.parse(event.body);

        const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;

        if (!GOOGLE_SHEET_URL) {
            throw new Error('Google Sheet URL not configured');
        }

        const timestamp = new Date().toISOString();

        const response = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                whatsapp,
                payment_id,
                order_id,
                amount: amount || 199,
                status: status || 'success',
                failure_reason: failure_reason || '',
                timestamp
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save to Google Sheets');
        }

        const result = await response.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                message: 'Registration saved successfully',
                data: result
            })
        };

    } catch (error) {
        console.error('Error saving registration:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false,
                error: 'Failed to save registration',
                details: error.message 
            })
        };
    }
};
