import { useEffect, useState, useRef } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import { marked } from 'marked';

export default function ProctoredTest({ topic, testData, difficulty, onNewTest, onRetakeTest }) {
    const videoRef = useRef(null);
    const [phoneDetected, setPhoneDetected] = useState(false);
    const [currentAnswers, setCurrentAnswers] = useState(Array(testData.questions.length).fill(null));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [cheatReason, setCheatReason] = useState('');
    const [cameraError, setCameraError] = useState('');
    const [usingMobileNet, setUsingMobileNet] = useState(false);
    const [weakAreas, setWeakAreas] = useState([]);
    const [selectedWeakArea, setSelectedWeakArea] = useState(null);
    const [learningResources, setLearningResources] = useState(null);
    const [loadingResources, setLoadingResources] = useState(false);
    const [modelLoaded, setModelLoaded] = useState(false);

    // Phone detection and proctoring logic
    useEffect(() => {
        if (phoneDetected && !isSubmitted) {
            setCheatReason('Mobile phone detected in camera. Test ended.');
            setIsSubmitted(true);
        }
    }, [phoneDetected, isSubmitted]);

    useEffect(() => {
        let stream;
        let model;
        let mobileNetModel;
        let interval;

        async function enableCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: "user", 
                        width: 320, 
                        height: 240 
                    } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Wait for video to be ready
                    await new Promise((resolve) => {
                        videoRef.current.onloadedmetadata = resolve;
                    });
                }
            } catch (err) {
                setCameraError('Camera access denied or not available. Please allow camera permission to continue the test.');
                return null;
            }
            return stream;
        }

        async function loadModels() {
            try {
                model = await cocoSsd.load();
                mobileNetModel = await mobilenet.load();
                setModelLoaded(true);
                return { model, mobileNetModel };
            } catch (err) {
                console.error('Error loading models:', err);
                return null;
            }
        }

        async function initDetection() {
            const stream = await enableCamera();
            if (!stream) return;
            
            const models = await loadModels();
            if (!models) return;

            interval = setInterval(async () => {
                try {
                    if (
                        videoRef.current &&
                        videoRef.current.readyState === 4 &&
                        !cameraError &&
                        !isSubmitted
                    ) {
                        // First try COCO-SSD
                        const predictions = await models.model.detect(videoRef.current);
                        
                        const foundPhone = predictions.some(
                            (p) =>
                                (
                                    (p.class === 'cell phone' && p.score > 0.1) ||
                                    (p.class === 'camera' && p.score > 0.1) ||
                                    (p.class === 'remote' && p.score > 0.1)
                                ) &&
                                p.bbox && p.bbox[2] * p.bbox[3] > 4000
                        );

                        if (foundPhone) {
                            setPhoneDetected(true);
                            setUsingMobileNet(false);
                        } else {
                            // Fallback to MobileNet
                            const result = await models.mobileNetModel.classify(videoRef.current);
                            const foundMobileNet = result.some(
                                (r) =>
                                    (
                                        r.className.toLowerCase().includes('cell phone') ||
                                        r.className.toLowerCase().includes('mobile') ||
                                        r.className.toLowerCase().includes('smartphone') ||
                                        r.className.toLowerCase().includes('camera') ||
                                        r.className.toLowerCase().includes('lens')
                                    ) &&
                                    r.probability > 0.4
                            );
                            setUsingMobileNet(true);
                            setPhoneDetected(foundMobileNet);
                        }
                    }
                } catch (err) {
                    console.error('Detection error:', err);
                    // Continue running even if detection fails
                }
            }, 1000);
        }

        initDetection();

        // Fix: function name should be camelCase and consistent everywhere
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
            clearInterval(interval);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('keydown', handleKeyDown);
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [cameraError, isSubmitted]);

    const handleOptionClick = (questionIndex, optionIndex) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[questionIndex] = optionIndex;
        setCurrentAnswers(updatedAnswers);
    };

    const handleSubmit = () => {
        let calculatedScore = 0;
        const incorrectTopics = new Set();
        
        testData.questions.forEach((q, index) => {
            if (currentAnswers[index] === q.correctAnswer) {
                calculatedScore++;
            } else {
                if (q.topic) incorrectTopics.add(q.topic);
            }
        });
        
        setScore(calculatedScore);
        setWeakAreas(Array.from(incorrectTopics));
        setIsSubmitted(true);
        
        const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
        testResults.push({
            topic,
            difficulty,
            score: calculatedScore,
            total: testData.questions.length,
            date: new Date().toISOString(),
            weakAreas: Array.from(incorrectTopics)
        });
        localStorage.setItem('testResults', JSON.stringify(testResults));
    };

    const handleLearnTopic = async (weakTopic) => {
        setSelectedWeakArea(weakTopic);
        setLoadingResources(true);
        try {
            const apiKey = import.meta.env.VITE_GROQ_API_KEY;
            const endpoint = import.meta.env.VITE_GROQ_API_ENDPOINT;

            const messages = [
                {
                    role: 'user',
                    content: `Provide a detailed explanation of ${weakTopic} in the context of ${topic}. 
                    Include key concepts, examples, and 2 practice questions with answers. 
                    Format your response in Markdown with headings, bullet points, and code blocks where appropriate.`
                }
            ];

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages,
                    temperature: 0.2
                })
            });

            const data = await response.json();
            setLearningResources(data.choices?.[0]?.message?.content || `# ${weakTopic}\n\nCould not fetch learning resources. Please search online for "${weakTopic} in ${topic}".`);
        } catch (err) {
            setLearningResources(`# ${weakTopic}\n\nCould not fetch learning resources. Please search online for "${weakTopic} in ${topic}".`);
        } finally {
            setLoadingResources(false);
        }
    };

    if (isSubmitted && cheatReason) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-3xl font-bold mb-4 text-red-600">Test Ended</h1>
                <p className="text-xl">{cheatReason}</p>
                <button 
                    onClick={onNewTest}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Start Over
                </button>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                {selectedWeakArea ? (
                    <div>
                        <button 
                            onClick={() => setSelectedWeakArea(null)}
                            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
                        >
                            ← Back to results
                        </button>
                        {loadingResources ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: marked(learningResources) }} />
                        )}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-bold mb-2">Ready to test your knowledge?</h3>
                            <div className="flex space-x-4 mt-4">
                                <button 
                                    onClick={onRetakeTest}
                                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Retry This Test
                                </button>
                                <button 
                                    onClick={onNewTest}
                                    className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Take Different Test
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Test Completed</h1>
                        <div className="mb-4">
                            <p className="text-xl">
                                Topic: <span className="font-semibold">{topic}</span> ({difficulty})
                            </p>
                            <p className="text-xl">
                                Score: <span className="font-semibold">{score} / {testData.questions.length}</span> ({Math.round((score / testData.questions.length) * 100)}%)
                            </p>
                        </div>
                        
                        {weakAreas.length > 0 ? (
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4">Areas to Improve</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {weakAreas.map((area, index) => (
                                        <div 
                                            key={index} 
                                            className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => handleLearnTopic(area)}
                                        >
                                            <h3 className="font-medium text-lg">{area}</h3>
                                            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                                                Learn this topic →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mb-8 p-4 bg-green-50 rounded-lg">
                                <h2 className="text-xl font-semibold text-green-800">Great job! You answered all questions correctly.</h2>
                            </div>
                        )}
                        
                        <div className="flex space-x-4">
                            <button 
                                onClick={onNewTest}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Take Another Test
                            </button>
                            <button 
                                onClick={onRetakeTest}
                                className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Retry This Test
                            </button>
                        </div>

                        {/* <div className="mt-8 border-t pt-6">
                            <h3 className="font-semibold mb-3">Test History</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    Your test results have been saved to your browser's local storage.
                                </p>
                            </div>
                        </div> */}
                    </div>
                )}
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
            {/* Camera window fixed on the screen */}
            <div
                style={{
                    position: 'fixed',
                    top: 24,
                    right: 24,
                    zIndex: 1000,
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
                    muted
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

            <h1 className="text-2xl font-bold mb-4">Proctored Test: {topic} ({difficulty})</h1>
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