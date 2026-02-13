import { Chip, TableCell, TableRow, Tooltip } from "@mui/material";


const RowModCommessaPrevisionale = ({sliced,headerNames,element}) => {
    let statusColor = "#ffffff";
    if(sliced.source === "obbligatorio"){
        statusColor = "#5BB0D5";
    }else if(sliced.source === "archiviato"){
        statusColor =  "#fafafa";
    }else if(sliced.source === "facoltativo"){
        statusColor = "#f7e7bc";
    }

    return (
        <TableRow key={element.id} sx={{
            borderTop:"4px solid #F2F2F2",
            borderBottom: "2px solid #F2F2F2",
            '&:hover': {
                backgroundColor: '#EDEFF1',
            },
        }} >
            {
                Object.values(sliced).map((value:any, i:number)=>{
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                    const valueEl = (i === 0 && value?.toString().length > 20) ? value?.toString().slice(0, 20) + '...' : value;

                    if(headerNames[i]?.chip){
                        return (
                            <TableCell
                                key={Math.random()}
                                align={headerNames[i]?.align}>
                                <Chip variant="outlined" label={ value?.charAt(0)?.toUpperCase() + value?.slice(1)?.toLowerCase()} sx={{backgroundColor:statusColor}} />
                            </TableCell>
                        );
                    }else if(headerNames[i]?.gridAction){
                        return (
                            <TableCell
                                key={i}
                                align={headerNames[i]?.align}>
                                {headerNames[i]?.gridAction("primary",false,element)}                
                            </TableCell>
                        );
                    }else{
                        return(
                            <>
                                {value !== "--" ?
                                    <Tooltip key={Math.random()} title={i === 0 && value?.length >= 20 ? value : undefined}  placement="right">
                                        <TableCell
                                            onClick={()=> headerNames[i]?.rowAction && headerNames[i]?.rowAction(element)}
                                            sx={cssFirstColum}
                                            align={headerNames[i]?.align}>
                                            {valueEl}
                                            
                                        </TableCell>
                                    </Tooltip>: 
                                    <TableCell
                                        key={Math.random()}
                                        align={headerNames[i]?.align}>
                                        {value} 
                                    </TableCell>
                                }
                            </>
                        );

                    }
                  
                   
                })
            }
        </TableRow>
    );
};

export default RowModCommessaPrevisionale;