import React from 'react';
import {
    TextField, Button, Typography, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState, useContext } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {DynamicInsertProps,DatiFatturazione,Email,AreaPersonaleContext}  from '../types/typesAreaPersonaleUtenteEnte';
import { DatiFatturazioneContext } from '../page/areaPersonaleUtenteEnte';
import { _YupEmail} from '../validations/email/index';


const  DynamicInsert : React.FC<DynamicInsertProps> = (props) => {

    const {datiFatturazione} = useContext<AreaPersonaleContext>(DatiFatturazioneContext);

    const {status, arrElement, setData} = props;
    const [element, setElement] = useState('');
    const [validation, setValidation] = useState(false);



 

    const handleSubmit = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (element) {
            setData((prevState: DatiFatturazione)=>{
                  
                const arrContatti = prevState.contatti;
                const newArrContatti = [...arrContatti, {tipo:datiFatturazione.tipoCommessa,email:element}];
                const newState = {...prevState, ...{contatti:newArrContatti}};
                         
                return newState;
            });
        
            setElement('');
        }  
    };
 
    const hendleOnMouseOut = (e: React.SyntheticEvent<EventTarget>) =>{
        e.persist();
       
        _YupEmail.validate(element).then(( )=>{
              
            setValidation(false);

        }).catch(()=> setValidation(true));
    };

    const handleElement = (e: any) => {
        const mail = e.target.value;
      
        setElement(mail);
        
    };

    const editArray = ( e: React.MouseEvent<HTMLButtonElement, MouseEvent>,email?: string,) => {
        e.preventDefault();
        const el = arrElement.filter((singleObj ) => singleObj.email === email);

        const newArr = arrElement.filter((singleObj) => singleObj.email !== email);
        setData((prevState: DatiFatturazione)=>{
            const newState = {...prevState, ...{contatti:newArr}};
            return newState;
        });
        const setemail = el[0].email; 
        setElement(setemail|| '');
    };

    const deleteElementFromArr = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, email?: string) => {
        e.preventDefault();
        const newArr = arrElement.filter((singleObj) => singleObj.email !== email);
        setData((prevState: DatiFatturazione)=>{
            const newState = {...prevState, ...{contatti:newArr}};
            return newState;
        });
       
    };

    return (
        <div>


            <div className='d-flex'>
             
                <TextField
                    label={`Email amministrativo  di riferimento Max ${3 - arrElement.length}`}
                    placeholder="Indirizzo email amministrativo"
                    sx={{ width: '30%' }}
                    type='text'
                    value={element||''}
                    onChange={(e)=>handleElement(e)}
                    disabled={(arrElement.length >= 3 || status=== 'immutable') ? true : false}
                    onMouseOut={(e) => hendleOnMouseOut(e)}
                    error={validation}
                    
                />
             
                <div className='d-flex align-items-center'>
                    <Button
                        variant="contained"
                        sx={{ marginLeft: '20px' }}
                        size="small"
                        onClick={(e) => handleSubmit(e)}
                        disabled={(arrElement.length >= 3 || status=== 'immutable'|| validation) ? true : false}
                       
                    >
                        <AddIcon fontSize="small" sx={{ color: 'ffffff' }} />
          Aggiungi Email

                    </Button>
                </div>
               
            </div>
            <div className=" mt-3 ">
                {arrElement.map((el : Email) => {
                    const { email} = el;

                    return (
                        <div className='d-flex' key={Math.random()}>
                            <div className='d-flex align-items-center w-25'>
                                <Typography
                                    variant="caption-semibold"
                                    fontSize="large"
                                >
                                    {email}

                                </Typography>
                            </div>
              
                            <div>
                                <IconButton
                                    aria-label="Edit"
                                    color="primary"
                                    size="small"
                                    onClick={(e)=> editArray(e, email)}
                                >{status === 'immutable'?null: <EditIcon/>}
                 
                                </IconButton>

                                <IconButton
                                    aria-label="Scarica"
                                    size="medium"
                                    onClick={(e) => deleteElementFromArr(e, email)}
                                >{status === 'immutable'?null: <DeleteIcon
                                        sx={{ color: '#FF0000' }}
                                    />}
                  
                                </IconButton>
                            </div>
              
                        </div>
                    );
                })}
            </div>

        

        </div>

    );
};
export default DynamicInsert;