import { Checkbox, TableCell, TableRow, Tooltip } from "@mui/material";
import { Whitelist } from "../../../../page/listaDocEmessi";

interface RowWhite {
    sliced:any,
    apiGet:any,
    handleClickOnGrid:any,
    element:any,
    stateHeaderCheckbox:{checked:boolean,disabled:boolean},
    setSelected:any,
    checkIfChecked:any,
    selected:number[]

}


const RowWhiteList :React.FC<RowWhite>  = ({sliced, apiGet, handleClickOnGrid, element,stateHeaderCheckbox, setSelected,selected,checkIfChecked}) => {

    

  
    

    const handleCheckSingleRow = () => {

        if(checkIfChecked(element.idWhite)){
            const newSelected =  selected.filter((el) => el !== element.idWhite);
            setSelected(newSelected);
        }else{
            setSelected((prev)=>([...prev,...[element.idWhite]]));
        }
       
       
    };
    console.log(sliced);

    return (
        <TableRow key={element.idWhite}>
            <Checkbox onClick={handleCheckSingleRow} disabled={stateHeaderCheckbox.disabled} checked={stateHeaderCheckbox.checked ? stateHeaderCheckbox.checked : checkIfChecked(element.idWhite)} />
            {
                Object.values(sliced).map((value:any, i:number)=>{
                    // stato per loa switch utilizzato nella page tipologia contratto
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                    const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 50) + '...' : value;
                
                    return (
                        <Tooltip key={Math.random()} title={value}>
                            <TableCell sx={cssFirstColum}>
                                {valueEl}
                            </TableCell>
                        </Tooltip>
                    );
                    
                })
            }
        </TableRow>
    );
};

export  default RowWhiteList;