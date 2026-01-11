const Razorpay = require('razorpay');

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { name, email, whatsapp } = JSON.parse(event.body);

        console.log('Creating order for:', name, email);

        // Get keys from environment variables
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // Debug: Check if keys are loaded (don't log actual values in production!)
        console.log('Key ID exists:', !!keyId);
        console.log('Key Secret exists:', !!keySecret);

        if (!keyId || !keySecret) {
            console.error('Missing Razorpay credentials');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Razorpay credentials not configured',
                    debug: {
                        hasKeyId: !!keyId,
                        hasKeySecret: !!keySecret
                    }
                })
            };
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });

        // Create order
        const options = {
            amount: 19900, // ₹199 in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: { 
                name, 
                email, 
                whatsapp 
            }
        };

        console.log('Creating Razorpay order with options:', options);

        const order = await razorpay.orders.create(options);

        console.log('Order created successfully:', order.id);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(order)
        };

    } catch (error) {
        console.error('Error creating order:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to create order',
                details: error.message,
                stack: error.stack
            })
        };
    }
};
