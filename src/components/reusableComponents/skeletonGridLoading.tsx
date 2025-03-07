import { Skeleton, TableCell, TableRow } from "@mui/material";

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