// pages/admin/add-product.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AddProduct() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const productData = { title, description, price, imageUrl };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                alert('Product added successfully!');
           //     router.push('/admin/dashboard'); // Redirect to admin dashboard
            } else {
                alert('Error adding product');
            }
        } catch (error) {
            console.error('An error occurred:', error);
            alert('An error occurred while adding the product.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title:
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring focus:ring-blue-500 focus:outline-none"
                        />
                    </label>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description:
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                    </label>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price:
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring focus:ring-blue-500 focus:outline-none"
                        />
                    </label>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL:
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            required
                            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring focus:ring-blue-500 focus:outline-none"
                        />
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`mt-4 w-full p-2 text-white font-semibold rounded-md focus:outline-none 
                        ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? 'Adding...' : 'Add Product'}
                </button>
            </form>
        </div>
    );
}