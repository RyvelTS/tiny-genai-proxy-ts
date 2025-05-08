export default (req: any, res: any) => {
    // Set CORS headers for all responses
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    if (!allowedOrigin) {
        console.error('ALLOWED_ORIGIN is not set.');
        return res.status(500).json({ error: 'CORS origin not configured.' });
    }
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight (OPTIONS) requests
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    switch (req.method) {
        case 'GET':
            res.status(200).json({ message: "GET route is working!" });
            break;
        case 'POST':
            res.status(200).json({ message: "POST route is working!" });
            break;
        case 'PUT':
            res.status(200).json({ message: "PUT route is working!" });
            break;
        case 'DELETE':
            res.status(200).json({ message: "DELETE route is working!" });
            break;
        case 'PATCH':
            res.status(200).json({ message: "PATCH route is working!" });
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
            res.status(405).end('Method Not Allowed');
    }
};