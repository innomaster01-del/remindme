import { registerRootComponent } from 'expo';
import App from './App';
import './src/geo'; // defines the background geofencing task at startup
import { registerWidget } from './src/widget';

registerRootComponent(App);
registerWidget();
