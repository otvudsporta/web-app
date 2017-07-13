import './style.scss';

import { div, form, fieldset, input, br, button, svg, path, Properties } from 'compote/html';
import { vm } from './data';

// TODO: Use form data
// TODO: Add validation
export const LoginView = {
  oninit: vm.init,
  view: () => (
    div({ class: 'container fade-in-animation' }, [
      form({ class: 'form', onsubmit: vm.returnFalse },
        fieldset({ class: 'form-panel', disabled: vm.data.loading }, [
          button({ class: 'facebook-button width-100p br-md mb-xl bg-facebook pa-md color-neutral-light', type: 'button', onclick: vm.loginWithFacebook }, [
            FacebookLogo({ class: 'mr-sm mv-n-sm' }),
            'Вход с Facebook'
          ]),
          input({
            class: 'form-input',
            type: 'email', name: 'email', placeholder: 'Имейл', autofocus: true, required: true,
            onkeyup: vm.loginOnEnter, oninput: vm.setEmail
          }),
          br(),
          input({
            class: 'form-input',
            type: 'password', name: 'password', placeholder: 'Парола', required: true,
            onkeyup: vm.loginOnEnter, oninput: vm.setPassword
          }),
          br(),
          button({ class: 'form-button', type: 'submit', onclick: vm.login }, 'Вход')
        ])
      )
    ])
  )
};

// Facebook
const FacebookLogo = (props?: Properties<SVGSVGElement>) => (
  svg(<any>{ width: 20, height: 20, viewBox: '0 0 266.893 266.895', ...props }, [
    path(<any>{
      d: 'M252.164 266.895c8.134 0 14.729-6.596 14.729-14.73V14.73c0-8.137-6.596-14.73-14.729-14.73H14.73C6.593 0 0 6.594 0 14.73v237.434c0 8.135 6.593 14.73 14.73 14.73h237.434z',
      fill: 'white'
    }),
    path(<any>{
      d: 'M184.152 266.895V163.539h34.692l5.194-40.28h-39.887V97.542c0-11.662 3.238-19.609 19.962-19.609l21.329-.01V41.897c-3.689-.49-16.351-1.587-31.08-1.587-30.753 0-51.807 18.771-51.807 53.244v29.705h-34.781v40.28h34.781v103.355h41.597z',
      fill: '#3b5998'
    })
  ])
);
