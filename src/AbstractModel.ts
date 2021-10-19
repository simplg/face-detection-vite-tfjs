export abstract class AbstractModel<T> {
    abstract detect(input: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement): Promise<T[]>
    abstract draw(img: CanvasImageSource, results: T[]): HTMLCanvasElement
}