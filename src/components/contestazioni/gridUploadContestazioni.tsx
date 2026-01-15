import { Box, Button, IconButton, styled, Table, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from "react";
import { fi } from "date-fns/locale";
import ModalUpload from "../reusableComponents/modals/modalUploadContestazioni";
import { useLocation } from "react-router";
import DeleteIcon from '@mui/icons-material/Delete';

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

const GridUploadContestazioni = ({popUp}) => {
    const location = useLocation();
    const currentLocation = location.pathname;
    console.log({currentLocation});

    let Mese = "Dicembre";
    let Anno = 2025;

    if(currentLocation === "/rispsend"){
        Mese = "Gennaio";
        Anno = 2026;
    
    }else if(currentLocation === "/chiu"){
        Mese = "Febbraio";
        Anno = 2026;
    }
   


    const defaultObject = [
        {   id:1,
            motivoContestazione:"Notifica assente",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        },
        {   id:2,
            motivoContestazione:"Notifica già fatturata",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        },
        {   id:3,
            motivoContestazione:"Notifica con importo incoerente",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        },
        {   id:4,
            motivoContestazione:"Notifica con stato incoerente",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        },
        {   id:5,
            motivoContestazione:"Doppio invio allo stesso indirizzo",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        }
    ];

    const [mockGridUpload,setMockGridUpload] = useState([
        {   id:1,
            motivoContestazione:"Notifica assente",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        },
        {   id:2,
            motivoContestazione:"Notifica già fatturata",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        },
        {   id:3,
            motivoContestazione:"Notifica con importo incoerente",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        },
        {   id:4,
            motivoContestazione:"Notifica con stato incoerente",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        },
        {   id:5,
            motivoContestazione:"Doppio invio allo stesso indirizzo",
            anno:Anno,
            mese:Mese,
            file:false,
            fileValue:null
        }
    ]);

    console.log({mockGridUpload});
    const [showModalUpload,setShowModalUpload] = useState(false);

    const onUpload = (event,value) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const restOfObjects = mockGridUpload.filter(obj => obj.id !== value.id );
        console.log({event,value, restOfObjects});
        const mergeElement = [...restOfObjects,{...value,fileValue:file,file:true}];
        const newMockOrdered = mergeElement.sort((a, b) => a.id - b.id);
        setMockGridUpload(newMockOrdered);
    };

    const [valueSelected, setValueSelected] = useState(null);

    return (     
        <>
            <Table sx={{ backgroundColor:'#F8F8F8', padding:'10px', marginTop:"50px",width:"100%",border:"10px solid",borderColor: "#FFFFFF"}}>
                <TableHead>
                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                        <TableCell align="center" sx={{width:"30%"}}>Motivo contestazione</TableCell>
                        <TableCell align="center" sx={{width:"30%"}}>Anno</TableCell>
                        <TableCell align="center" sx={{width:"30%"}}>Mese</TableCell>
                        <TableCell align="center" sx={{ width:"10%"}}></TableCell>
                    </TableRow>
                </TableHead>
                   
                {
                    mockGridUpload.map((value:any,index)=>{
                        const fileName = value.fileValue?.name || "";
                        console.log({fileName});
                        return(
                            <TableRow sx={{
                                height: "80px",
                                "&:hover": {
                                    backgroundColor: "#EDEFF1",
                                },
                            }} >
                                {Object.values(value).map((el:any,i) => {
                                    
                                    if(i === 0 || el instanceof File || el === null) return;
                                    if(el === false || el === true){
                                        return(
                                            <TableCell sx={{
                                                //borderRight:"10px solid",
                                                borderTop: index === 0 ? "10px solid":"5px solid",
                                                borderRight:"10px solid",
                                                borderBottom: index === Object.values(value).length - 1 ?"10px solid":"5px solid",
                                                borderColor: "#FFFFFF",
                                                padding: "10px",
                                            }} key={Math.random()} align={"center"}>
                                                <Box sx={{display:"flex", gap:3}}>
                                                    <Tooltip title={value?.file ? fileName : "Upload file"}>
                                                        <IconButton onClick={(e)=> {
                                                            if(popUp){
                                                                console.log("ciao");
                                                                e.stopPropagation();
                                                                setShowModalUpload(true);
                                                                setValueSelected(value);
                                                            }
                                                        }} component="label">
                                                            <CloudUploadIcon sx={{ fontSize: 30, color:value.file ? "green":undefined }} />

                                                            <VisuallyHiddenInput
                                                                disabled={popUp}
                                                                type="file"
                                                                onChange={(event:React.ChangeEvent<HTMLInputElement>) =>{
                                                                    if(popUp){
                                                                        console.log("ciao");
                                                                        setShowModalUpload(true);
                                                                    }else{
                                                                        onUpload(event,value);
                                                                    }
                                                                
                                                                } }
                                                                multiple
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={"Elimina file"}>
                                                        <IconButton disabled={!value.file} onClick={(e)=> {
                                                            console.log({value});
                                                            setMockGridUpload(prev =>
                                                                prev.map(el =>
                                                                    el.id === value.id
                                                                        ? {
                                                                            ...el,
                                                                            file: false,
                                                                            fileValue: null,
                                                                        }
                                                                        : el
                                                                )
                                                            );
                                                          
                                                        }} component="label">
                                                            <DeleteIcon sx={{ fontSize: 30, color:value.file ? "red":undefined }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                           
                                            </TableCell>
                                        );
                                    }else{
                                        return (
                                            <TableCell sx={{
                                                borderLeft:i === 1?"10px solid":undefined,
                                                borderTop: index === 0 ? "10px solid":"5px solid",
                                                borderBottom: index === Object.values(value).length - 1 ?"10px solid":"5px solid",
                                                borderColor: "#FFFFFF",
                                                padding: "10px",
                                            }} key={Math.random()} align={"center"}>{el}</TableCell>
                                        );
                                    }
                                   
                                })}
                            </TableRow>
                        );
                    })}
            </Table>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center", 
                    alignItems: "center",   
                    gap: 5,                
                    height: "100%",   
                    width:"100%",
                    marginY:"50px"      
                }}
            >
                <Button variant="outlined">Invia contestazione</Button>
                <Button onClick={()=> setMockGridUpload(defaultObject)} variant="outlined" color={"error"}>Reset</Button>
            </Box>
            <ModalUpload  open={showModalUpload} setOpen={setShowModalUpload} uploadFun={onUpload} valueSelected={valueSelected}></ModalUpload>
        </>
    );
};

export default GridUploadContestazioni;