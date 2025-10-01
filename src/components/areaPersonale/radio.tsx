import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { RadioComponentProps,DatiFatturazione,OptinsRadio }  from '../../types/typesAreaPersonaleUtenteEnte';

const  RadioComponent: React.FC<RadioComponentProps> = (props) => {
    const {
        label, options, valueRadio,keyObject,mainState ,setDatiFatturazione, datiFatturazione
    } = props;

    let makeSplitRadioDisable = true;
    if(label ==='Split Payment'){
        if(mainState.statusPageDatiFatturazione === 'immutable'){
            console.log("w1");
            makeSplitRadioDisable = true;
        }else if(mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa === ''){
            makeSplitRadioDisable = true;
         
        }else if(mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== ''){
            makeSplitRadioDisable = false;
      
        }

    }else{
        if(mainState.statusPageDatiFatturazione === 'immutable'){
            makeSplitRadioDisable = true;
        
        }else{
            makeSplitRadioDisable = false;
           
        }
    }
    console.log({label,DD:datiFatturazione.tipoCommessa,makeSplitRadioDisable,MAIN:mainState.statusPageDatiFatturazione});
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
                        const newValue = {[keyObject]:true};
                        newState = {...prevState, ...newValue};
                    }else if(e.target.value.toLowerCase() === 'false'){
                        const newValue = {[keyObject]:false};
                        newState = {...prevState, ...newValue};
                    }else{
                        const newValue = {[keyObject]:e.target.value};
                        newState = {...prevState, ...newValue};
                    }
                    return newState;
                } );}}>
                {options.map((el:OptinsRadio) => (
                    <FormControlLabel  key={Math.random()} value={el.id} control={<Radio checked={el.id === valueRadio} disabled={makeSplitRadioDisable} />} label={el.descrizione} />
                ))}
            </RadioGroup>
        </FormControl>
    );
};

export default RadioComponent;
