import React,{useContext} from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { RadioComponentProps,DatiFatturazione,OptinsRadio,AreaPersonaleContext }  from '../types/typesAreaPersonaleUtenteEnte';
import { DatiFatturazioneContext } from '../page/areaPersonaleUtenteEnte';




const  RadioComponent: React.FC<RadioComponentProps> = (props) => {
    const {
        label, options, valueRadio,keyObject,
    } = props;

    const {statusPage,setDatiFatturazione, datiFatturazione} = useContext<AreaPersonaleContext>(DatiFatturazioneContext);


    let makeSplitRadioDisable = true;
    if(label ==='Split Paymet'){

        if(statusPage === 'immutable'){
            makeSplitRadioDisable = true;
        }else if(statusPage === 'mutable' && datiFatturazione.tipoCommessa === ''){
            makeSplitRadioDisable = true;
        }else if(statusPage === 'mutable' && datiFatturazione.tipoCommessa !== ''){
            makeSplitRadioDisable = false;
    
        }

    }else{
        if(statusPage === 'immutable'){
            makeSplitRadioDisable = true;
        }else{
            makeSplitRadioDisable = false;
        }
    }
 
   
    


    return (
        <FormControl>
            <FormLabel id="demo-row-radio-buttons-group-label">{label}</FormLabel>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                onChange={(e)=>{setDatiFatturazione((prevState: DatiFatturazione) =>{
                    let newState;
                    if(e.target.value.toLowerCase() === 'true'){
                        console.log('1');
                        const newValue = {[keyObject]:true};
                        newState = {...prevState, ...newValue};
                    }else if(e.target.value.toLowerCase() === 'false'){
                        console.log('2');
                        const newValue = {[keyObject]:false};
                        newState = {...prevState, ...newValue};
                    }else{
                        console.log('3');
                        const newValue = {[keyObject]:e.target.value};
                        newState = {...prevState, ...newValue};
                        //setstatusPagePage('mutable');
                    }
                    console.log('4', newState);
                    return newState;
                   
                } );}}>
                {options.map((el:OptinsRadio) => (

                    <FormControlLabel  key={Math.random()} value={el.id} control={<Radio checked={el.id === valueRadio} disabled={makeSplitRadioDisable} />} label={el.descrizione} />
                )
          
                )}

            </RadioGroup>
        </FormControl>
    );
};

export default RadioComponent;
