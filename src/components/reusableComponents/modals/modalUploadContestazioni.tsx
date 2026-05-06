import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, styled, TextField, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MainFilter from "../mainFilter";
import { useState } from "react";
import { ResponsiveGridContainer } from "../layout/mainComponent";

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "500px",
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius:'20px'
};

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const ModalUpload = ({open,setOpen,uploadFun ,valueSelected}) => {

    const [bodyFatturazione, setBodyFatturazione] = useState({
        anno:0,
        mese:0,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false,
        idTipoContratto:null,
        inviata:3
    });
    const [arrayYears, setArrayYears] = useState([]);
    const [showModalUpload,setShowModalUpload] = useState(true);
    const [valueText,setValueText] = useState("");
    
    const clearOnChangeFilter =  () => {
        console.log("mimmo");
    };
    
    const handleClose = () => {
        console.log("close");
    };

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
        >
            
            <Box sx={style}>
                <div className="d-flex align-items-center justify-content-end ">
                    <div className='icon_close'>
                        <CloseIcon onClick={()=> setOpen(false)} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
                    </div>
                </div>
                <Box sx={{marginY:"20px"}}>
                    <TextField
                        label="Risposta"
                        multiline
                        minRows={4}
                        maxRows={6}
                        fullWidth
                        value={valueText}
                        onChange={(e)=> setValueText(e.target.value)}
                    />
                </Box>
                <Box sx={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
                    <Button
                        disabled={valueText.length <= 3}
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon  />}
                    >
                    Upload file
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => {
                                uploadFun(event,valueSelected);
                                setOpen(false);
                                setValueText("");
                            }}
                            multiple
                        />
                    </Button>
                </Box>
               
             
            </Box>
        </Modal>
    );
};

export default ModalUpload;