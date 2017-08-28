/**
 * Main module
 */
import { KnockoutComponents } from './KnockoutComponents';
import { jQueryExtensions } from './plugins/jQueryExtensions';
import { KnockoutExtensions } from './plugins/KnockoutExtensions';
import { AppViewModel } from './vm/AppViewModel';

const appModel = new AppViewModel();

// init jquery extensions
jQueryExtensions();

// init knockout extensions and components
//
const ext = new KnockoutExtensions();
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
