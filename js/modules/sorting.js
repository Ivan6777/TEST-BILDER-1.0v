// Sorting Question Module
// Author: Artnestico

import { CONFIG } from '../config.js';

/**
 * Formats sorting questions for DOCX
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Formatted paragraphs for DOCX
 */
export function formatSorting(questions) {
    const paragraphs = [];

    questions.forEach((q, index) => {
        // Question text
        paragraphs.push(
            new docx.Paragraph({
                text: `${index + 1}. ${q.question}`,
                spacing: { before: 200, after: 100 },
                style: 'Normal'
            })
        );

        // Items (shuffled)
        q.items.forEach((item, i) => {
            paragraphs.push(
                new docx.Paragraph({
                    text: `${i + 1}) ${item}`,
                    spacing: { after: 50 },
                    indent: { left: 720 }
                })
            );
        });
    });

    return paragraphs;
}

/**
 * Formats answer key for sorting questions
 * @param {Array} questions - Array of question objects
 * @param {number} startIndex - Starting question number
 * @returns {Array} - Formatted paragraphs for answer key
 */
export function formatSortingAnswers(questions, startIndex = 1) {
    const paragraphs = [];

    questions.forEach((q, index) => {
        const orderText = q.correctOrder.join(', ');
        paragraphs.push(
            new docx.Paragraph({
                text: `${startIndex + index}. Правильний порядок: ${orderText}`,
                spacing: { after: 100 }
            })
        );
    });

    return paragraphs;
}
