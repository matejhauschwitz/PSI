import { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import api from '../services/api';
export function useHomeStats() {
    const [totalBooks, setTotalBooks] = useState(0);
    const [totalGenres, setTotalGenres] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [bestseller, setBestseller] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadStats();
    }, []);
    const loadStats = async () => {
        try {
            setLoading(true);
            // Počet knih - loadneme prvních knihu a z response si vezmeme totalRecords
            const booksResponse = await bookService.getBooks(1, 1);
            setTotalBooks(booksResponse.totalRecords);
            // Počet žánrů
            const genres = await bookService.getGenres();
            setTotalGenres(genres.length);
            // Počet uživatelů
            try {
                const response = await api.get('/user/count');
                setTotalUsers(response.data.count || 0);
            }
            catch (err) {
                console.error('Error loading user count:', err);
            }
            // Bestseller - kniha s nejvyšším rating
            const featuredResponse = await bookService.getBooks(1, 50);
            if (featuredResponse.books.length > 0) {
                const topBook = [...featuredResponse.books].sort((a, b) => {
                    const ratingA = a.rating || 0;
                    const ratingB = b.rating || 0;
                    return ratingB - ratingA;
                })[0];
                setBestseller(topBook);
            }
        }
        catch (err) {
            console.error('Error loading home stats:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return { totalBooks, totalGenres, totalUsers, bestseller, loading };
}
