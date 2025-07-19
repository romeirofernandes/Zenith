import { useState } from 'react';
import { BookOpen, Database, Code, Server, Brain } from 'lucide-react';
import ProctoredTest from './ProctoredTest';

const topics = [
    {
        name: 'Aptitude',
        icon: Brain,
        description: 'Logical reasoning and problem-solving skills',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
    },
    {
        name: 'DSA',
        icon: Code,
        description: 'Data Structures and Algorithms',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    {
        name: 'SQL',
        icon: Database,
        description: 'Database queries and operations',
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
    },
    {
        name: 'System Design',
        icon: Server,
        description: 'Scalable system architecture',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
    },
    {
        name: 'JavaScript',
        icon: BookOpen,
        description: 'Modern JavaScript concepts',
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
    }
];

export default function Tests() {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [testData, setTestData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(null);

    const handleCardClick = async (topic) => {
        try {
            setSelectedTopic(topic.name);
            setLoading(topic.name);
            setError('');
            const data = await generateTest(topic.name);
            setTestData(data);
        } catch (err) {
            console.error(err);
            setError('Failed to generate test. Please try again.');
            setSelectedTopic(null);
        } finally {
            setLoading(null);
        }
    };

    const generateTest = async (topicName) => {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        const endpoint = import.meta.env.VITE_GROQ_API_ENDPOINT;

        const messages = [
            {
                role: 'user',
                content: `You are a JSON API. Respond ONLY with strict JSON. Generate 5 MCQ questions on ${topicName}. Provide 4 options for each question. The JSON should be in this format: {   "questions": [     {       "question": "What is 2 + 2?",       "options": ["1", "2", "3", "4"]     },     {       "question": "Example question 2",       "options": ["Option 1", "Option 2", "Option 3", "Option 4"]     }   ] }`
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                        Skill Assessment Center
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose your test category and challenge yourself with our comprehensive assessments
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
                            <div className="font-semibold mb-1">Test Generation Failed</div>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>
                )}

                {/* Test Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {topics.map((topic) => {
                        const IconComponent = topic.icon;
                        const isLoading = loading === topic.name;
                        
                        return (
                            <div
                                key={topic.name}
                                onClick={() => !isLoading && handleCardClick(topic)}
                                className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                                    isLoading ? 'pointer-events-none' : ''
                                }`}
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 h-64 hover:border-gray-300 transition-colors duration-300">
                                    {/* Background Gradient - subtle on white */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                    
                                    {/* Loading Overlay */}
                                    {isLoading && (
                                        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                                        </div>
                                    )}
                                    
                                    {/* Card Content */}
                                    <div className="relative p-8 h-full flex flex-col">
                                        {/* Icon */}
                                        <div className={`mb-6 p-3 rounded-xl bg-gradient-to-br ${topic.color} w-fit group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                        
                                        {/* Title */}
                                        <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">
                                            {topic.name}
                                        </h2>
                                        
                                        {/* Description */}
                                        <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                                            {topic.description}
                                        </p>
                                        
                                        {/* Action Indicator */}
                                        <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                                            <span className="mr-2">Start Test</span>
                                            <div className="w-0 h-0.5 bg-current group-hover:w-6 transition-all duration-300"></div>
                                        </div>
                                    </div>
                                    
                                    {/* Decorative Elements */}
                                    <div className={`absolute top-4 right-4 w-2 h-2 rounded-full opacity-20 bg-gradient-to-br ${topic.color}`}></div>
                                    <div className={`absolute top-8 right-8 w-1 h-1 rounded-full opacity-30 bg-gradient-to-br ${topic.color}`}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center mt-16 text-gray-500">
                    <p className="text-sm">
                        Each test contains 5 multiple-choice questions • Estimated time: 10-15 minutes
                    </p>
                </div>
            </div>
        </div>
    );
}