// Single Choice Question Module
// Author: Artnestico

import { CONFIG } from '../config.js';

/**
 * Formats single choice questions for DOCX
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Formatted paragraphs for DOCX
 */
export function formatSingleChoice(questions) {
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
                    indent: { left: 720 } // 0.5 inch indent
                })
            );
        });
    });

    return paragraphs;
}

/**
 * Formats answer key for single choice questions
 * @param {Array} questions - Array of question objects
 * @param {number} startIndex - Starting question number
 * @returns {Array} - Formatted paragraphs for answer key
 */
export function formatSingleChoiceAnswers(questions, startIndex = 1) {
    const paragraphs = [];

    questions.forEach((q, index) => {
        paragraphs.push(
            new docx.Paragraph({
                text: `${startIndex + index}. Відповідь: ${q.correct}`,
                spacing: { after: 100 }
            })
        );
    });

    return paragraphs;
}
