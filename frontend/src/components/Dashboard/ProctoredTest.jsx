import { useEffect, useState } from 'react';

export default function ProctoredTest({ topic, testData }) {
    const [currentAnswers, setCurrentAnswers] = useState(Array(testData.questions.length).fill(null));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [cheatReason, setCheatReason] = useState('');

    useEffect(() => {
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
        };
    }, []);

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
            className="p-8"
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
            }}
        >
            <h1 className="text-2xl font-bold mb-4">Proctored Test: {topic}</h1>
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
            >
                Submit Test
            </button>
        </div>
    );
}
