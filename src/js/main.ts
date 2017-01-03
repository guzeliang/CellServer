import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
require('../css/bootstrap.css')
require('../css/style.css')
platformBrowserDynamic().bootstrapModule(AppModule);