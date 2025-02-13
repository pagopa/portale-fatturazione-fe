import { Button, Toolbar, Tooltip, Typography } from "@mui/material";
import { SetStateAction } from "react";

interface EnhancedTable {
    setOpenModal?:React.Dispatch<SetStateAction<{open:boolean,action:string}>>,
    selected:number[],
    buttons?:{
        stringIcon:string,
        icon:React.ReactNode,
        action:string
    }[], 
}
  

const EnhancedTableCustom = (props: EnhancedTable) =>{
    const { setOpenModal, buttons,selected } = props;
    //const color = stato ? "#F2FAF2" : "#F2FAFE";
    console.log({buttons});
  
    
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
                {selected?.length < 1 ? '' : `${selected?.length||0} Selezionate`} 
            </Typography>
            {buttons?.map((el)=>{

                let disableButton = false;
                if(selected?.length > 0 &&  el.action === "Add"){
                    disableButton = true;
                }else if(selected?.length < 1 &&  el.action === "Delete"){
                    disableButton = true;
                }
                   
                return (
                    <Tooltip className="m-2" title={el.stringIcon}>
                        <Button disabled={disableButton} variant="outlined" onClick={()=>{
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