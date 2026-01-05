// Multiple Choice Question Module
// Author: Artnestico

import { CONFIG } from '../config.js';

/**
 * Formats multiple choice questions for DOCX
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Formatted paragraphs for DOCX
 */
export function formatMultipleChoice(questions) {
    const paragraphs = [];

    questions.forEach((q, index) => {
        // Question number and text
        paragraphs.push(
            new docx.Paragraph({
                text: `${index + 1}. ${q.question}`,
                spacing: { before: 200, after: 100 },
                style: 'Normal'
            })
        );

        // Options
        q.options.forEach(option => {
            paragraphs.push(
                new docx.Paragraph({
                    text: option,
                    spacing: { after: 50 },
                    indent: { left: 720 }
                })
            );
        });
    });

    return paragraphs;
}

/**
 * Formats answer key for multiple choice questions
 * @param {Array} questions - Array of question objects
 * @param {number} startIndex - Starting question number
 * @returns {Array} - Formatted paragraphs for answer key
 */
export function formatMultipleChoiceAnswers(questions, startIndex = 1) {
    const paragraphs = [];

    questions.forEach((q, index) => {
        const answers = Array.isArray(q.correct) ? q.correct.join(', ') : q.correct;
        paragraphs.push(
            new docx.Paragraph({
                text: `${startIndex + index}. Відповіді: ${answers}`,
                spacing: { after: 100 }
            })
        );
    });

    return paragraphs;
}
