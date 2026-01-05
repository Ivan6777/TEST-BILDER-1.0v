// Configuration file for Test Generator
// Author: Artnestico

export const CONFIG = {
    // API Configuration
    api: {
        // Google Gemini API endpoint
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',

        // API Key - Replace with your actual API key
        apiKey: '',

        // Model settings
        model: 'gemini-2.0-flash-exp',

        // Generation parameters
        temperature: 0.7,
        maxRetries: 3,
        retryDelay: 2000 // milliseconds
    },

    // DOCX Style Configuration
    docx: {
        font: 'Times New Roman',
        fontSize: 24, // 12pt = 24 half-points
        lineSpacing: 1.15,
        margins: {
            top: 1440, // 1 inch = 1440 twips
            right: 1440,
            bottom: 1440,
            left: 1440
        }
    },

    // Application Metadata
    app: {
        name: 'AI Test Generator',
        version: '1.0.0',
        author: 'Artnestico',
        year: new Date().getFullYear()
    },

    // Question Type Configuration
    questionTypes: {
        singleChoice: {
            name: 'Одна правильна відповідь',
            optionsCount: 4,
            correctCount: 1
        },
        multipleChoice: {
            name: 'Дві правильні відповіді',
            optionsCount: 5,
            correctCount: 2
        },
        matching: {
            name: 'Встановлення відповідності',
            pairsCount: 4
        },
        sorting: {
            name: 'Сортування',
            itemsCount: 4
        }
    }
};
