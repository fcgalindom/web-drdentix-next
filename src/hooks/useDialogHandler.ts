import { useState, useCallback } from 'react';

export interface DialogNames {
    create: string;
    edit?: string;
}

export const useDialogHandler = (names: DialogNames) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [id, setId] = useState<number>(0);

    const handleOpen = useCallback((editId?: number) => {
        if (editId) {
            setId(editId);
            setTitle(names.edit || '');
        } else {
            setId(0);
            setTitle(names.create);
        }
        setOpen(true);
    }, [names]);

    const handleClose = useCallback(() => {
        setOpen(false);
        setTimeout(() => setId(0), 300);
    }, []);

    return { open, title, id, handleOpen, handleClose };
};

export default useDialogHandler
