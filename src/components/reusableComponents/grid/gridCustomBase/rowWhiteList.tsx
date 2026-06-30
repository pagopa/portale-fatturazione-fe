import { TableCell, TableCellProps, TableRow, Tooltip } from "@mui/material";
interface RowWhite {
    element:any,
    setSelected:any,
    checkIfChecked:any,
    selected:number[],
    headerNames:{label:string,align:TableCellProps['align'],width:number|string,keyValue:string,
    gridAction?:(fun:(id) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    }[]
}


const RowWhiteList :React.FC<RowWhite>  = ({element, setSelected,selected,checkIfChecked,headerNames}) => {

  const handleCheckSingleRow = () => {
    if(checkIfChecked(element.idWhite)){
      const newSelected =  selected.filter((el) => el !== element.idWhite);
      setSelected(newSelected);
    }else{
      setSelected((prev)=>([...prev,...[element.idWhite]]));
    }
  };
  console.log({headerNames});

  const test = (a) => {
    return a;
  };
  return (
    <TableRow  sx={{
      height: '80px',
      borderTop: '4px solid #F2F2F2',
      borderBottom: '2px solid #F2F2F2',
      '&:hover': {
        backgroundColor: '#EDEFF1',
      },
    }}>
     
      {
        Object.values(headerNames).map((header:any, i:number)=>{
          // stato per loa switch utilizzato nella page tipologia contratto
          const cssFirstColum = header.keyValue === "ragioneSociale" ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
          const valueEl = (header.keyValue === "ragioneSociale" && element[header.keyValue]?.toString().length > 20) ? element[header.keyValue]?.toString().slice(0, 20) + '...' : element[header.keyValue];
          if(headerNames[i]?.gridAction){
            return (
              <TableCell
                key={i}
                align={headerNames[i]?.align}>
                {headerNames[i]?.gridAction(test(1),"primary",false,element)}                
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