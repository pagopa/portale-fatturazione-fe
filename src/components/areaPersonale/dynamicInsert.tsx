import React, { useEffect } from 'react';
import {
    TextField, Button, Typography, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState} from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {DynamicInsertProps,DatiFatturazione,Email}  from '../../types/typesAreaPersonaleUtenteEnte';
import { _YupEmail} from '../../validations/email/index';

const  DynamicInsert : React.FC<DynamicInsertProps> = (props) => {

    const {status, arrElement, setData,datiFatturazione,mainState} = props;
    const [element, setElement] = useState('');
    const [validation, setValidation] = useState(false);
    //FORSE DA ELIMINARE
    /*
    useEffect(()=>{
        setValidation(false);
    },[mainState]);
*/

    useEffect(()=>{
        if(mainState.datiFatturazione){
            hendleOnMouseOut();
        }else{
            setValidation(true);
        }
       
    },[]);


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
 
    const hendleOnMouseOut = (e?: React.ChangeEvent<HTMLInputElement>) =>{
        e?.persist();
        const emailAlreadyExist = arrElement.map(obj => Object.values(obj)).flat().every(el => el !== e?.target.value);
        _YupEmail.validate(e?.target.value|| "").then(( )=>{
            if(arrElement.length === 0 && (e?.target.value||"") === ''){
                setValidation(true);
            }else if(!emailAlreadyExist){
                setValidation(true);
            }else{
                setValidation(false);
            }
        }).catch(()=>{
            setValidation(true);
        } );
    };

    const handleElement = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    let dynamicInsertDisable = true;
    if(arrElement.length >= 3){
        dynamicInsertDisable = true;
     
    }else if(status === 'mutable' && datiFatturazione.tipoCommessa === ''){
        dynamicInsertDisable = true;
    }else if((status === 'mutable' && datiFatturazione.tipoCommessa !== '' )){
        dynamicInsertDisable = false;
    }

    const colorEmailInserted = status === 'immutable' ? '#C3CAD1': 'black';

    return (
        <div className=''>
            <div className='d-flex'>
                <TextField
                    required
                    label={`Email amministrativo`}
                    placeholder="Email amministrativo"
                    helperText={`max ${3 - arrElement?.length}`}
                    sx={{width:'65%'}}
                    type='text'
                    value={element||''}
                    onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{
                        handleElement(e);
                        hendleOnMouseOut(e);
                    }}
                    disabled={dynamicInsertDisable}
                    error={
                        (validation && status === "mutable" && datiFatturazione.tipoCommessa !== "") ||
                        (status === "mutable" && datiFatturazione.tipoCommessa !== "" && arrElement.length === 0 && element === "")
                    }  
                />
                <div className='d-flex align-items-center'>
                    <Button
                        variant="contained"
                        sx={(!dynamicInsertDisable && !validation && element.length > 0) ? {marginLeft: '20px', border: "3px solid #6CC66A"} :{ marginLeft: '20px'}}
                        size="small"
                        onClick={(e) => handleSubmit(e)}
                        disabled={validation || dynamicInsertDisable|| element.length === 0}    
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
                        <div className='d-flex w-auto' key={Math.random()}>
                            <div className='d-flex align-items-center'>
                                <Typography
                                    variant="caption-semibold"
                                    fontSize="large"
                                    sx={{color:colorEmailInserted }}
                                >
                                    {email}
                                </Typography>
                            </div>
                            <div className='d-flex ms-3'>
                                {status === 'immutable' ? null:
                                    <IconButton
                                        aria-label="Edit"
                                        color="primary"
                                        size="small"
                                        onClick={(e)=> editArray(e, email)}
                                    ><EditIcon/>
                                    </IconButton>}
                                {status === 'immutable' ? null:
                                    <IconButton
                                        aria-label="Scarica"
                                        size="medium"
                                        onClick={(e) => deleteElementFromArr(e, email)}
                                    > <DeleteIcon
                                            sx={{ color: '#FF0000' }}
                                        />
                                    </IconButton>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default DynamicInsert;