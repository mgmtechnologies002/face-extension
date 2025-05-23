// face-expression-extension.js
class FaceExpression {
    constructor() {
        this.faceapiReady = false;
        this.expressions = {};
        this.video = null;

        this.loadFaceAPI();
    }

    getInfo() {
        return {
            id: 'faceexpression',
            name: 'Face Expression',
            blocks: [
                {
                    opcode: 'getExpression',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'expression [EMOTION] confidence',
                    arguments: {
                        EMOTION: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'emotions',
                            defaultValue: 'happy'
                        }
                    }
                },
                {
                    opcode: 'isExpression',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'expression is [EMOTION]',
                    arguments: {
                        EMOTION: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'emotions',
                            defaultValue: 'happy'
                        }
                    }
                }
            ],
            menus: {
                emotions: {
                    acceptReporters: true,
                    items: ['happy', 'sad', 'angry', 'surprised', 'neutral', 'disgusted', 'fearful']
                }
            }
        };
    }

    async loadFaceAPI() {
        if (this.faceapiReady) return;

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models')
        ]);

        this.startVideo();
        this.faceapiReady = true;
    }

    async startVideo() {
        this.video = document.createElement('video');
        this.video.width = 320;
        this.video.height = 240;
        this.video.autoplay = true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            this.detectExpressions();
        } catch (e) {
            console.error("Camera access denied or error:", e);
        }
    }

    async detectExpressions() {
        setInterval(async () => {
            if (!this.faceapiReady || !this.video) return;

            const detections = await faceapi.detectSingleFace(this.video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
            if (detections && detections.expressions) {
                this.expressions = detections.expressions;
            }
        }, 500); // Detect every 0.5 seconds
    }

    getExpression(args) {
        const emotion = args.EMOTION.toLowerCase();
        return (this.expressions[emotion] || 0).toFixed(2);
    }

    isExpression(args) {
        const emotion = args.EMOTION.toLowerCase();
        return (this.expressions[emotion] || 0) > 0.5;
    }
}

Scratch.extensions.register(new FaceExpression());
await faceapi.nets.tinyFaceDetector.loadFromUri('https://your-username.github.io/face-extension/models');
await faceapi.nets.faceExpressionNet.loadFromUri('https://your-username.github.io/face-extension/models');
