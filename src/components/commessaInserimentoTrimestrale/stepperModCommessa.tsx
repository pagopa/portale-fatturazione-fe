import { Step, StepLabel, Stepper } from "@mui/material";

const StepperCommessa = ({activeStep,steps}) => {
/*
DA utilizzare nel caso di inserimento con piu moduli commessa
La logica era stata pensata con l'inserimento multiplo , logica iniziale del modulo commessa trimestrale
    const isStepFacoltativo = (step: number) => {
        const indexes = mainState.infoTrimestreComSelected?.moduli?.reduce((acc, obj, index) => {
            if (obj?.source === "facoltativo") acc?.push(index);
            return acc;
        }, []);
        return indexes?.includes(step);
    };
    const isStepArchiviato = (step: number) => {
        const indexes = mainState.infoTrimestreComSelected?.moduli?.reduce((acc, obj, index) => {
            if (obj?.source === "archiviato") acc?.push(index);
            return acc;
        }, []);
        return indexes?.includes(step);
    };
    const isStepObbligatorio = (step: number) => {
        const indexes = mainState.infoTrimestreComSelected?.moduli?.reduce((acc, obj, index) => {
            if (obj?.source === "obbligatorio") acc?.push(index);
            return acc;
        }, []);
        return indexes?.includes(step);
    };
*/
    return(
        <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
               
                /*
                DA utilizzare nel caso di inserimento con piu moduli commessa
                La logica era stata pensata con l'inserimento multiplo , logica iniziale del modulo commessa trimestrale

                 const stepProps: { completed?: boolean } = {};
                const labelProps: {
                    optional?: React.ReactNode;
                } = {};
                if (isStepFacoltativo(index)) {
                    labelProps.optional = (
                        <Typography variant="caption">Facoltativo</Typography>
                    );
                }
                if (isStepArchiviato(index)) {
                    labelProps.optional = (
                        <Typography variant="caption">Archiviato</Typography>
                    );
                }
                if (isStepObbligatorio(index)) {
                    labelProps.optional = (
                        <Typography variant="caption">Obbligatorio</Typography>
                    );
                }*/

                return (
                    <Step key={`${label}-${index}`}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                );
            })}
        </Stepper>
                  
    );
};

export default StepperCommessa;