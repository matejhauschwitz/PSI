import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { bookService, commentService } from '../services/api';
export function useBookDetail() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavourite, setIsFavourite] = useState(false);
    const bookId = Number(id);
    const loadComments = useCallback(async () => {
        if (!bookId)
            return;
        try {
            const commentsData = await commentService.getComments(bookId);
            setComments(commentsData);
        }
        catch (err) {
            console.error('Error loading comments:', err);
        }
    }, [bookId]);
    useEffect(() => {
        if (bookId) {
            loadBook();
            loadComments();
        }
    }, [bookId, loadComments]);
    const loadBook = async () => {
        if (!bookId)
            return;
        try {
            setLoading(true);
            setError(null);
            const bookData = await bookService.getBook(bookId);
            setBook(bookData);
        }
        catch (err) {
            setError('Nepodařilo se načíst detaily knihy');
            console.error('Error loading book:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const toggleFavourite = async () => {
        if (!bookId)
            return;
        try {
            if (isFavourite) {
                await bookService.removeFavourite(bookId);
            }
            else {
                await bookService.addFavourite(bookId);
            }
            setIsFavourite(!isFavourite);
        }
        catch (err) {
            console.error('Error toggling favourite:', err);
        }
    };
    const addComment = async (comment) => {
        try {
            await commentService.addComment(comment);
            // Znovu načteme komentáře po přidání
            await loadComments();
            return true;
        }
        catch (err) {
            console.error('Error adding comment:', err);
            throw err;
        }
    };
    return {
        book,
        comments,
        loading,
        error,
        isFavourite,
        toggleFavourite,
        addComment,
        bookId
    };
}
