import { TableCell, TableCellProps, TableRow, Tooltip } from "@mui/material";
import { month } from "../../../../reusableFunction/reusableArrayObj";
interface RowWhite<T = any> {
    element:any,
    headerNames:{
      label:string,
      align:TableCellProps['align'],
      width:number|string,
      keyValue:string,
      gridAction?:(fun:(obj:T,action:string) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    }[],
    setOpenModalAction?: (obj:T, action:string) => void;
}


const RowWhiteList :React.FC<RowWhite>  = ({element,headerNames,setOpenModalAction}) => {

  return (
    <TableRow  sx={{
      height: '80px',
      borderTop: '4px solid #F2F2F2',
      borderBottom: '2px solid #F2F2F2',
      //backgroundColor:bgColorRow,
      '&:hover': {
        backgroundColor: '#EDEFF1',
      },
    }}>
     
      {
        Object.values(headerNames).map((header:any, i:number)=>{
          // stato per loa switch utilizzato nella page tipologia contratto
          const cssFirstColum = header.keyValue === "ragioneSociale" ? {color:'#0D6EFD', fontWeight: 'bold'} : null;
          const valueEl = (header.keyValue === "ragioneSociale" && element[header.keyValue]?.toString().length > 20) ? element[header.keyValue]?.toString().slice(0, 20) + '...' : element[header.keyValue];
          if(headerNames[i]?.gridAction){
            return (
              <TableCell
                key={i}
                align={headerNames[i]?.align}>
                {headerNames[i]?.gridAction((obj, action) => setOpenModalAction?.(obj, action), "primary", false, element)}
              </TableCell>
            );
          }if(header.keyValue === "mese"){
            return (
              <TableCell
                key={i}
                align={headerNames[i]?.align}>
                {month[element.mese-1]}
              </TableCell>
            );
          }else{
            return (
              <Tooltip key={Math.random()} title={(element[header.keyValue]?.toString().length > 20 && i === 0) ? element[header.keyValue] : null}>
                <TableCell align="center" sx={cssFirstColum}>
                  {valueEl}
                </TableCell>
              </Tooltip>
            );
          }
           
        })
      }
    </TableRow>
  );
};

export  default RowWhiteList;