import { Grid, InputLabel, Select, OutlinedInput, Chip, MenuItem, Button, Tooltip, FormControl, Theme } from "@mui/material";
import { Box } from "@mui/system";
import { theme } from "@pagopa/mui-italia";
import { Regioni } from "../../page/ente/moduloCommessaInserimentoUtEn30";


const InputRegioni = ({isEditAllow,selected,setValue,array, action}) => {

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    function getStyles(name: string, personName: readonly string[], theme: Theme) {
        return {
            fontWeight: personName.includes(name)
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
        };
    }

    return (
        <Grid   container spacing={2}>
            <Grid  container 
                alignItems="center" 
                justifyContent="center" 
                item  md={6}>
                <FormControl sx={{ m: 1, width: "100%" }}>
                    <InputLabel>Inserisci regione</InputLabel>
                    <Select
                        disabled={!isEditAllow}
                        multiple
                        value={selected}
                        onChange={(e:any)=> setValue(e.target.value)}
                        input={<OutlinedInput label="Inserisci regione" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value,ind) => {
                                                                
                                    const nameRegione  = array?.find(el => el.istatRegione === value)?.regione;
                                                      
                                    return <Chip variant="outlined" key={`${value}-${ind}`} label={nameRegione} />;
                                })}
                            </Box>
                        )}
                        MenuProps={MenuProps}
                    >
                        {array.map((el:Regioni,i) => (
                            <MenuItem
                                key={`${el.istatRegione}-${i}`}
                                value={el.istatRegione}
                                style={getStyles(el.regione, [], theme)}
                            >
                                {el.regione}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid  container 
                alignItems="center" 
                justifyContent="left"
                item
                md={6}>
                <Tooltip title="Aggiungi regione">
                    <span>
                        <Button
                            disabled={!isEditAllow || selected?.length === 0}
                            onClick={() => action()}
                            color="primary"
                            size="large"
                            variant="contained">
                            Aggiungi regione
                        </Button>
                    </span>
                </Tooltip>
            </Grid>
        </Grid>
    );
};

export default InputRegioni;