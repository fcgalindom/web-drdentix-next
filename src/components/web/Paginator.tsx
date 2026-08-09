import { Box, Pagination } from '@mui/material';
import type { PaginatedResponse } from '@/interfaces/index';

interface Props {
  paginator: PaginatedResponse<unknown> | null;
  page: number;
  setPage: (n: number) => void;
}

const Paginator = ({ paginator, page, setPage }: Props) => {
  if (!paginator || paginator.last_page <= 1) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Pagination
        count={paginator.last_page}
        page={page}
        onChange={(_, value) => setPage(value)}
        variant="outlined"
        color="primary"
        shape="rounded"
      />
    </Box>
  );
};

export default Paginator;
