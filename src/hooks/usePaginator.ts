import { useState, useEffect, useCallback, useRef } from 'react';
import type { PaginatedResponse } from '@/interfaces/index';

export function usePaginator<T, F>(
    apiCall: (params: F & { page: number }) => Promise<PaginatedResponse<T>>,
    initialFilters: F
) {
    const [items, setItems] = useState<T[]>([]);
    const [paginator, setPaginator] = useState<PaginatedResponse<T> | null>(null);
    const [filters, setFilters] = useState<F>(initialFilters);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const apiCallRef = useRef(apiCall);
    apiCallRef.current = apiCall;

    const fetchData = useCallback(async (currentFilters: F, pageNum: number) => {
        setLoading(true);
        try {
            const response = await apiCallRef.current({ ...currentFilters, page: pageNum });
            setItems(response.data);
            setPaginator(response);
        } catch (error) {
            console.error("Error en paginación:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(filters, page);
    }, [page, fetchData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        setPage(1);
        fetchData(filters, 1);
    };

    const refresh = () => {
        fetchData(filters, page);
    };

    const updateLocalItem = useCallback((id: number | string, updatedFields: Partial<T>, key: keyof T = 'id' as keyof T) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item[key] === id ? { ...item, ...updatedFields } : item
            )
        );
    }, []);

    return {
        items, setItems, paginator, filters, setFilters,
        page, setPage, loading, refresh, handleChange, handleFilter, updateLocalItem
    };
}
