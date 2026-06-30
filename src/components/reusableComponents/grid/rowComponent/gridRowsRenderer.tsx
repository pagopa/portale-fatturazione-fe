import { TableCell, TableCellProps, TableRow, Tooltip } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RowContratto from "../gridCustomBase/rowTipologiaContratto";
import RowWhiteList from "../gridCustomBase/rowWhiteList";
import RowOrchestratore from "../gridCustomBase/rowOrchestratore";
import RowAsyncDoc from "../gridCustomBase/rowAsyncDoc";
import RowContestazioni from "../gridCustomBase/rowContestazioni";
import DefaultRow from "../gridCustomBase/rowDefault";
import RowModCommessaPrevisionale from "../gridCustomBase/rowModCommessaPrevisonale";
import RowCollapsible from "../gridCustomBase/rowCollapsible";
import { HeaderGridCustom } from "../gridCustom";

interface GridRowsRendererProps {
  element: any;
  sliced: any;
  nameParameterApi: string;
  apiGet?: (el: any) => void;
  headerNames:HeaderGridCustom[];
  headerNamesCollapse?: string[] | { label: string; align: TableCellProps['align']; width: number | string }[];
  selected?: number[];
  setSelected?: React.Dispatch<React.SetStateAction<number[]>>;
  checkIfChecked?: (id: any) => boolean;
}

const GridRowsRenderer = ({
  element,
  sliced,
  nameParameterApi,
  apiGet,
  headerNames,
  headerNamesCollapse,
  selected,
  setSelected,
  checkIfChecked,
}: GridRowsRendererProps) => {
  switch (nameParameterApi) {
  case 'idContratto':
    return <RowContratto key={Math.random()} apiGet={apiGet} element={element} headerNames={headerNames} />;

  case 'idWhite':
    return (
      <RowWhiteList
        element={element}
        headerNames={headerNames}
        setSelected={setSelected}
        selected={selected || []}
        checkIfChecked={checkIfChecked}
      />
    );

  case 'idOrchestratore':
    return <RowOrchestratore key={Math.random()} sliced={sliced} element={element} headerNames={headerNames} />;

  case 'asyncDocEnte':
    return <RowAsyncDoc key={Math.random()} sliced={sliced} headerNames={headerNames} element={element} apiGet={apiGet} />;

  case 'contestazionePage':
    return <RowContestazioni key={Math.random()} sliced={sliced} apiGet={apiGet} element={element} headerNames={headerNames} />;

  case 'modComTrimestrale':
  case 'idNotifica':
    return (
      <DefaultRow
        key={element.id}
        element={element}
        sliced={sliced}
        apiGet={apiGet}
        headerNames={headerNames}
        nameParameterApi={nameParameterApi}
      />
    );

  case 'idPrevisonale':
    return <RowModCommessaPrevisionale key={element.id} sliced={sliced} element={element} headerNames={headerNames} />;

  case 'docEmessiEnte':
  case 'docSospesiSend':
    return (
      <RowCollapsible
        key={`${element.idFattura}-${element.id}`}
        sliced={sliced}
        element={element}
        headerNamesCollapse={headerNamesCollapse}
        apiGet={apiGet}
      />
    );
  default:
    return (
      <TableRow
        sx={{
          height: '80px',
          borderTop: '4px solid #F2F2F2',
          borderBottom: '2px solid #F2F2F2',
          backgroundColor: nameParameterApi === 'docEmessiEnteContestate' ? '#ffeff1' : undefined,
          '&:hover': {
            backgroundColor: '#EDEFF1',
          },
        }}
        key={Math.random()}
      >
        {Object.values(sliced).map((value: string | number | any, i: number) => {
          let cssFirstColum:
              | { color: string; fontWeight?: string; cursor?: string }
              | undefined = { color: '#0D6EFD', fontWeight: 'bold', cursor: 'pointer' };

          if (i === 0 && nameParameterApi !== 'storico_documenti_contabili' && nameParameterApi !== 'docEmessiEnteContestate') {
            cssFirstColum = { color: '#0D6EFD', fontWeight: 'bold', cursor: 'pointer' };
          } else if (i !== 0) {
            cssFirstColum = undefined;
          } else if ((nameParameterApi === 'storico_documenti_contabili' || nameParameterApi === 'docEmessiEnteContestate') && i === 0) {
            cssFirstColum = { color: '#0D6EFD', fontWeight: 'bold' };
          }

          const valueEl = (i === 0 && value?.toString().length > 30) ? value?.toString().slice(0, 30) + '...' : value;

          return (
            <Tooltip
              key={Math.random()}
              title={
                (value === '--'
                    || valueEl?.length < 30
                    || (((nameParameterApi === 'idTestata' || nameParameterApi === 'storico_documenti_contabili') && i === 0 && valueEl?.length < 30)
                      || (nameParameterApi === 'idTestata' && i !== 0)))
                  ? null
                  : value
              }
            >
              <TableCell
                align={(nameParameterApi === 'modComTrimestrale' || nameParameterApi === 'docEmessiEnteContestate' || i !== 0) ? 'center' : 'left'}
                sx={cssFirstColum}
                onClick={() => { if (i === 0 && apiGet) apiGet({
                  nomeEnteClickOn:element.ragioneSociale,
                  mese:element.mese,
                  anno:element.anno,
                  id:element[nameParameterApi]
                }); }}
              >
                {(valueEl === null || valueEl === '') ? '--' : valueEl}
              </TableCell>
            </Tooltip>
          );
        })}
        {apiGet && (
          <TableCell align="center" onClick={() => { apiGet({
            nomeEnteClickOn:element.ragioneSociale,
            mese:element.mese,
            anno:element.anno,
            id:element[nameParameterApi]
          }); }}>
            <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} />
          </TableCell>
        )}
      </TableRow>
    );
  }
};

export default GridRowsRenderer;
