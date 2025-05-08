export default (req: any, res: any) => {
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