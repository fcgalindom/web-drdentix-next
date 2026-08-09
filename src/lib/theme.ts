'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#013253' },
    secondary: { main: '#00AFF1' },
    success: { main: '#7CB91D' },
    error: { main: '#FE0000' },
  },
  typography: {
    fontFamily: 'inherit',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
  },
});

export default theme;
