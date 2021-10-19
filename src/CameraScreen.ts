import CameraView from './CameraView';
import './CameraView';
import { AbstractModel } from './AbstractModel';
import { CocoClassifier } from './CocoClassifier';
import { FaceLandmarks } from './FaceLandmarks';


export default class CameraScreen extends HTMLElement {
    classifiers: Map<string, AbstractModel<any>> = new Map<string, AbstractModel<any>>();
    stream: MediaStream | null = null;
    captureCanvas = document.createElement('canvas');
    selectedClassifier = "FaceLandmarks"
    stopping: ((value: boolean | PromiseLike<boolean>) => void) | null = null;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.loadAsync();
        this.classifiers.set("CocoSSD", new CocoClassifier())
        this.classifiers.set("FaceLandmarks", new FaceLandmarks())
    }
    
    get classifier(): AbstractModel<any> {
        if (this.classifiers.has(this.selectedClassifier))
                return this.classifiers.get(this.selectedClassifier)!;
        return this.classifiers.get("CocoSSD")!
    }
    
    async loadAsync() {
        await this.launchStream()
        this.reload()
    }

    get cameraView() {
        return this.shadowRoot!.querySelector<CameraView>("camera-view")
    }

    async launchStream() {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        this.startStream()
    }

    async startStream() {
        this.stopping = null
        this.readStream()
    }

    async stopStream() {
        await (new Promise<boolean>((resolve) => {
            this.stopping = resolve
        }))
    }

    async readStream() {
        if (this.stopping !== null) {
            console.log("stopped")
            this.stopping(true)
            return
        }
        console.log("reading")
        if (this.stream === null) return;
        const track = this.stream?.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track);
        const frame = await imageCapture.grabFrame();
        const context = this.captureCanvas.getContext("2d");
        this.captureCanvas.height = frame.height;
        this.captureCanvas.width = frame.width;
        if (context !== null) {
            context.clearRect(0, 0, frame.width, frame.height);
            context.drawImage(frame, 0, 0);
            if (this.cameraView !== null) {
                const result = await this.classifier.detect(this.captureCanvas);
                const canvas = this.classifier.draw(this.captureCanvas, result);
                this.cameraView.draw(canvas);
            }
        }
        requestAnimationFrame(this.readStream.bind(this));
    }

    reload() {
        if (this.shadowRoot !== null) {
            this.shadowRoot.innerHTML = this.render();
            this.attachListeners()
        }
    }

    attachListeners() {
        this.shadowRoot?.querySelector("#classifiers")?.addEventListener("change", ()=> { 
            this.stopStream().then(() => {
                this.selectedClassifier = (this.shadowRoot?.querySelector("#classifiers")! as HTMLSelectElement).value
                this.reload();
                this.startStream()
            })
        })
    }

    render() {
        return `
        <select name="classifiers" id="classifiers">
        ${Array.from(this.classifiers.keys()).map((classifier) => `<option value="${classifier}"${this.selectedClassifier == classifier ? ' selected' : ''}>${classifier}</option>`)}
        </select>
        <div class="camera">${this.classifier !== null ? `<camera-view ${this.stream?.active ? '' : 'disabled '}/>` : 'Loading...'}</div>`;
    }
}

customElements.define("camera-screen", CameraScreen)