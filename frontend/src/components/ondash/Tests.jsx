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

// Fallback test data for all topics
const fallbackTests = {
    Aptitude: {
        questions: [
            {
                question: "What is the next number in the sequence: 2, 4, 8, 16, ?",
                options: ["18", "20", "24", "32"]
            },
            {
                question: "If 5x = 20, what is x?",
                options: ["2", "3", "4", "5"]
            },
            {
                question: "Which is the odd one out: Apple, Banana, Carrot, Mango?",
                options: ["Apple", "Banana", "Carrot", "Mango"]
            },
            {
                question: "What is 15% of 200?",
                options: ["15", "20", "25", "30"]
            },
            {
                question: "If a train travels 60 km in 1.5 hours, what is its speed?",
                options: ["30 km/h", "40 km/h", "45 km/h", "60 km/h"]
            }
        ]
    },
    DSA: {
        questions: [
            {
                question: "Which data structure uses FIFO order?",
                options: ["Stack", "Queue", "Tree", "Graph"]
            },
            {
                question: "What is the time complexity of binary search?",
                options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"]
            },
            {
                question: "Which sorting algorithm is NOT stable?",
                options: ["Merge Sort", "Bubble Sort", "Quick Sort", "Insertion Sort"]
            },
            {
                question: "Which data structure is used for recursion?",
                options: ["Queue", "Stack", "Heap", "Graph"]
            },
            {
                question: "What is the maximum number of children a binary tree node can have?",
                options: ["1", "2", "3", "4"]
            }
        ]
    },
    SQL: {
        questions: [
            {
                question: "Which SQL command is used to remove all records from a table?",
                options: ["DELETE", "REMOVE", "DROP", "TRUNCATE"]
            },
            {
                question: "What does the acronym SQL stand for?",
                options: ["Structured Query Language", "Simple Query Language", "Sequential Query Language", "Standard Query Language"]
            },
            {
                question: "Which clause is used to filter records?",
                options: ["WHERE", "ORDER BY", "GROUP BY", "HAVING"]
            },
            {
                question: "Which function returns the number of rows?",
                options: ["SUM()", "COUNT()", "AVG()", "MAX()"]
            },
            {
                question: "Which JOIN returns all rows from both tables?",
                options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"]
            }
        ]
    },
    "System Design": {
        questions: [
            {
                question: "What is the main benefit of load balancing?",
                options: ["Security", "Scalability", "Cost", "Latency"]
            },
            {
                question: "Which database is best for storing relationships?",
                options: ["Relational DB", "NoSQL DB", "Graph DB", "Key-Value Store"]
            },
            {
                question: "What is a CDN used for?",
                options: ["Data Storage", "Caching", "Content Delivery", "Authentication"]
            },
            {
                question: "Which is a stateless protocol?",
                options: ["HTTP", "FTP", "SMTP", "SSH"]
            },
            {
                question: "What is sharding?",
                options: ["Replication", "Partitioning", "Caching", "Indexing"]
            }
        ]
    },
    JavaScript: {
        questions: [
            {
                question: "Which keyword declares a block-scoped variable?",
                options: ["var", "let", "const", "static"]
            },
            {
                question: "What is the output of '2' + 2 in JavaScript?",
                options: ["4", "'22'", "NaN", "undefined"]
            },
            {
                question: "Which method converts JSON to a JS object?",
                options: ["JSON.parse()", "JSON.stringify()", "parseJSON()", "toObject()"]
            },
            {
                question: "Which of these is NOT a JavaScript data type?",
                options: ["Number", "String", "Character", "Boolean"]
            },
            {
                question: "What does DOM stand for?",
                options: ["Document Object Model", "Data Object Model", "Document Oriented Model", "Data Oriented Model"]
            }
        ]
    }
};

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
            // Fallback to static questions if API fails
            setTestData(fallbackTests[topic.name]);
            setError('Could not generate test from AI. Loaded fallback questions.');
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

        // Fallback fast: If not ok or empty, throw to trigger fallback
        if (!response.ok) throw new Error('API error');
        const text = await response.text();
        if (!text) throw new Error('Empty response');
        let json;
        try {
            json = JSON.parse(text);
        } catch {
            // Try to extract JSON block if extra text is present
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No valid JSON found in API response.');
            json = JSON.parse(jsonMatch[0]);
        }
        const content = json.choices?.[0]?.message?.content;
        if (!content) throw new Error('No content in API response.');
        const contentMatch = content.match(/\{[\s\S]*\}/);
        if (!contentMatch) throw new Error('No valid JSON found in Groq response.');
        return JSON.parse(contentMatch[0]);
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