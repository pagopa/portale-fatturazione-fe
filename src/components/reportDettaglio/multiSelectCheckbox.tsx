import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { listaEntiNotifichePage, manageError } from '../../api/api';
import { useNavigate } from 'react-router';
import { MultiselectNotificheProps, OptionMultiselectChackbox } from '../../types/typeReportDettaglio';
import {useState, useEffect} from 'react';
import { BodyListaNotifiche } from '../../types/typesGeneral';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiselectCheckbox : React.FC <MultiselectNotificheProps> = ({mainState, setBodyGetLista}) => {

    const navigate = useNavigate();

    
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const [textValue, setTextValue] = useState('');

    const [dataSelect, setDataSelect] = useState([]);

   

   


    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        await listaEntiNotifichePage(token, mainState.nonce, {descrizione:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
                
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };

    useEffect(()=>{

        const timer = setTimeout(() => {
         
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);

        
    },[textValue]);

   
    return (
        <Autocomplete
            multiple
            onChange={(event, value) => {
                const arrayIdEnte = value.map(obj=> obj.idEnte);
                setBodyGetLista((prev:BodyListaNotifiche) => ({...prev,...{idEnti:arrayIdEnte}}));
            }}
            id="checkboxes-tags-demo"
            options={dataSelect}
            disableCloseOnSelect
            getOptionLabel={(option:OptionMultiselectChackbox) => (option.descrizione)}
            
            renderOption={(props, option, { selected }) =>{
                //settato come key l'id ente 
                const newProps = {...props,...{key:option.idEnte}};
                return (
                    <li {...newProps}   >
                        
                        <Checkbox
                            
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        
                        {option.descrizione}
                    </li>
                );
            } }
            style={{ marginLeft: '20px' }}
            renderInput={(params) =>{
               
                return <TextField 
                    onChange={(e)=> setTextValue(e.target.value)} 
                    {...params}
                    label="Rag Soc. Ente" 
                    placeholder="Rag Soc. Ente" />;
            } 
                
            }
        />
    );
};

export default MultiselectCheckbox;

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: 'Pulp Fiction', year: 1994 },
    {
        title: 'The Lord of the Rings: The Return of the King',
        year: 2003,
    },
    { title: 'The Good, the Bad and the Ugly', year: 1966 },
    { title: 'Fight Club', year: 1999 },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        year: 2001,
    },
    {
        title: 'Star Wars: Episode V - The Empire Strikes Back',
        year: 1980,
    },
    { title: 'Forrest Gump', year: 1994 },
    { title: 'Inception', year: 2010 },
    {
        title: 'The Lord of the Rings: The Two Towers',
        year: 2002,
    },
    { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
    { title: 'Goodfellas', year: 1990 },
    { title: 'The Matrix', year: 1999 },
    { title: 'Seven Samurai', year: 1954 },
    {
        title: 'Star Wars: Episode IV - A New Hope',
        year: 1977,
    },
    { title: 'City of God', year: 2002 },
    { title: 'Se7en', year: 1995 },
    { title: 'The Silence of the Lambs', year: 1991 },
    { title: "It's a Wonderful Life", year: 1946 },
    { title: 'Life Is Beautiful', year: 1997 },
    { title: 'The Usual Suspects', year: 1995 },
    { title: 'Léon: The Professional', year: 1994 },
    { title: 'Spirited Away', year: 2001 },
    { title: 'Saving Private Ryan', year: 1998 },
    { title: 'Once Upon a Time in the West', year: 1968 },
    { title: 'American History X', year: 1998 },
    { title: 'Interstellar', year: 2014 },
];