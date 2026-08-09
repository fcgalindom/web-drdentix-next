import type { AlertSeverity } from "@/types/AlertSeverity";
import { AxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export interface AsyncState {
    isLoading: boolean;
    alertMessage: string | null;
    alertSeverity: AlertSeverity;
}

export const useAsyncFormHandler = () => {
    const [state, setState] = useState<AsyncState>({
        isLoading: false,
        alertMessage: null,
        alertSeverity: 'info',
    });

    const controllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            controllerRef.current?.abort();
        };
    }, []);

    const execute = useCallback(async <T,>(
        asyncFunction: (signal: AbortSignal) => Promise<T>,
        successMessage?: string,
        errorMessage?: string
    ): Promise<{ response: T | undefined; message: string; alertSeverity: AlertSeverity }> => {

        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), 31000);
        timeoutRef.current = timeoutId;

        setState({ isLoading: true, alertMessage: null, alertSeverity: 'info' });

        try {
            const response = await asyncFunction(controller.signal);
            clearTimeout(timeoutId);
            const successMsg: string = successMessage || (response as any)?.data?.message || 'Operación completada con éxito.';

            setState({
                isLoading: false,
                alertMessage: successMessage || 'Operación completada con éxito.',
                alertSeverity: 'success',
            });
            return { response, message: successMsg, alertSeverity: 'success' };

        } catch (err) {
            const axiosError = err as AxiosError;

            let finalErrorMessage = errorMessage || 'Ha ocurrido un error inesperado.';

            if (axiosError.code === 'ECONNABORTED' || (err as any).name === 'AbortError') {
                finalErrorMessage = 'La solicitud ha tardado demasiado, intenta de nuevo más tarde (Tiempo de espera agotado).';
            } else if (axiosError.status) {
                if (axiosError.status >= 500) {
                    finalErrorMessage = (axiosError?.response?.data as any)?.message || 'Error interno del servidor. Inténtalo más tarde.';
                } else if (axiosError.status >= 400 && axiosError.status < 500) {
                    if (axiosError.status == 422) {
                        finalErrorMessage = (axiosError.response?.data as any)?.message || 'Error de validación.';
                    } else {
                        finalErrorMessage = 'Solicitud incorrecta o no autorizada.';
                    }
                }
            } else if (axiosError.request) {
                finalErrorMessage = 'Error de red: No se pudo conectar con el servidor.';
            }

            toast.error(finalErrorMessage);

            setState({
                isLoading: false,
                alertMessage: finalErrorMessage,
                alertSeverity: 'error',
            });
            return { response: undefined, message: finalErrorMessage, alertSeverity: 'error' };
        }
    }, []);

    const clearAlert = useCallback(() => {
        setState(prev => ({ ...prev, alertMessage: null }));
    }, []);

    return {
        ...state,
        execute,
        clearAlert,
        Severity: state.alertSeverity,
    };
};
