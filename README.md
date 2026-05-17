# AI Sign Language Recognition

A browser-based app that recognizes American Sign Language (ASL) letters in real time using your webcam, machine learning, and hand tracking.

Show a sign in front of the camera and the app displays the detected letter with a confidence score and a live history chart for all 26 letters.

## Features

- **Real-time detection** — Classifies hand signs from the webcam feed
- **Hand tracking** — MediaPipe draws landmarks and a bounding box around the detected hand
- **Confidence feedback** — Visual bar shows how confident the model is (predictions below 80% are ignored)
- **Detection history** — Bar chart for letters A–Z highlights the current prediction
- **No install required** — Runs entirely in the browser; open the HTML file and allow camera access

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | HTML, CSS (glassmorphism layout, Montserrat) |
| ML model | [Teachable Machine](https://teachablemachine.withgoogle.com/) + TensorFlow.js |
| Hand tracking | [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) |
| Runtime | Vanilla JavaScript (no build step) |

## Project Structure

```
AI-Sign-Language-Recognition/
├── README.md
└── AI Sign language/
    ├── AI Sign.html      # Main page
    ├── AI Sign.css       # Styles
    ├── AI Sign.js        # Camera, MediaPipe, and model inference
    └── Model/            # Exported Teachable Machine weights (optional local copy)
        ├── model.json
        ├── metadata.json
        └── weights.bin
```

## How It Works

1. **Camera** — MediaPipe’s `Camera` utility captures frames from the webcam.
2. **Hand detection** — MediaPipe Hands finds hand landmarks and draws them on a canvas overlay. Predictions run only when a hand is visible.
3. **Classification** — A Teachable Machine image model (TensorFlow.js) predicts the sign class from the video frame.
4. **UI update** — The highest-confidence class above 80% updates the detected letter, confidence bar, and history chart. Predictions are throttled to every 150 ms for performance.

The model is loaded from Google’s Teachable Machine hosting:

`https://teachablemachine.withgoogle.com/models/PHYjxWseJ/`

To use your own trained model, replace the `URL` constant in `AI Sign.js` with your model’s export link, or point it at the files in `Model/`.


## Author

**Abdisalam Mohamed** — © 2026
