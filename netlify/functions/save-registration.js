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