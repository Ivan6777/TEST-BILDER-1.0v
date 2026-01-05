// Matching Question Module
// Author: Artnestico

import { CONFIG } from '../config.js';

/**
 * Formats matching questions for DOCX
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Formatted paragraphs and tables for DOCX
 */
export function formatMatching(questions) {
    const elements = [];

    questions.forEach((q, index) => {
        // Question text
        elements.push(
            new docx.Paragraph({
                text: `${index + 1}. ${q.question}`,
                spacing: { before: 200, after: 100 },
                style: 'Normal'
            })
        );

        // Create table for matching
        const table = new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
                // Header row
                new docx.TableRow({
                    children: [
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: 'Елемент', bold: true })],
                            shading: { fill: 'E5E7EB' }
                        }),
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: 'Відповідність', bold: true })],
                            shading: { fill: 'E5E7EB' }
                        })
                    ]
                }),
                // Data rows
                ...q.pairs.map(pair =>
                    new docx.TableRow({
                        children: [
                            new docx.TableCell({
                                children: [new docx.Paragraph(pair.left)]
                            }),
                            new docx.TableCell({
                                children: [new docx.Paragraph(pair.right)]
                            })
                        ]
                    })
                )
            ]
        });

        elements.push(table);
        elements.push(new docx.Paragraph({ text: '', spacing: { after: 200 } }));
    });

    return elements;
}

/**
 * Formats answer key for matching questions
 * @param {Array} questions - Array of question objects
 * @param {number} startIndex - Starting question number
 * @returns {Array} - Formatted paragraphs for answer key
 */
export function formatMatchingAnswers(questions, startIndex = 1) {
    const paragraphs = [];

    questions.forEach((q, index) => {
        const answerText = Object.entries(q.correct)
            .map(([key, value]) => `${key}-${value}`)
            .join(', ');

        paragraphs.push(
            new docx.Paragraph({
                text: `${startIndex + index}. Відповідність: ${answerText}`,
                spacing: { after: 100 }
            })
        );
    });

    return paragraphs;
}
