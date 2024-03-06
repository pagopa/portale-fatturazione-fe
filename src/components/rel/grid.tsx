import * as React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

const columns: GridColDef[] = [
    { field: 'contractId', headerName: 'ID', width: 70 },
    { field: 'tipologiaFatture', headerName: 'Tipologia Fattura', width: 160 },
    { field: 'anno', headerName: 'Anno', width: 130 },
    {
        field: 'mese',
        headerName: 'Mese',
     
        width: 130,
    },
    { field: 'totaleAnalogico', headerName: 'Tot. Analogico', width: 130 },
    { field: 'totaleDigitale', headerName: 'Tot. Digitale', width: 130 },
    { field: 'totaleNotAnalogiche', headerName: 'Tot. Not. Analogico', width: 130 },
    { field: 'totaleNotDigitali', headerName: 'Tot. Not. Digitali', width: 130 },
    { field: 'totale', headerName: 'Totale', width: 130 },
];

const rows = [
    { contractId: 1, tipologiaFatture: 'Primo saldo', anno: 2023, mese: 'Gennaio', totaleAnalogico:10, totaleDigitale:2,totaleNotAnalogiche:9,totaleNotDigitali:8,totale:100 },
    { contractId: 2, tipologiaFatture: 'Secondo saldo', anno: 2023, mese: 'Gennaio', totaleAnalogico:10, totaleDigitale:2,totaleNotAnalogiche:9,totaleNotDigitali:8,totale:100 },
    { contractId: 3, tipologiaFatture: 'Primo saldo', anno: 2023, mese: 'Gennaio', totaleAnalogico:10, totaleDigitale:2,totaleNotAnalogiche:9,totaleNotDigitali:8,totale:100 },
    { contractId: 4, tipologiaFatture: 'Secondo saldo', anno: 2023, mese: 'Gennaio', totaleAnalogico:10, totaleDigitale:2,totaleNotAnalogiche:9,totaleNotDigitali:8,totale:100 },
    { contractId: 5, tipologiaFatture: 'Primo saldo', anno: 2023, mese: 'Gennaio', totaleAnalogico:10, totaleDigitale:2,totaleNotAnalogiche:9,totaleNotDigitali:8,totale:100},
    { contractId: 6, tipologiaFatture: 'Secondo saldo', anno: 2023, mese: 'Gennaio', totaleAnalogico:10, totaleDigitale:2,totaleNotAnalogiche:9,totaleNotDigitali:8,totale:100 },
    { contractId: 7, tipologiaFatture: 'Primo saldo', anno: 2023, mese: 'Gennaio', totaleAnalogico:10, totaleDigitale:2,totaleNotAnalogiche:9,totaleNotDigitali:8,totale:100 },
    { contractId: 8, tipologiaFatture: 'Secondo saldo', anno: 2023, mese: 'Gennaio', totaleAnalogico:10, totaleDigitale:2,totaleNotAnalogiche:9,totaleNotDigitali:8,totale:100 },
    { contractId: 9, tipologiaFatture: 'Primo saldo', anno: 2023, mese: 'Gennaio', totaleAnalogico:10, totaleDigitale:2,totaleNotAnalogiche:9,totaleNotDigitali:8,totale:100 },
];

export default function DataTable() {
    return (
        <div style={{  width: '100%' }}>
            <DataGrid
                sx={{
                    '&.MuiDataGrid-root': {
                        borderStyle: 'none',
                    },
                    '& .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    },
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                }}
                rows={rows}
                columns={columns}
                getRowId={(row) => row.contractId}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10]}
                autoHeight
                disableColumnMenu

            />
        </div>
    );
}
