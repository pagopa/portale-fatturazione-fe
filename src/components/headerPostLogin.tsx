import { HeaderAccount } from '@pagopa/mui-italia';

type JwtUser = {
    id: string;
    name?: string;
    surname?: string;
    email?: string;
};

export default function HeaderPostLogin() {
    const pagoPALink = {
        label: 'PagoPA S.p.A.',
        href: 'https://www.pagopa.it/',
        ariaLabel: 'Link: vai al sito di PagoPA S.p.A.',
        title: 'Sito di PagoPA S.p.A.',
    };

    const user: JwtUser = {
        id: "1",
        name: "Ermenegildo",
        surname: "Zegna",
        email: "mario.rossi@gmail.com",
    };


    return (

        <div className="div_header">
            <HeaderAccount
                rootLink={pagoPALink}
                loggedUser={user}
                onAssistanceClick={() => {
                    console.log('Clicked/Tapped on Assistance');
                }}
                onLogin={() => {
                    console.log('User login');
                }}
                onLogout={() => {
                    console.log('User logout');
                }}
            />

        </div>
    );
}
