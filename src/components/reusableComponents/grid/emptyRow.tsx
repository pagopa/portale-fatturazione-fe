import { TableRow, TableCell, Typography } from "@mui/material";

const EmptyRow = ({ sentenseEmpty }: { sentenseEmpty: string }) => {
  return (
    <TableRow key="no-data">
      <TableCell colSpan={100} align="left">
        <Typography fontWeight="bold">{sentenseEmpty}</Typography>
      </TableCell>
    </TableRow>
  );
};

export default EmptyRow;