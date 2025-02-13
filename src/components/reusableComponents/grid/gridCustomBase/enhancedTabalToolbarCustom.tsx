import { Button, Toolbar, Tooltip, Typography } from "@mui/material";
import { SetStateAction } from "react";

interface EnhancedTable {
    setOpenModal?:React.Dispatch<SetStateAction<{open:boolean,action:string}>>,
    selected?:number[]|string[],
    buttons?:{
        stringIcon:string,
        icon:React.ReactNode,
        action:string
    }[], 
}
  

const EnhancedTableCustom = (props: EnhancedTable) =>{
    const { setOpenModal, buttons,selected } = props;
    //const color = stato ? "#F2FAF2" : "#F2FAFE";
    
    return (
        <Toolbar
            sx={{bgcolor:"#F2FAF2"}}
        >
            <Typography
                sx={{ flex: '1 1 100%' }}
                color="inherit"
                variant="subtitle1"
                component="div"
            >
                {selected?.length||0} Selezionate
            </Typography>
            {
                buttons?.map((el)=>{
                    return (
                        <Tooltip className="m-2" title={el.stringIcon}>
                            <Button variant="outlined" onClick={()=>{
                                if(setOpenModal){
                                    setOpenModal({open:true,action:el.action});
                                }
                            }}>
                                {el.icon}
                            </Button>
                        </Tooltip>
                    );
                })
            }
           
        </Toolbar>
    );
};
export default EnhancedTableCustom;