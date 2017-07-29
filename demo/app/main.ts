/**
 * Main module
 */
import { KnockoutComponents } from './KnockoutComponents';
import { KnockoutExtenions } from './plugins/KnockoutExtenions';
import { AppViewModel } from './vm/AppViewModel';

const appModel = new AppViewModel();

// init knockout extensions and components
//
const ext = new KnockoutExtenions();
const components = new KnockoutComponents(appModel);

// bind view model
ko.applyBindings(appModel);

// init application
appModel
    .init()
    .then(() => {
        // hide splash screen
        $('#page-splash').hide();
    })
    .catch((reason: any) => {
        $('#page-splash').hide();
    });
