import type { AxiosResponse } from "axios";
import type { ChangeEvent } from "react";

export interface ToggleOptions<T> {
    setItems: React.Dispatch<React.SetStateAction<T[]>>;
    apiCall: (newValue: boolean, id: number) => Promise<AxiosResponse<T>>
    refresh: () => void
    fieldName?: keyof T;
}

export interface Identifiable {
    id: number
}

export function useStatusToggle<T extends Identifiable>(options: ToggleOptions<T>) {
    const { setItems, apiCall, fieldName = "is_active" as keyof T, refresh } = options;

    const setStatus = (id: number, fieldName: keyof T, value: boolean) => {
        setItems((prev: T[]) =>
            prev.map((i: T) => (i.id === id ? { ...i, [fieldName]: value } : i)),
        );
    };

    const handleChangeActive = async (
        event: ChangeEvent<HTMLInputElement>,
        item: T,
        limit: number | null = null,
        length: number | null = null,
    ) => {
        const originalValue = !!item[fieldName];
        const newValue = event.target.checked;
        const id = item.id;

        if (limit && length) {
            if (length >= limit && event.target.checked == true) {
                setStatus(id, fieldName, originalValue);
                alert(`Solamente pueden estar ${limit} item(s) activo(s) a la vez`);
                return;
            }
        }

        setStatus(id, fieldName, newValue);

        try {
            await apiCall(newValue, id);
            refresh();
        } catch (error) {
            setStatus(id, fieldName, originalValue);
            console.error("Error al actualizar estado:", error);
        }
    };

    return { handleChangeActive };
}
