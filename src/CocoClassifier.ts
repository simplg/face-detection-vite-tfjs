import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';

import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { AbstractModel } from "./AbstractModel";


export class CocoClassifier extends AbstractModel<cocoSsd.DetectedObject> {
    _classifier: Promise<cocoSsd.ObjectDetection>;
    classifier: cocoSsd.ObjectDetection | undefined;
    constructor() {
        super()
        this._classifier = cocoSsd.load({ base: 'lite_mobilenet_v2' })
    }

    async loaded(): Promise<boolean> {
        try { 
            this.classifier = await this._classifier
        } catch {
            return false;
        }
        return true;
    }

    async detect(input: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement): Promise<cocoSsd.DetectedObject[]> {
        if (this.classifier === undefined) {
            await this.loaded()
        }
        if (this.classifier !== undefined) {
            const results = await this.classifier.detect(input);
            return results;
        }
        return [];
    }
    draw(img: CanvasImageSource, results: cocoSsd.DetectedObject[]): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = img.width as number;
        canvas.height = img.height as number;

        const context = canvas.getContext('2d')
        if (context === null) return canvas;
        context.clearRect(0, 0, img.width as number, img.height as number);
        context.drawImage(img, 0, 0);
        for (let result of results) {
            context.beginPath();
            context.rect(...result.bbox);
            context.lineWidth = 1;
            context.strokeStyle = 'green';
            context.fillStyle = 'green';
            context.stroke();
            context.fillText(
                result.score.toFixed(3) + ' ' + result.class, result.bbox[0],
                result.bbox[1] > 10 ? result.bbox[1] - 5 : 10);
        }
        return canvas;
    }

}