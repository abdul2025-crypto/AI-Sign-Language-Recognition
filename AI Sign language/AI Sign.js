// Teachable Machine model
const URL = "https://teachablemachine.withgoogle.com/models/PHYjxWseJ/";

let model, maxPredictions;
let lastPredictionTime = 0;
const PREDICTION_INTERVAL = 150;

const videoElement = document.getElementById("cameraVideo");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");

const detectedLetterSpan = document.getElementById("detectedLetter");
const confidenceFill = document.getElementById("confidenceFill");


const historyBars = document.getElementById('historyBars');
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const barMap = {};

letters.forEach(letter => {
    const barDiv = document.createElement('div');
    barDiv.className = 'history-bar';

    const letterSpan = document.createElement('span');
    letterSpan.className = 'letter';
    letterSpan.innerText = letter;

    const barContainer = document.createElement('div');
    barContainer.className = 'bar-container';

    const barFill = document.createElement('div');
    barFill.className = 'bar-fill';

    barContainer.appendChild(barFill);
    barDiv.appendChild(letterSpan);
    barDiv.appendChild(barContainer);
    historyBars.appendChild(barDiv);

    barMap[letter] = barFill;
});

function updateHistoryBar(letter, confidence) {
    // confidence: 0 to 1
    Object.keys(barMap).forEach(l => {
        if (l === letter) {
            barMap[l].style.width = `${Math.floor(confidence*100)}%`;
        } else {
            barMap[l].style.width = '0%'; // reset other bars
        }
    });
}
// ===== END NEW SECTION =====

let lastDetected = "";

// Load model
async function initModel() {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();
}

// MediaPipe Hands
const hands = new Hands({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0, // faster model
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});

hands.onResults(onResults);

// Camera
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 480,
    height: 360
});

camera.start();

// Process results
async function onResults(results) {

    overlay.width = videoElement.videoWidth;
    overlay.height = videoElement.videoHeight;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // If no hands → skip prediction
    if (!results.multiHandLandmarks) return;

    for (let hand of results.multiHandLandmarks) {
        drawHand(hand);
    }

    const now = Date.now();

    // Limit prediction speed
    if (now - lastPredictionTime < PREDICTION_INTERVAL) return;

    lastPredictionTime = now;

    const prediction = await model.predict(videoElement);

    let highest = prediction[0];

    prediction.forEach(p => {
        if (p.probability > highest.probability) {
            highest = p;
        }
    });

    if (highest.probability < 0.80) return;

    // Update UI only if changed
    if (lastDetected !== highest.className) {

        lastDetected = highest.className;

        detectedLetterSpan.innerText = highest.className;

        confidenceFill.style.width =
            `${Math.floor(highest.probability * 100)}%`;

        // ===== UPDATE HISTORY BAR =====
        updateHistoryBar(highest.className, highest.probability);
    }
}

// Draw hand landmarks
function drawHand(landmarks) {

    ctx.strokeStyle = "#ff8c00";
    ctx.lineWidth = 3;

    let minX = overlay.width, minY = overlay.height;
    let maxX = 0, maxY = 0;

    for (let point of landmarks) {

        const x = point.x * overlay.width;
        const y = point.y * overlay.height;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd700";
        ctx.fill();

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }

    ctx.strokeStyle = "#ffd700";
    ctx.strokeRect(minX - 10, minY - 10, maxX - minX + 20, maxY - minY + 20);
}

// Initialize
async function init() {
    await initModel();
}

init();