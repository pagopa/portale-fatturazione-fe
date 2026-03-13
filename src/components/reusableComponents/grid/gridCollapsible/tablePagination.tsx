import { TablePagination } from "@mui/material";

const TablePaginationDemo = ({setPage, page, rowsPerPage, setRowsPerPage,count,updateFilters,pathPage,body}) => {
        
   
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
        updateFilters({
            pathPage:pathPage,
            ...body,
            page:newPage,
            rows:10,
        });
    };
        
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        updateFilters({
            pathPage:pathPage,
            ...body,
            page:0,
            rows:parseInt(event.target.value, 10)
        });
    };
        
    return (
        <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />  
    );
};

export default TablePaginationDemo;
