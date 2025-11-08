import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import { createPinia } from 'pinia'

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import FloatLabel from 'primevue/floatlabel';
import Toast from 'primevue/toast';
import Menubar from 'primevue/menubar';
import Avatar from 'primevue/avatar';
import Message from 'primevue/message';
import FileUpload from 'primevue/fileupload';
import Textarea from 'primevue/textarea';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Panel from 'primevue/panel';
import ConfirmDialog from 'primevue/confirmdialog';

// Global CSS
import './assets/main.css'

// Global Prism.js Imports for TinyMCE
import 'prismjs/components/prism-core';
import Prism from 'prismjs';
window.Prism = Prism; // Attach to window for TinyMCE plugin

// Prism common language components
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue);
app.use(ToastService);
app.use(ConfirmationService);

// Register PrimeVue Components Globally
app.component('Button', Button);
app.component('Card', Card);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('FloatLabel', FloatLabel);
app.component('Toast', Toast);
app.component('Menubar', Menubar);
app.component('Avatar', Avatar);
app.component('Message', Message);
app.component('FileUpload', FileUpload);
app.component('Textarea', Textarea);
app.component('Accordion', Accordion);
app.component('AccordionTab', AccordionTab);
app.component('Panel', Panel);
app.component('ConfirmDialog', ConfirmDialog);

app.mount('#app')
