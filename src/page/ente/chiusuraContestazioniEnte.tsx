import { useState } from "react";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import GridUploadContestazioni from "../../components/contestazioni/gridUploadContestazioni";
import { downloadNotifche, getMessaggiCountEnte } from "../../api/apiSelfcare/notificheSE/api";
import { manageError, managePresaInCarico } from "../../api/api";
import { tipoNotifica, tipoNotificaArray } from "../../reusableFunction/reusableArrayObj";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { OptionMultiselectChackboxTipoNot } from "../../types/typeReportDettaglio";

interface RecapObjContestazioni{
    tipologiaFattura: string
    idFlagContestazione: number
    totaleNotificheAnalogiche: number,
    acc: number,
    rif:number,
    icon:string
}


const ChiusuraContestazioniEnte : React.FC = () => {
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const setCountMessages = useGlobalStore(state => state.setCountMessages);
    const setStatusQueryGetUri = useGlobalStore(state => state.setStatusQueryGetUri);
        
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    //:TODO da cambiare
    const [valueAutocompleteTipoNot,setValueAutocompleteTipoNot] = useState<OptionMultiselectChackboxTipoNot[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<any>({
        profilo:"",
        prodotto:"",
        anno:"2026",
        mese:2, 
        tipoNotifica:null,
        statoContestazione:[],
        cap:null,
        iun:null,
        recipientId:null
    });
    const [showLoading, setShowLoading] = useState(false);

    const [arrayYears, setArrayYears] = useState(["2026"]);
    const [arrayMonths, setArrayMonths] = useState([2]);

    const clearOnChangeFilter =  () => {
        console.log("mimmo");
    };


    const mock = [
        {
            "tipologiaFattura": "Notifica assente",
            "idFlagContestazione": 10,
            "totaleNotificheAnalogiche": 10,
            "acc": 7,
            "rif":5,
            "icon":""
        },
        {
            "tipologiaFattura": "Notifica già fatturata",
            "idFlagContestazione": 8,
            "totaleNotificheAnalogiche": 7,
            "acc": 7,
            "rif":5,
            "icon":""
        }
    ];

    const downloadNotificheOnDownloadButton = async () =>{
        setShowLoading(true);
            
               
        // eslint-disable-next-line @typescript-eslint/no-unused-vars  
        await downloadNotifche(token, profilo.nonce,{
            profilo:"",
            prodotto:"",
            anno:2025,
            mese:12, 
            tipoNotifica:null,
            statoContestazione:[],
            cap:null,
            iun:null,
            recipientId:null
        } ).then(async(res)=>{
            setShowLoading(false); 
            //setStatusQueryGetUri((prev)=>([...prev,...[res?.data?.statusQueryGetUri]]));
            managePresaInCarico('PRESA_IN_CARICO_DOCUMENTO_ENTE',dispatchMainState);
            await getMessaggiCountEnte(token,profilo.nonce).then((res)=>{
                const numMessaggi = res.data;
                setCountMessages(numMessaggi);
            }).catch((err)=>{
                return;
            });
        }).catch(((err)=>{
            setShowLoading(false);
            if(err?.response?.request?.status === 300){
                managePresaInCarico("DOWNLOAD_NOTIFICHE_DOUBLE_REQUEST",dispatchMainState);
            }else if(err?.response?.request?.status === 404){
                managePresaInCarico(400,dispatchMainState);
            }else if(err?.response?.request?.status === 400){
                managePresaInCarico('NO_OPERAZIONE',dispatchMainState);
            }else{
                manageError(err,dispatchMainState);
            }
        }));   
    };


    return (
        <>
            <MainBoxStyled title={"Chiusura contestazioni"}>
                <ResponsiveGridContainer >
                    <MainFilter 
                        filterName={"select_value_string"}
                        inputLabel={"Anno"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBodyGetLista}
                        body={bodyGetLista}
                        keyDescription={"anno"}
                        keyValue={"anno"}
                        keyBody={"anno"}
                        arrayValues={arrayYears}
                        disabeledSelect={true}
                    ></MainFilter>
                    <MainFilter 
                        filterName={"select_value_string"}
                        inputLabel={"Mese"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBodyGetLista}
                        body={bodyGetLista}
                        keyDescription={"mese"}
                        keyValue={"mese"}
                        keyBody={"mese"}
                        arrayValues={arrayMonths}
                        disabeledSelect={true}
                    ></MainFilter>
                    <MainFilter 
                        filterName={"multi_checkbox"}
                        inputLabel={"Tipo notifica"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBodyGetLista}
                        body={bodyGetLista}
                        valueAutocomplete={valueAutocompleteTipoNot}
                        setValueAutocomplete={setValueAutocompleteTipoNot}
                        keyDescription={"name"}
                        keyValue={"id"}
                        keyOption='name'
                        iconMaterial={RenderIcon("type-not",true)}
                        keyCompare={""}
                        dataSelect={tipoNotifica}
                        arrayValues={tipoNotifica}
                        keyBody={"tipoNotifica"}
                    ></MainFilter>
                </ResponsiveGridContainer>
                <FilterActionButtons 
                    onButtonFiltra={()=> console.log("filtera")} 
                    onButtonAnnulla={()=> console.log("annulla")} 
                    statusAnnulla={"hidden"} 
                ></FilterActionButtons>
                <ActionTopGrid
                    actionButtonRight={[ {
                        onButtonClick:() => downloadNotificheOnDownloadButton(),
                        variant: "outlined",
                        label: "Download file contestazioni",
                        icon:{name:"download"},
                        disabled:false
                    },
                    ]}/>
                <Box sx={{ backgroundColor:'#F8F8F8', padding:'10px'}}>
                    <Table size="small" aria-label="purchases">
                        <TableHead>
                            <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                <TableCell align="center" sx={{ width:"300px"}} >Motivo contestazione</TableCell>
                                <TableCell align="center" sx={{ width:"300px"}}>N. Contestazioni</TableCell>
                                <TableCell align="center" sx={{ width:"300px"}}>N. Risposta SEND</TableCell>
                                <TableCell align="center" sx={{ width:"300px"}}>N. Cont. Accettate</TableCell>
                                <TableCell align="center" sx={{ width:"300px"}}>N. Cont. Rifiutate</TableCell>
                                <TableCell align="center" sx={{ width:"300px"}}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                            {mock.map((sigleRec:RecapObjContestazioni)=>{
                                return (
                                    <TableRow key={Math.random()}>
                                        <TableCell align="center"  sx={{ width:"300px"}} >{sigleRec.tipologiaFattura}</TableCell>
                                        <TableCell align="center" sx={{ width:"300px"}} >{sigleRec.idFlagContestazione}</TableCell>
                                        <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totaleNotificheAnalogiche}</TableCell>
                                        <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.acc}</TableCell>
                                        <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.rif}</TableCell>
                                        <TableCell align="center" sx={{ width:"80px"}}><IconButton
                                            aria-label="Scarica"
                                            size="medium"
                                        > <FileDownloadIcon/>
                                        </IconButton></TableCell>
                                        
                                    </TableRow>
                                );})}
                        </TableBody>
                    </Table>
                </Box>
              
           
            </MainBoxStyled>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={"Elaborazione in corso"} >
            </ModalLoading>
        </>
    );
};

export default ChiusuraContestazioniEnte;