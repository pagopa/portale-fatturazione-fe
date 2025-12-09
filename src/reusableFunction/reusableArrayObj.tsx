export const month = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",'Gennaio'];
export  const mesiWithZero = ['01','02','03','04','05','06','07','08','09','10','11','12'];

export const currentYear = (new Date()).getFullYear().toString();

export  const mesi = [
    {1:'Gennaio'},{2:'Febbraio'},{3:'Marzo'},{4:'Aprile'},{5:'Maggio'},{6:'Giugno'},
    {7:'Luglio'},{8:'Agosto'},{9:'Settembre'},{10:'Ottobre'},{11:'Novembre'},{12:'Dicembre'}];

export const objMesiWithZero = {
    '01':'Gen','02':'Feb','03':'Mar','04':'Apr','05':'Mag','06':'Giu',
    '07':'Lug','08':'Ago','09':'Set','10':'Ott','11':'Nov','12':'Dic'
};

export  const mesiFix = [
    {1:'Gennaio'},{2:'Febbraio'},{3:'Marzo'},{4:'Aprile'},{5:'Maggio'},{6:'Giugno'},
    {7:'Luglio'},{8:'Agosto'},{9:'Settembre'},{10:'Ottobre'}];

export  const mesiGrid = ["Dicembre", "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

export const tipoNotifica = [ { id: 1, name: "Digitali" },
    { id: 2, name: "Analogico AR Nazionali" },
    { id: 3, name: "Analogico AR Internazionali" },
    { id: 4, name: "Analogico RS Nazionali" },
    { id: 5, name: "Analogico RS Internazionali" },
    { id: 6, name: "Analogico 890" }];

export const tipoNotificaArray = [
    "Digitali",
    "Analogico AR Nazionali", 
    "Analogico AR Internazionali",
    "Analogico RS Nazionali", 
    "Analogico RS Internazionali", 
    "Analogico 890"];

export  const mesiDescNome = [
    {
        "descrizione": "Gennaio",
        "mese": 1
    },
    {
        "descrizione": "Febbraio",
        "mese": 2
    },
    {
        "descrizione": "Marzo",
        "mese": 3
    },
    {
        "descrizione": "Aprile",
        "mese": 4
    },
    {
        "descrizione": "Maggio",
        "mese": 5
    },
    {
        "descrizione": "Giugno",
        "mese": 6
    },
    {
        "descrizione": "Luglio",
        "mese": 7
    },
    {
        "descrizione": "Agosto",
        "mese": 8
    },
    {
        "descrizione": "Settembre",
        "mese": 9
    },
    {
        "descrizione": "Ottobre",
        "mese": 10
    },
    {
        "descrizione": "Novembre",
        "mese": 11
    },
    {
        "descrizione": "Dicembre",
        "mese": 12
    }
];

export const statiContestazione = ["Non Contestata","Annullata","Contestata Ente","Risposta Send", "Risposta Recapitista",
    "Risposta Consolidatore","Risposta Ente","Accettata","Rifiutata/Chiusa"
];


export const statoInvio = [
    {
        "id": 3,
        "description": "Tutte"
    },
    {
        "id": 4,
        "description": "Non inviata"
    },
    {
        "id": 1,
        "description": "Inviata"
    },
    {
        "id": 2,
        "description": "In elaborazione"
    }
];