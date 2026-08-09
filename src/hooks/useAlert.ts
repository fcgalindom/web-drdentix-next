import { useState } from "react"
import type { AlertSeverity } from "@/types/AlertSeverity"

export interface IAlert {
    message: string
    severity: AlertSeverity
    open: boolean
}

export const useAlert = () => {
    const [alert, setAlert] = useState<IAlert>({ open: false, message: '', severity: 'info' })

    const showAlert = (message: string, severity: AlertSeverity = 'info') => {
        setAlert({ open: true, message: message, severity: severity })
    }

    const hideAlert = () => {
        setAlert(prev => ({ ...prev, open: false }))
    }

    return { alert, showAlert, hideAlert }
}

export default useAlert
