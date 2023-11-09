import React from 'react';
import {
  TextField, Button, Typography, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Email {
  tipo?: number;
  email?: string
}

interface DynamicInsertProps {
  status: string,
  arrElement: Email[]
}

const  DynamicInsert : React.FC<DynamicInsertProps> = (props) => {
  const {status, arrElement} = props;
  const [arr, setArr] = useState<Email [] >([]);
  const [element, setElement] = useState<{email?: string, tipo?: number}>({ });
console.log('dynamic');
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (element.email) {
       setArr([...arr, element]);
      setElement({});
    }
  };
  const handleElement = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    const el = e.target.value;
    setElement({ tipo: Math.random(), email: el });
  };

  const editArray = (tipo?: number) => {
  
    const el = arr.filter((singleObj ) => singleObj.tipo === tipo);

    const newArr = arr.filter((singleObj) => singleObj.tipo !== tipo);
    setArr(newArr);
    setElement(el[0]);
  };

  const deleteElementFromArr = (tipo?: number) => {
    const newArr = arr.filter((singleObj) => singleObj.tipo !== tipo);
    setArr(newArr);
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className=" mb-3 ">
        {arrElement.map((el : Email) => {
          const { tipo , email} = el;

          return (
            <div className='d-flex' key={tipo}>
              <div style={{width: '30%'}}>
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
                  onClick={() => editArray(tipo)}
                >{status === 'immutable'?null: <EditIcon/>}
                 
                </IconButton>

                <IconButton
                  aria-label="Scarica"
                  size="medium"
                  onClick={() => deleteElementFromArr(tipo)}
                >{status === 'immutable'?null: <DeleteIcon
                sx={{ color: '#FF0000' }}
              />}
                  
                </IconButton>
              </div>
              
            </div>
          );
        })}
      </div>

      <div>
        <TextField
          label={`Email amministrativo  di riferimento Max ${3 - arrElement.length}`}
          placeholder="Indirizzo email amministrativo"
          sx={{ width: '25%' }}
          onChange={(e) => { handleElement(e); }}
          value={element.email || ''}
          disabled={(arrElement.length >= 3 || status=== 'immutable') ? true : false}
        />

        <Button
          variant="contained"
          sx={{ marginLeft: '20px' }}
          size="small"
          type="submit"
          disabled={(arrElement.length >= 3 || status=== 'immutable') ? true : false}
        >
          <AddIcon fontSize="small" sx={{ color: 'ffffff' }} />
          Aggiungi Email

        </Button>
      </div>

    </form>

  );
};
export default DynamicInsert;