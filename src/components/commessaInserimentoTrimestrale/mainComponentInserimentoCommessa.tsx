import { Box, Chip, IconButton, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import ColumnGrid from "../reusableComponents/columGrid";
import InputRegioni from "./inserisciRegioniModCommessa";
import PrimoContainerInsComTrimestrale from "./primoContainerTrimestrale";
import SecondoContainerTrimestrale from "./secondoContainerTrimestrale";
import TerzoContainerTrimestrale from "./terzoContainerTrimestrale";
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { month } from "../../reusableFunction/reusableArrayObj";
import { Regioni } from "../../page/ente/moduloCommessaInserimentoUtEn30";

const MainInserimentoModuloCommessa = ({
    activeCommessa,
    onChangeModuloValue,
    isEditAllow,
    errorAnyValueIsEqualNull,
    dataTotali,
    arrayRegioniSelected,
    setArrayRegioniSelected,
    arrayRegioni,
    onAddRegioniButton,
    errorArRegioni,
    handleChangeTotale_Ar_890_regione,
    error890Regioni,
    onDeleteSingleRegione,
    dataModuli,
    activeStep,
    mainState,
    coperturaAr,
    copertura890,
    loadingData,
    coperturaArInseritaManualmente,
    copertura890InseritaManualmente
    
}) => {

    if(loadingData){
        return (
            <Box
                sx={{
                    padding:"24px",
                    height: '100vh'
                }}
            >
                <Skeleton variant="rectangular" height="100%" />
            </Box>
        );
    }else{
        return(
            <>
                <div>
                    <div className="bg-white mt-3 pt-3">
                        <PrimoContainerInsComTrimestrale meseAnno={`${month[Number(activeCommessa?.meseValidita)-1]}/${activeCommessa?.annoValidita}`} tipoContratto={activeCommessa?.idTipoContratto === 1 ?  "PAL":"PAC"} />
                        <SecondoContainerTrimestrale 
                            onChangeModuloValue={onChangeModuloValue }
                            dataModulo={activeCommessa}
                            meseAnno={` ${month[Number( activeCommessa?.meseValidita )-1]}/${activeCommessa?.annoValidita}`}
                            modifica={isEditAllow}
                            errorAnyValueIsEqualNull={errorAnyValueIsEqualNull} />
                    </div>
                    {(activeCommessa?.source === "archiviato" && activeCommessa?.stato !== null) &&
                        <div className='bg-white'>
                            <TerzoContainerTrimestrale dataModulo={dataTotali} dataModifica={activeCommessa?.dataInserimento} meseAnno={` ${month[Number(activeCommessa?.meseValidita)-1]}/${activeCommessa?.annoValidita}`}/>
                        </div>
                    }
                    <>
                        {activeCommessa?.source !== "archiviato" &&
                            <div  className="bg-white mt-3 pt-3 ">
                                <InputRegioni 
                                    isEditAllow={isEditAllow}
                                    selected={arrayRegioniSelected}
                                    setValue={setArrayRegioniSelected}
                                    array={arrayRegioni}
                                    action={onAddRegioniButton}
                                ></InputRegioni> 
                            </div>
                        }
                        <div  className="bg-white mt-3 pt-3">
                            <ColumnGrid 
                                elements={[
                                    null,<Typography sx={{fontWeight:'bold', textAlign:'center'}}>AR Nazionali </Typography>,<Typography sx={{fontWeight:'bold', textAlign:'center'}}>890 Nazionali</Typography>
                                ]} styles={[
                                    {
                                        textAlign: 'left',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    },{
                                        textAlign: 'left',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    },
                                    {
                                        textAlign: 'left',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    }
                                ]} 
                                columns={[6,2,2]}
                            ></ColumnGrid>
                            <hr></hr>
                             
                            <ColumnGrid 
                                elements={[<>
                                    <Typography variant='h4' sx={{fontWeight:'bold', textAlign:'center'}}>Regione {activeCommessa?.valoriRegione[0]?.regione}</Typography>
                                    <Tooltip title="Regione di appartenenza">
                                        <IconButton>
                                            <InfoIcon fontSize='medium' />
                                        </IconButton>
                                    </Tooltip>
                                </>,
                                <TextField
                                    sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                    error={errorArRegioni|| (errorAnyValueIsEqualNull && activeCommessa?.valoriRegione[0]?.ar === null)}
                                    disabled={!isEditAllow}
                                    onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogicoARNaz", activeCommessa?.valoriRegione[0]?.istatRegione)}
                                    size="small"
                                    value={activeCommessa?.valoriRegione[0]?.ar === 0 ? 0 : (activeCommessa?.valoriRegione[0]?.ar||"")}
                                    InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                />,
                                <TextField
                                    sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                    error={error890Regioni || (errorAnyValueIsEqualNull && activeCommessa?.valoriRegione[0]["890"] === null)}
                                    disabled={!isEditAllow}
                                    onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogico890Naz", activeCommessa?.valoriRegione[0]?.istatRegione)}
                                    size="small"
                                    value={activeCommessa?.valoriRegione[0]["890"] === 0 ? 0 : (activeCommessa?.valoriRegione[0]["890"]||"")}
                                    InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                />,
                                !isEditAllow ? <Chip variant="outlined" sx={{backgroundColor:activeCommessa?.valoriRegione[0]?.calcolato? undefined :"#B5E2B4"}} label={activeCommessa?.valoriRegione[0]?.calcolato ? "Attribuito dal sistema":"Inserita manualmente dall’aderente"} />:null
                                ]}
                                  
                                styles={[{
                                    display:"flex",
                                    justifyContent:"right",
                                    textAlign: 'right',
                                    borderColor: '#ffffff',
                                    borderStyle: 'solid',
                                },
                                {
                                    textAlign: 'center',
                                    borderColor: '#ffffff',
                                    borderStyle: 'solid',
                                },
                                {
                                    textAlign: 'center',
                                    borderColor: '#ffffff',
                                    borderStyle: 'solid',
                                },
                                {
                                    textAlign: 'center',
                                    borderColor: '#ffffff',
                                    borderStyle: 'solid',
                                }
                                ]}
                                columns={[6,2,2,2]}
                            ></ColumnGrid>

                            <hr></hr>
                             
                            <div style={{overflowY: "auto", backgroundColor:'#F8F8F8'}}>
                                {  activeCommessa?.valoriRegione.slice(1).length > 0 ? activeCommessa?.valoriRegione.slice(1).map((element:Regioni) => {
                                    return (
                                        <>
                                            <ColumnGrid 
                                                key={element.istatRegione}
                                                elements={[ <Typography variant='h4' sx={{fontWeight:'bold', textAlign:'center'}}>
                                                    {element.regione}</Typography>,
                                                <TextField
                                                    sx={{ backgroundColor: '#FFFFFF', width: '100px'}}
                                                    error={errorArRegioni || (errorAnyValueIsEqualNull && element.ar === null)}
                                                    disabled={!isEditAllow}
                                                    onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogicoARNaz",element.istatRegione)}
                                                    size="small"
                                                    value={element.ar === 0 ? 0 : (element.ar||"")}
                                                    InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                                />,
                                                <TextField
                                                    sx={{ backgroundColor: '#FFFFFF', width: '100px'}}
                                                    error={error890Regioni || (errorAnyValueIsEqualNull && element[890] === null)}
                                                    disabled={!isEditAllow}
                                                    onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogico890Naz",element.istatRegione)}
                                                    size="small"
                                                    value={element[890] === 0 ? 0 : (element[890]||"")}
                                                    InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                                />,isEditAllow ?
                                                    <IconButton
                                                        onClick={() => onDeleteSingleRegione(element.istatRegione)}
                                                        aria-label="Delete"
                                                        sx={{color:"#FE6666"}}
                                                        size="large"
                                                    ><DeleteIcon/>
                                                    </IconButton>
                                                    :  <Chip variant="outlined" sx={{backgroundColor:element?.calcolato ? undefined :"#B5E2B4"}} label={element?.calcolato ? "Attribuito dal sistema":"Inserita manualmente dall’aderente"} />
                                                     
                                                ]} 
                                                styles={[{
                                                    display: "flex",
                                                    justifyContent: "right", 
                                                    alignItems: "center",     
                                                },{
                                                    display: "flex",
                                                    justifyContent: "center", 
                                                    alignItems: "center",     
                                                },{
                                                    display: "flex",
                                                    justifyContent: "center", 
                                                    alignItems: "center",     
                                                },
                                                {   display: "flex",
                                                    justifyContent:"center",
                                                    alignItems:"center" 
                                                }]} 
                                                columns={[6,2,2,2]}></ColumnGrid>  
                                            <hr></hr>
                                        </>
                                    );}):null}
                            </div>
                            <hr></hr>
                        </div>
                        <div className="bg-white mt-3 pt-3 ">
                            <ColumnGrid 
                                elements={[
                                    null,<Typography sx={{fontWeight:'bold', textAlign:'center'}}>AR Nazionali </Typography>,<Typography sx={{fontWeight:'bold', textAlign:'center'}}>890 Nazionali</Typography>
                                ]} styles={[
                                    {
                                        textAlign: 'left',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    },{
                                        textAlign: 'left',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    },
                                    {
                                        textAlign: 'left',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    }
                                ]} 
                                columns={[6,2,2]}
                            ></ColumnGrid>
                            <hr></hr>
                            <ColumnGrid 
                                elements={[
                                    <Typography sx={{fontWeight:'bold', textAlign:'right'}}>Totale Notifiche</Typography>,
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={true}
                                        size="small"
                                        value={dataModuli.length > 1 ? (dataModuli[activeStep]?.totaleNotificheAnalogicoARNaz||0):(dataModuli[0]?.totaleNotificheAnalogicoARNaz||0)}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />,
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={true}
                                        size="small"
                                        value={dataModuli.length > 1 ?  (dataModuli[activeStep]?.totaleNotificheAnalogico890Naz||0) : (dataModuli[0]?.totaleNotificheAnalogico890Naz||0)}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />
                                ]} styles={[
                                    {
                                        justifyContent:"center",
                                        alignItems:"center"
                                    },{
                                        textAlign: 'center',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    },
                                    {
                                        textAlign: 'center',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    }
                                ]} 
                                columns={[6,2,2]}
                            ></ColumnGrid>
                            <hr></hr>
                            <ColumnGrid 
                                elements={[
                                    <Typography sx={{fontWeight:'bold', textAlign:'right'}}>Percentuale copertura inserita dell’aderente</Typography>,
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                        size="small"
                                        error={(coperturaAr||0) > 100}
                                        value={coperturaArInseritaManualmente ? coperturaArInseritaManualmente + "%" : 0+ "%"}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />,
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                        size="small"
                                        error={(copertura890||0) > 100}
                                        value={copertura890InseritaManualmente ? copertura890InseritaManualmente + "%" : 0+ "%"}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />
                                ]}
                                styles={[{
                                    justifyContent:"center",
                                    alignItems:"center"
                                },{
                                    textAlign: 'center',
                                    borderColor: '#ffffff',
                                    borderStyle: 'solid',
                                },
                                {
                                    textAlign: 'center',
                                    borderColor: '#ffffff',
                                    borderStyle: 'solid',
                                }
                                ]} 
                                columns={[6,2,2]}
                            ></ColumnGrid>
                            {activeCommessa?.source === "archiviato" &&
                             <>
                                 <hr></hr>
                                 <ColumnGrid 
                                     elements={[
                                         <Typography sx={{fontWeight:'bold', textAlign:'right'}}>Percentuale copertura attribuita dal sistema</Typography>,
                                         <TextField
                                             sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                             disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                             size="small"
                                             value={100 - (coperturaArInseritaManualmente||0) + "%"}
                                             InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                         />,
                                         <TextField
                                             sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                             disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                             size="small"
                                             value={100 - (copertura890InseritaManualmente||0) + "%"}
                                             InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                         />
                                     ]}
                                     styles={[{
                                         justifyContent:"center",
                                         alignItems:"center"
                                     },{
                                         textAlign: 'center',
                                         borderColor: '#ffffff',
                                         borderStyle: 'solid',
                                     },
                                     {
                                         textAlign: 'center',
                                         borderColor: '#ffffff',
                                         borderStyle: 'solid',
                                     }
                                     ]} 
                                     columns={[6,2,2]}
                                 ></ColumnGrid>
                             </>
                            }
                            <hr></hr>
                            
                        </div>
                    </>
                </div>   
            </>
        );}
};
export default MainInserimentoModuloCommessa;