import { useEffect, useState, useRef } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

export default function ProctoredTest({ topic, testData }) {
    const videoRef = useRef(null);
    const [phoneDetected, setPhoneDetected] = useState(false);
    const [currentAnswers, setCurrentAnswers] = useState(Array(testData.questions.length).fill(null));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [cheatReason, setCheatReason] = useState('');
    const [cameraError, setCameraError] = useState('');
    const [usingMobileNet, setUsingMobileNet] = useState(false);

    // End test if phone detected
    useEffect(() => {
        if (phoneDetected && !isSubmitted) {
            setCheatReason('Mobile phone detected in camera. Test ended.');
            setIsSubmitted(true);
        }
    }, [phoneDetected, isSubmitted]);

    useEffect(() => {
        // Request camera permission and stream
        async function enableCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setCameraError('Camera access denied or not available. Please allow camera permission to continue the test.');
            }
        }
        enableCamera();

        const endTestDueToCheating = (reason) => {
            setCheatReason(reason);
            setIsSubmitted(true);
        };

        const handleBlur = () => {
            endTestDueToCheating('Tab switch detected.');
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            endTestDueToCheating('Right-click is not allowed.');
        };

        const handleCopy = (e) => {
            e.preventDefault();
            endTestDueToCheating('Copying is not allowed.');
        };

        const handleKeyDown = (e) => {
            if (
                (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
                e.key === 'PrintScreen'
            ) {
                endTestDueToCheating('Screenshot / Copy attempt detected.');
            }
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                endTestDueToCheating('Inspect Element attempt detected.');
            }
        };

        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('keydown', handleKeyDown);
            // Stop camera stream on unmount
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        let model;
        let interval;
        let mobileNetModel;

        async function loadModelAndDetect() {
            // Try COCO-SSD first
            model = await cocoSsd.load();
            interval = setInterval(async () => {
                if (
                    videoRef.current &&
                    videoRef.current.readyState === 4 &&
                    !cameraError &&
                    !isSubmitted
                ) {
                    const predictions = await model.detect(videoRef.current);
                    const foundPhone = predictions.some(
                        (p) =>
                            (p.class === 'cell phone' || p.class === 'mobile phone' || p.class === 'phone') &&
                            p.score > 0.8 &&
                            p.bbox && p.bbox[2] * p.bbox[3] > 5000
                    );
                    if (foundPhone) {
                        setPhoneDetected(true);
                    } else {
                        // If COCO-SSD fails, try MobileNet classification
                        if (!mobileNetModel) {
                            mobileNetModel = await mobilenet.load();
                        }
                        const result = await mobileNetModel.classify(videoRef.current);
                        // Look for any class containing "cell phone", "mobile", "smartphone"
                        const foundMobileNet = result.some(
                            (r) =>
                                (r.className.toLowerCase().includes('cell phone') ||
                                 r.className.toLowerCase().includes('mobile') ||
                                 r.className.toLowerCase().includes('smartphone')) &&
                                r.probability > 0.5
                        );
                        setUsingMobileNet(true);
                        setPhoneDetected(foundMobileNet);
                    }
                }
            }, 900);
        }
        if (!cameraError && !isSubmitted) loadModelAndDetect();
        return () => clearInterval(interval);
    }, [cameraError, isSubmitted]);

    const handleOptionClick = (questionIndex, optionIndex) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[questionIndex] = optionIndex;
        setCurrentAnswers(updatedAnswers);
    };

    const handleSubmit = () => {
        let calculatedScore = 0;
        testData.questions.forEach((q, index) => {
            if (q.options[q.answer] === q.options[currentAnswers[index]]) {
                calculatedScore++;
            }
        });
        setScore(calculatedScore);
        setIsSubmitted(true);
    };

    if (isSubmitted && cheatReason) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-3xl font-bold mb-4 text-red-600">Test Ended</h1>
                <p className="text-xl">{cheatReason}</p>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Test Completed</h1>
                <p className="text-xl">Your Score: {score} / {testData.questions.length}</p>
            </div>
        );
    }

    return (
        <div
            className="p-8 relative"
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
            }}
        >
            {/* Camera feed at top right */}
            <div
                style={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    zIndex: 50,
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    padding: '6px'
                }}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    width={240}
                    height={280}
                    style={{ borderRadius: '8px', border: '2px solid #3b82f6', background: '#eee' }}
                />
                {cameraError && (
                    <div className="mt-2 text-xs text-red-600 max-w-[140px]">{cameraError}</div>
                )}
                {phoneDetected && (
                    <div className="mt-2 text-xs text-red-600 max-w-[140px] font-bold">
                        Mobile Phone Detected! ({usingMobileNet ? 'MobileNet' : 'COCO-SSD'})
                    </div>
                )}
            </div>

            <h1 className="text-2xl font-bold mb-4">Proctored Test: {topic}</h1>
            {cameraError && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {cameraError}
                </div>
            )}
            <div className="space-y-6">
                {testData.questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 border rounded shadow">
                        <h2 className="font-semibold mb-2">{qIndex + 1}. {q.question}</h2>
                        <ul className="space-y-2">
                            {q.options.map((opt, optIndex) => (
                                <li
                                    key={optIndex}
                                    onClick={() => handleOptionClick(qIndex, optIndex)}
                                    className={`p-2 border rounded cursor-pointer hover:bg-gray-100 ${
                                        currentAnswers[qIndex] === optIndex ? 'bg-blue-100 font-semibold' : ''
                                    }`}
                                >
                                    {opt}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <button
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={!!cameraError}
            >
                Submit Test
            </button>
        </div>
    );
}
