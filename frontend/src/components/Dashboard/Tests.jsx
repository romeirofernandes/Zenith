import { useState } from 'react';
import ProctoredTest from './ProctoredTest';

const topics = ['Aptitude', 'DSA', 'SQL', 'System Design', 'JavaScript'];

export default function Tests() {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [testData, setTestData] = useState(null);
    const [error, setError] = useState('');

    const handleCardClick = async (topic) => {
        try {
            setSelectedTopic(topic);
            setError('');
            const data = await generateTest(topic);
            setTestData(data);
        } catch (err) {
            console.error(err);
            setError('Failed to generate test. Please try again.');
            setSelectedTopic(null);
        }
    };

    const generateTest = async (topic) => {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        const endpoint = import.meta.env.VITE_GROQ_API_ENDPOINT;

        const messages = [
            {
                role: 'user',
                content: `You are a JSON API. Respond ONLY with strict JSON. Generate 5 MCQ questions on ${topic}. Provide 4 options for each question. The JSON should be in this format:
{
  "questions": [
    {
      "question": "What is 2 + 2?",
      "options": ["1", "2", "3", "4"]
    },
    {
      "question": "Example question 2",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
    }
  ]
}`
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

        const json = await response.json();
        const content = json.choices[0].message.content;

        // Safely extract JSON block from the LLM output
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No valid JSON found in Groq response.');

        return JSON.parse(jsonMatch[0]);
    };

    if (selectedTopic && testData) {
        return <ProctoredTest topic={selectedTopic} testData={testData} />;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Select a Test Topic</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topics.map((topic) => (
                    <div
                        key={topic}
                        onClick={() => handleCardClick(topic)}
                        className="cursor-pointer rounded-lg shadow-lg p-6 bg-gray-100 hover:bg-gray-200"
                    >
                        <h2 className="text-xl font-bold">{topic}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
}
