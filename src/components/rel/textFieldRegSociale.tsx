import { TextField } from "@mui/material";
import { TextRegioneSocialeRelProps } from "../../types/typeRel";

const TextRagioneSociale : React.FC<TextRegioneSocialeRelProps> = ({setValue, values}) =>{

    return (
        <TextField
            sx={{width:'80%', marginLeft:'20px'}}
            label="Rag Soc. Ente"
            placeholder="Rag Soc. Ente"
            value={values.descrizione}
            onChange={(e) => setValue((prev)=> ({...prev, ...{ragioneSociale:e.target.value}}))}
        />
    );
};

export default TextRagioneSociale;