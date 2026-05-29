import { Skeleton, TableBody, TableCell, TableRow } from "@mui/material";

const SkeletonGridLoading: React.FC<{columnLength:number, rowLength:number}>  = ({columnLength, rowLength}) => {

  let columns:number[] = [];
  let rows:number[] = [];
  for(let i = 0; i < columnLength; i++){
    columns = [...columns, ...[i]];
  }

  for(let i = 0; i < rowLength; i++){
    rows = [...rows, ...[i]];
  }

  return(
    <TableBody>
      {columns.map((el,i) => {
        return (
          <TableRow  key={i}>
            {rows.map((el,i) => {
              return (
                <TableCell key={i} align="center">
                  <Skeleton variant="text" sx={{ width: "90%", mx: "auto" }} />
                </TableCell>
              );
            })}
          </TableRow>);}
      )}
    </TableBody>
  );
    
};

export default SkeletonGridLoading;