import { DetectedObject } from '@tensorflow-models/coco-ssd';

export default class CameraView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.reload()
    }

    get disabled(): boolean {
        return this.hasAttribute("disabled");
    }

    get canvas(): HTMLCanvasElement | null {
        return this.shadowRoot!.querySelector<HTMLCanvasElement>("canvas")
    }

    draw(input: HTMLCanvasElement) {
        if (this.canvas === null) return;
        const context = this.canvas.getContext('2d')
        if (context === null) return;
        this.canvas.width = input.width as number;
        this.canvas.height = input.height as number;
        context.clearRect(0, 0, this.canvas.width as number, this.canvas.height as number);
        context?.drawImage(input, 0, 0);
    }

    static get observedAttributes() {
        return ["disabled"]
    }

    attributeChangedCallback(name: string) {
        if (name === "disabled") {
            this.reload();
        }
    }

    reload() {
        if (this.shadowRoot !== null) {
            this.shadowRoot.innerHTML = this.render();
        }
    }

    render() {
        if (this.disabled)
            return `<p>Vous avez désactivé votre webcam pour le site !</p>`
        return `<canvas></canvas>`;
    }
}

customElements.define("camera-view", CameraView);