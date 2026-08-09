import { Snackbar, Alert } from '@mui/material';
import type { AlertSeverity } from '@/types/AlertSeverity';

interface Props {
  severity: AlertSeverity;
  message: string | null;
  open: boolean;
  onClose: () => void;
}

const AlertGeneric = ({ severity, message, open, onClose }: Props) => (
  <Snackbar
    open={open}
    autoHideDuration={3000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  >
    <Alert
      onClose={onClose}
      severity={severity}
      variant="filled"
      sx={{ width: '100%', boxShadow: 10, alignItems: 'center' }}
    >
      {message}
    </Alert>
  </Snackbar>
);

export default AlertGeneric;
