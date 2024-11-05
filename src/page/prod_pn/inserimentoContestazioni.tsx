import { Autocomplete, Box, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { ButtonNaked } from "@pagopa/mui-italia";
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";

const InserimentoContestazioni = () =>{

    const navigate = useNavigate();

    return (
        <div className="mx-5">
            <div className='d-flex marginTop24'>
                <ButtonNaked
                    color="primary"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() =>{
                        navigate(PathPf.LISTA_NOTIFICHE);
                    }}
                >
                        Indietro
                </ButtonNaked>
                <Typography sx={{ marginLeft:'20px'}} variant="caption">
                    <MarkUnreadChatAltIcon sx={{paddingBottom:'3px'}}  fontSize='small'></MarkUnreadChatAltIcon>
                         Notifiche 
                </Typography>
                <Typography sx={{fontWeight:'bold'}} variant="caption">/ Inserisci contestazioni</Typography> 
            </div>
            <div className="marginTop24">
                <div className="row ">
                    <div className="col-9">
                        <Typography variant="h4">Contestazioni</Typography>
                    </div>
                </div>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <Box sx={{width:'80%'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>Anno</InputLabel>
                                <Select
                                    label='Anno'
                                    onChange={(e) => {
                                    // const value = Number(e.target.value);
                                    //setBodyGetLista((prev)=> ({...prev, ...{anno:value}}));
                                    }}
                                    value={''}
                                >
                                    {[].map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el}
                                        >
                                            {el}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3">
                        <Box sx={{width:'80%', marginLeft:'20px'}}  >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>Mese</InputLabel>
                                <Select
                                    label='Mese'
                                    onChange={(e) =>{
                                    // const value = Number(e.target.value);
                                    // setBodyGetLista((prev)=> ({...prev, ...{mese:value}}));
                                    }}
                                    value={''}
                                >
                                    {[].map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={''}
                                        >
                                            {''}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3">
                        <Box sx={{width:'80%', marginLeft:'20px'}}  >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>Rag Soc. Ente</InputLabel>
                                <Select
                                    label='Rag Soc. Ente'
                                    onChange={(e) =>{
                                    // const value = Number(e.target.value);
                                    // setBodyGetLista((prev)=> ({...prev, ...{mese:value}}));
                                    }}
                                    value={''}
                                >
                                    {[].map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={''}
                                        >
                                            {''}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                    </div>
                </div>
            </div>
           
        </div>
    );

};
export default InserimentoContestazioni;