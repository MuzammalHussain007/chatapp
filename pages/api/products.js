// pages/api/products.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db(); // Specify your database name if necessary

    if (req.method === 'POST') {
        const { title, description, price, imageUrl } = req.body;

        // Input validation
        if (!title || !description || !price || !imageUrl) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const productData = {
            title,
            description,
            price: parseFloat(price),
            imageUrl,
            createdAt: new Date().toISOString(),
        };

        try {
            // Insert the new product into the 'products' collection
            const result = await db.collection('products').insertOne(productData);
            return res.status(201).json(result.ops[0]); // Respond with the created product
        } catch (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else if (req.method === 'GET') {
        try {
            // Retrieve all products from the 'products' collection
            const products = await db.collection('products').find({}).toArray();
            return res.status(200).json(products); // Respond with all products
        } catch (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        // Handle any other HTTP methods
        return res.status(405).json({ message: "Method not allowed" });
    }
}