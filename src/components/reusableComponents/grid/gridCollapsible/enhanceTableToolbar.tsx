import { Button, Toolbar, Tooltip, Typography } from "@mui/material";
import { SetStateAction } from "react";
import RestoreIcon from '@mui/icons-material/Restore';
import BlockIcon from '@mui/icons-material/Block';

interface EnhancedTableToolbarProps {
    numSelected: number,
    stato:boolean,
    setOpenConfermaModal:React.Dispatch<SetStateAction<boolean>>,
    selected:number[],
    setOpenResetFilterModal:React.Dispatch<SetStateAction<boolean>>,
    monthFilterIsEqualMonthDownload:boolean
}
  

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) =>{
    const { numSelected, stato,setOpenConfermaModal,setOpenResetFilterModal,monthFilterIsEqualMonthDownload } = props;
    const color = stato ? "#F2FAF2" : "#F2FAFE";
    const icon = stato ?  <RestoreIcon sx={{marginLeft:'20px'}}></RestoreIcon> : <BlockIcon sx={{marginLeft:'20px'}}></BlockIcon>;
    const stringIcon = stato ? 'Ripristina' : 'Sospendi';
  
    return (
        <Toolbar
            sx={{bgcolor:color}}
        >
            <Typography
                sx={{ flex: '1 1 100%' }}
                color="inherit"
                variant="subtitle1"
                component="div"
            >
                {numSelected} Selezionate
            </Typography>
            <Tooltip title={stringIcon}>
                <Button variant="outlined" onClick={()=>{
                    if(monthFilterIsEqualMonthDownload){
                        setOpenConfermaModal(true);
                    }else{
                        setOpenResetFilterModal(true);
                    }
                }}>
                    {stringIcon} {icon}
                </Button>
            </Tooltip>
        </Toolbar>
    );
};
export default EnhancedTableToolbar;