import { Button, Toolbar, Tooltip, Typography } from "@mui/material";
import { SetStateAction } from "react";

interface EnhancedTable {
    setOpenModal?:React.Dispatch<SetStateAction<boolean>>,
    setOpenModalAdd?:React.Dispatch<SetStateAction<boolean>>,
    selected:number[],
    buttons?:{
        stringIcon:string,
        icon:React.ReactNode,
        action:string
    }[], 
}
  

const EnhancedTableCustom = (props: EnhancedTable) =>{
    const { setOpenModal, buttons,selected, setOpenModalAdd  } = props;
    //const color = stato ? "#F2FAF2" : "#F2FAFE";
    console.log({selected});
    const bgColor = selected.length < 1 ? "#F2FAF2" : "rgba(23, 50, 77, 0.08)";
  
   

    return (
        <Toolbar
            sx={{bgcolor:bgColor}}
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
                    <Tooltip key={el.action} className="m-2" title={el.stringIcon}>
                        <span>
                            <Button disabled={disableButton} variant="outlined" onClick={()=>{
                                console.log(el.action);
                                if(setOpenModal && el.action === "Delete"){
                                    setOpenModal(true);
                                }else if(setOpenModalAdd && el.action === "Add" ){
                                    console.log("???");
                                    setOpenModalAdd(true);
                                }
                            }}>
                                {el.icon}
                            </Button>
                        </span>
                       
                    </Tooltip>
                );
            })
            }
           
        </Toolbar>
    );
};
export default EnhancedTableCustom;