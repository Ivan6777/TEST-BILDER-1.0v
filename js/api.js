// API Handler for Gemini AI
// Author: Artnestico

import { CONFIG } from './config.js';

/**
 * Makes a request to the Gemini API
 * @param {string} prompt - The prompt to send to the API
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} - The API response
 */
export async function callGeminiAPI(prompt, retryCount = 0) {
    const url = `${CONFIG.api.endpoint}?key=${CONFIG.api.apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: CONFIG.api.temperature,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            })
        });

        if (!response.ok) {
            // Handle rate limiting (429)
            if (response.status === 429 && retryCount < CONFIG.api.maxRetries) {
                const delay = CONFIG.api.retryDelay * Math.pow(2, retryCount);
                console.log(`Rate limited. Retrying in ${delay}ms...`);
                await sleep(delay);
                return callGeminiAPI(prompt, retryCount + 1);
            }

            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid API response format');
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        if (retryCount < CONFIG.api.maxRetries && error.message.includes('fetch')) {
            const delay = CONFIG.api.retryDelay * Math.pow(2, retryCount);
            console.log(`Network error. Retrying in ${delay}ms...`);
            await sleep(delay);
            return callGeminiAPI(prompt, retryCount + 1);
        }
        throw error;
    }
}

/**
 * Generates questions for a specific type
 * @param {Object} params - Generation parameters
 * @param {string} params.topic - The topic for the questions
 * @param {string} params.sourceText - The source text
 * @param {string} params.grade - Class/Grade
 * @param {string} params.lesson - Lesson number
 * @param {string} params.questionType - Type of question
 * @param {number} params.count - Number of questions to generate
 * @returns {Promise<Array>} - Array of generated questions
 */
export async function generateQuestions(params) {
    if (params.count === 0) return [];

    const prompt = createPrompt(params);
    const responseText = await callGeminiAPI(prompt);

    // Extract JSON from response
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
        responseText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
        throw new Error('Failed to extract JSON from API response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const questions = JSON.parse(jsonText);

    return questions;
}

/**
 * Creates a prompt for the Gemini API based on question type and context
 * @param {Object} params - Generation parameters
 * @returns {string} - The formatted prompt
 */
function createPrompt({ topic, sourceText, grade, lesson, questionType, count }) {
    const contextInfo = `Клас: ${grade}, Урок №${lesson ? lesson : 'без номера'}, Тема: "${topic}"`;

    const basePrompt = `Ти - вчитель. Твоє завдання - створити ${count} тестових питань для учнів на основі наданого нижче тексту.
${contextInfo}

ТЕКСТ ДЛЯ ОПРАЦЮВАННЯ:
"""
${sourceText}
"""

Питання мають бути створені ВИКЛЮЧНО на основі цього тексту.
Відповідь ОБОВ'ЯЗКОВО має бути у форматі JSON масиву.`;

    switch (questionType) {
        case 'singleChoice':
            return `${basePrompt}
Тип питання: одна правильна відповідь.
Формат кожного питання:
{
    "question": "текст питання",
    "options": ["a) варіант 1", "b) варіант 2", "c) варіант 3", "d) варіант 4"],
    "correct": "a"
}
Поверни ТІЛЬКИ JSON масив без додаткового тексту.`;

        case 'multipleChoice':
            return `${basePrompt}
Тип питання: дві правильні відповіді.
Формат кожного питання:
{
    "question": "текст питання",
    "options": ["a) варіант 1", "b) варіант 2", "c) варіант 3", "d) варіант 4", "e) варіант 5"],
    "correct": ["a", "b"]
}
ВАЖЛИВО: Перші два варіанти (a та b) ЗАВЖДИ мають бути правильними, решта - неправильними.
Поверни ТІЛЬКИ JSON масив без додаткового тексту.`;

        case 'matching':
            return `${basePrompt}
Тип питання: встановлення відповідності (4 пари).
Формат кожного питання:
{
    "question": "Встановіть відповідність:",
    "pairs": [
        {"left": "1. Елемент 1", "right": "A. Відповідність 1"},
        {"left": "2. Елемент 2", "right": "B. Відповідність 2"},
        {"left": "3. Елемент 3", "right": "C. Відповідність 3"},
        {"left": "4. Елемент 4", "right": "D. Відповідність 4"}
    ],
    "correct": {"1": "A", "2": "B", "3": "C", "4": "D"}
}
Поверни ТІЛЬКИ JSON масив без додаткового тексту.`;

        case 'sorting':
            return `${basePrompt}
Тип питання: сортування (хронологічний або логічний порядок).
Формат кожного питання:
{
    "question": "Розташуйте у правильному порядку:",
    "items": ["Подія 1", "Подія 2", "Подія 3", "Подія 4"],
    "correctOrder": [1, 2, 3, 4]
}
items - це елементи у ПЕРЕМІШАНОМУ порядку.
correctOrder - це правильний порядок (індекси починаються з 1).
Поверни ТІЛЬКИ JSON масив без додаткового тексту.`;

        default:
            throw new Error(`Unknown question type: ${questionType}`);
    }
}

/**
 * Sleep utility function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
