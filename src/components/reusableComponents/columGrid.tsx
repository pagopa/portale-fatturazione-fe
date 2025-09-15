import { Grid } from "@mui/material";

const ColumnGrid = ({elements,styles ,columns}) => {
    return (
        <Grid 
            container
            columns={12}>
            {elements.map((el,i)=>{
                return (
                    <Grid
                        sx={styles[i]}
                        item
                        xs={columns[i]}
                    > {el}</Grid>
                );
            })}
        </Grid>
    );
};

export default ColumnGrid;