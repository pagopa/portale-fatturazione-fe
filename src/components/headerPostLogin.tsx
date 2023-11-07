import { HeaderAccount } from '@pagopa/mui-italia';

export default function HeaderPostLogin() {
  const pagoPALink = {
    label: 'PagoPA S.p.A.',
    href: 'https://www.pagopa.it/',
    ariaLabel: 'Link: vai al sito di PagoPA S.p.A.',
    title: 'Sito di PagoPA S.p.A.',
  };
  return (

    <div className="div_header">
      <HeaderAccount
        rootLink={pagoPALink}
        loggedUser={false}
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
