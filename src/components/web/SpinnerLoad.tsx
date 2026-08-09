import { Backdrop, CircularProgress, Box, keyframes, styled } from '@mui/material';

const spin = keyframes`
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
`;

const LogoBox = styled(Box)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 800,
  color: '#00A6A6',
  letterSpacing: '0.15em',
  animation: `${spin} 2s ease-in-out infinite`,
  userSelect: 'none',
}));

const SpinnerLoad = () => (
  <Backdrop
    open={true}
    sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
      flexDirection: 'column',
      gap: 3,
    }}
  >
    <LogoBox>Dr. Dentix</LogoBox>
    <CircularProgress size={48} sx={{ color: '#00A6A6' }} />
  </Backdrop>
);

export default SpinnerLoad;
