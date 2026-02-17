import { Grid } from "@mui/material";

const ColumnGrid = ({elements,styles ,columns,keyGrid=Math.random().toString()}) => {
    return (
        <Grid 
            key={keyGrid}
            container
            columns={12}>
            {elements.map((el,i)=>{
                return (
                    <Grid
                        key={Math.random()}
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