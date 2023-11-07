import React from 'react';
import {
  TextField, Button, Typography, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Email {
  id?: number;
  element?: string
  
}

const  DynamicInsert : React.FC = () => {
  const [arr, setArr] = useState<Email [] >([]);
  const [element, setElement] = useState<{element?: string, id?: number}>({ });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (element.element) {
       setArr([...arr, element]);
      setElement({});
    }
  };
  const handleElement = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = e.target.value;
    setElement({ id: Math.random(), element: el });
  };

  const editArray = (id?: number) => {
    const el = arr.filter((singleObj ) => singleObj.id === id);

    const newArr = arr.filter((singleObj) => singleObj.id !== id);
    setArr(newArr);
    setElement(el[0]);
  };

  const deleteElementFromArr = (id?: number) => {
    const newArr = arr.filter((singleObj) => singleObj.id !== id);
    setArr(newArr);
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className=" mb-3 ">
        {arr.map((el) => {
          const { id } = el;

          return (
            <div className='d-flex' key={el.id}>
              <div style={{width: '30%'}}>
              <Typography
                variant="caption-semibold"
                fontSize="large"
              >
                {el.element}

              </Typography>
              </div>
              
              <div>
               <IconButton
                  aria-label="Edit"
                  color="primary"
                  size="small"
                >
                  <EditIcon
                    onClick={() => editArray(id)}
                  />
                </IconButton>

                <IconButton
                  aria-label="Scarica"
                  size="medium"
                >
                  <DeleteIcon
                    sx={{ color: '#FF0000' }}
                    onClick={() => deleteElementFromArr(id)}
                  />
                </IconButton>
              </div>
              
            </div>
          );
        })}
      </div>

      <div>
        <TextField
          label={`Email amministrativo  di riferimento Max ${3 - arr.length}`}
          placeholder="Indirizzo email amministrativo"
          sx={{ width: '25%' }}
          onChange={(e) => { handleElement(e); }}
          value={element.element || ''}
          disabled={arr.length >= 3}
        />

        <Button
          variant="contained"
          sx={{ marginLeft: '20px' }}
          size="small"
          type="submit"
          disabled={arr.length >= 3}
        >
          <AddIcon fontSize="small" sx={{ color: 'ffffff' }} />
          Aggiungi Email

        </Button>
      </div>

    </form>

  );
};
export default DynamicInsert;