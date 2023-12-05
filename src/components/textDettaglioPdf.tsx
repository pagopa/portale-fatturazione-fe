import {Typography} from '@mui/material';
import { TextPdfProps } from '../types/typeModuloCommessaInserimento';

const TextDettaglioPdf : React.FC<TextPdfProps> = ({description, value}) =>{
    return(
        <div className="row mt-3">
            <div className="col d-flex flex-row-reverse">
                <Typography  variant="overline">{description}</Typography>
            </div>
            <div className="col d-flex flex-row">
                <Typography  variant="caption">{value}</Typography>
            </div>
        </div>
    );
};

export default TextDettaglioPdf;