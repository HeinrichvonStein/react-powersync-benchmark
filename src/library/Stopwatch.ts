export default class Stopwatch {
    private startTime: number | null = null;
    private stopTime: number | null = null;
    private running = false;

    // Start the stopwatch
    start(): void {
        if (!this.running) {
            this.startTime = Date.now() - (this.stopTime ? Date.now() - this.stopTime : 0);
            this.running = true;
            this.stopTime = null;
        }
    }

    // Stop the stopwatch
    stop(): void {
        if (this.running) {
            this.stopTime = Date.now();
            this.running = false;
        }
    }

    // Reset the stopwatch
    reset(): void {
        this.startTime = null;
        this.stopTime = null;
        this.running = false;
    }

    // Get the elapsed time in milliseconds
    getElapsedTime(): number {
        if (this.startTime === null) return 0;
        if (this.running) {
            return Date.now() - this.startTime;
        } else {
            return this.stopTime ? this.stopTime - this.startTime : 0;
        }
    }
}

//
// // Usage example
// const stopwatch = new Stopwatch();
//
// stopwatch.start();
// setTimeout(() => {
//     stopwatch.stop();
//     console.log(`Elapsed time: ${stopwatch.getElapsedTime()} ms`);
// }, 1000);