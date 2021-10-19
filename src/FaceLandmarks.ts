import { AbstractModel } from "./AbstractModel";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";


export class FaceLandmarks extends AbstractModel<faceLandmarksDetection.FaceLandmarksPrediction> {
    private _detector: Promise<faceLandmarksDetection.FaceLandmarksDetector>;
    detector: faceLandmarksDetection.FaceLandmarksDetector | undefined;
    constructor() {
        super();
        this._detector = faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh)
    }
    async loaded(): Promise<boolean> {
        try { 
            this.detector = await this._detector
        } catch {
            return false;
        }
        return true;
    }

    async detect(input: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement): Promise<faceLandmarksDetection.FaceLandmarksPrediction[]> {
        if (this.detector === undefined) {
            await this.loaded()
        }
        if (this.detector !== undefined) {
            const results = await this.detector.estimateFaces({input});
            return results;
        }
        return [];
    }
    draw(img: CanvasImageSource, results: faceLandmarksDetection.FaceLandmarksPrediction[]): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = img.width as number;
        canvas.height = img.height as number;

        const context = canvas.getContext('2d')
        if (context === null) return canvas;
        context.clearRect(0, 0, img.width as number, img.height as number);
        context.drawImage(img, 0, 0);
        for (let result of results) {
            const keypoints = result.scaledMesh;
            context.fillStyle = "#32EEDB";

            for (let i = 0; i < 468; i++) {
                const x = (keypoints as any)[i][0];
                const y = (keypoints as any)[i][1];

                context.beginPath();
                context.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
                context.fill();
            }
        }
        return canvas;
    }
}