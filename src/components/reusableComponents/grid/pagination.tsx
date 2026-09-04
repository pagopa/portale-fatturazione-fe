import React from 'react';
import TablePagination from '@mui/material/TablePagination';

interface CustomTablePaginationProps {
  total: number;
  page: number;
  rows: number;
  changePage: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  changeRow: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const CustomTablePagination: React.FC<CustomTablePaginationProps> = ({
  total,
  page,
  rows,
  changePage,
  changeRow,
}) => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem' }}>
      <TablePagination
        sx={{
          '.MuiTablePagination-toolbar': {
            justifyContent: 'flex-end',
            width: '100%',
          },
          '.MuiTablePagination-selectLabel': {
            display: 'none',
            backgroundColor: '#f2f2f2',
          },
        }}
        component="div"
        page={total > 0 ? page : 0}
        count={total}
        rowsPerPage={rows}
        onPageChange={changePage}
        onRowsPerPageChange={changeRow}
      />
    </div>
  );
};

export default CustomTablePagination;