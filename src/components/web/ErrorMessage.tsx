import { Typography } from '@mui/material';

interface Props {
  message?: string;
}

const ErrorMessage = ({ message }: Props) => {
  if (!message) return null;

  return (
    <Typography
      sx={{
        color: 'red',
        fontSize: 12,
        marginTop: 0.5,
      }}
      role="alert"
    >
      {message}
    </Typography>
  );
};

export default ErrorMessage;
