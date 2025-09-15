import { Step, StepLabel, Stepper, Typography } from "@mui/material";

const StepperCommessa = ({mainState,activeStep,steps}) => {

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

    return(
        <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
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
                }

                stepProps.completed = index === activeStep ? false : false;
                return (
                    <Step key={label} {...stepProps}>
                        <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                );
            })}
        </Stepper>
                  
    );
};

export default StepperCommessa;