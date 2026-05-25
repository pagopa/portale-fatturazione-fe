import { Box, TableCell, TableCellProps, TableRow, Typography } from "@mui/material";

const NoDataRow = ({ colSpan, noDataTitle, noDataMessage, align="center" }: { colSpan: number, noDataTitle:string, noDataMessage?:string, align?:TableCellProps["align"]  }) => {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        sx={{
          py: 6,
          color: "text.secondary",
          fontSize: "16px",
          fontStyle: "italic",
          backgroundColor: "#fafafa",
          border: "1px dashed #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: align, gap: 1 }}>
          <Typography variant="h6" color="text.secondary">
            {noDataTitle}
          </Typography>
          {noDataMessage && 
          <Typography variant="body2" color="text.disabled">
            {noDataMessage}
          </Typography>
          }
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default NoDataRow;