import './style.css'

import CameraScreen from './CameraScreen'


const app = new CameraScreen();

document.querySelector<HTMLDivElement>('#app')!.appendChild(app)
