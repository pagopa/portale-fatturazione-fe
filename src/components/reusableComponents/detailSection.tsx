import { Typography } from "@mui/material";
import TextKeyValue from "./textKeyValue";

const DetailsSection = ({ title, data, fields }) => {
  return ( 
    <div className="bg-white mb-5 me-5 ms-5"> 
      <div className="d-flex justify-content-center pt-3">
        <Typography variant="h4"> {title} </Typography> 
      </div> <div className="pt-3 pb-3">
        <div className="container text-center"> 
          {fields.map(({ key, description, formatter }) => {
            const value = data?.[key]; 
            return (
              <TextKeyValue 
                key={key} 
                description={description} 
                value={formatter ? formatter(value) : value ?? ''} /> 
            ); })
          } </div> 
      </div> 
    </div> 
  );
};

export default DetailsSection;



