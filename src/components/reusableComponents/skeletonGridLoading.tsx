import { Skeleton, TableCell, TableRow } from "@mui/material";

const SkeletonGridLoading: React.FC<{columnLength:number, rowLength:number}>  = ({columnLength, rowLength}) => {

    let columns:number[] = [];
    let rows:number[] = [];
    console.log({columnLength});
    for(let i = 0; i < columnLength; i++){
      
        columns = [...columns, ...[i]];
    }

    for(let i = 0; i < rowLength; i++){
        rows = [...rows, ...[i]];
    }
    console.log({columns,rows});
    return(
        <>
            {columns.map((el,i) => {
                return (<TableRow key={i}>
                    {rows.map((el,i) => {
                        return (
                            <TableCell key={i}>
                                <Skeleton variant="text"/>
                            </TableCell>
                
                        );
                    })}
           
                </TableRow>);}
            )}
        </>
    );
    
};

export default SkeletonGridLoading;