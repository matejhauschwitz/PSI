import { useState, useEffect } from 'react';
import { bookService } from '../services/api';
export function useFeaturedBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadFeaturedBooks();
    }, []);
    const loadFeaturedBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            // Loadneme větší počet knih a pak si vybereme ty s nejvyšším rating
            const response = await bookService.getBooks(1, 50);
            // Sortuj podle rating descending
            const sorted = [...response.books].sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return ratingB - ratingA;
            });
            // Vezmi prvních 6
            setBooks(sorted.slice(0, 6));
        }
        catch (err) {
            setError('Nepodařilo se načíst doporučené knihy');
            console.error('Error loading featured books:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return { books, loading, error };
}
