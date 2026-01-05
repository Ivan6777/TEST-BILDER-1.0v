// DOCX Exporter Module
// Author: Artnestico

import { CONFIG } from './config.js';
import { formatSingleChoice, formatSingleChoiceAnswers } from './modules/single_choice.js';
import { formatMultipleChoice, formatMultipleChoiceAnswers } from './modules/multiple_choice.js';
import { formatMatching, formatMatchingAnswers } from './modules/matching.js';
import { formatSorting, formatSortingAnswers } from './modules/sorting.js';

/**
 * Creates and downloads a DOCX file with test questions
 * @param {Object} allQuestions - Object containing all question types for both variants
 * @param {Object} context - Context object (topic, grade, lesson, sourceText)
 */
export async function createDocxFile(allQuestions, context) {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

    // Extract context string or object
    const topic = context.topic || context; // fallback if string passed
    const grade = context.grade || '';
    const lesson = context.lesson || '';

    // Make docx available globally for modules
    window.docx = docx;

    const sections = [];

    // Helper function to create header table
    const createHeaderTable = (variant) => {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
            },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({ text: `Клас: ${grade}`, bold: true }),
                                new Paragraph({ text: `Урок №: ${lesson}`, bold: true })
                            ],
                            width: { size: 50, type: WidthType.PERCENTAGE }
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({ text: `Варіант: ${variant}`, alignment: AlignmentType.RIGHT, bold: true }),
                                new Paragraph({ text: `Дата: ________________`, alignment: AlignmentType.RIGHT })
                            ],
                            width: { size: 50, type: WidthType.PERCENTAGE }
                        })
                    ]
                })
            ]
        });
    };

    // Create Variant 1
    sections.push({
        properties: {},
        children: [
            createHeaderTable(1),
            new Paragraph({ text: '', spacing: { after: 200 } }),

            // Title
            new Paragraph({
                text: 'ТЕСТОВА РОБОТА',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            }),
            new Paragraph({
                text: `Тема: ${topic}`,
                alignment: AlignmentType.CENTER,
                bold: true,
                spacing: { after: 400 }
            }),

            // Questions
            ...formatAllQuestions(allQuestions.variant1),

            // Page break before answer key
            new Paragraph({
                text: '',
                pageBreakBefore: true
            }),

            // Answer Key
            new Paragraph({
                text: 'ВІДПОВІДІ - Варіант 1',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),

            ...formatAllAnswers(allQuestions.variant1)
        ]
    });

    // Create Variant 2
    sections.push({
        properties: {
            page: {
                pageNumbers: {
                    start: 1,
                    formatType: 'decimal'
                }
            }
        },
        children: [
            // Page break before variant 2
            new Paragraph({
                text: '',
                pageBreakBefore: true
            }),

            createHeaderTable(2),
            new Paragraph({ text: '', spacing: { after: 200 } }),

            // Title
            new Paragraph({
                text: 'ТЕСТОВА РОБОТА',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            }),
            new Paragraph({
                text: `Тема: ${topic}`,
                alignment: AlignmentType.CENTER,
                bold: true,
                spacing: { after: 400 }
            }),

            // Questions
            ...formatAllQuestions(allQuestions.variant2),

            // Page break before answer key
            new Paragraph({
                text: '',
                pageBreakBefore: true
            }),

            // Answer Key
            new Paragraph({
                text: 'ВІДПОВІДІ - Варіант 2',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),

            ...formatAllAnswers(allQuestions.variant2)
        ]
    });

    // Create document
    const doc = new Document({
        sections: sections,
        styles: {
            default: {
                document: {
                    run: {
                        font: CONFIG.docx.font,
                        size: CONFIG.docx.fontSize
                    },
                    paragraph: {
                        spacing: {
                            line: 276, // 1.15 line spacing
                            before: 0,
                            after: 0
                        }
                    }
                }
            }
        },
        creator: CONFIG.app.author,
        description: `Test generated by ${CONFIG.app.name}`,
        title: `Тест: ${topic}`
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const fileName = `Test_${grade}_${topic.replace(/\s+/g, '_')}_${Date.now()}.docx`;
    saveAs(blob, fileName);
}

/**
 * Formats all questions for a variant
 * @param {Object} questions - Questions object
 * @returns {Array} - Array of formatted elements
 */
function formatAllQuestions(questions) {
    const elements = [];
    let questionNumber = 1;

    // Single Choice
    if (questions.singleChoice && questions.singleChoice.length > 0) {
        elements.push(
            new docx.Paragraph({
                text: 'Одна правильна відповідь:',
                bold: true,
                spacing: { before: 200, after: 200 }
            })
        );
        elements.push(...formatSingleChoice(questions.singleChoice));
        questionNumber += questions.singleChoice.length;
    }

    // Multiple Choice
    if (questions.multipleChoice && questions.multipleChoice.length > 0) {
        elements.push(
            new docx.Paragraph({
                text: 'Дві правильні відповіді:',
                bold: true,
                spacing: { before: 400, after: 200 }
            })
        );
        elements.push(...formatMultipleChoice(questions.multipleChoice));
        questionNumber += questions.multipleChoice.length;
    }

    // Matching
    if (questions.matching && questions.matching.length > 0) {
        elements.push(
            new docx.Paragraph({
                text: 'Встановлення відповідності:',
                bold: true,
                spacing: { before: 400, after: 200 }
            })
        );
        elements.push(...formatMatching(questions.matching));
        questionNumber += questions.matching.length;
    }

    // Sorting
    if (questions.sorting && questions.sorting.length > 0) {
        elements.push(
            new docx.Paragraph({
                text: 'Сортування:',
                bold: true,
                spacing: { before: 400, after: 200 }
            })
        );
        elements.push(...formatSorting(questions.sorting));
    }

    return elements;
}

/**
 * Formats all answers for a variant
 * @param {Object} questions - Questions object
 * @returns {Array} - Array of formatted paragraphs
 */
function formatAllAnswers(questions) {
    const paragraphs = [];
    let startIndex = 1;

    // Single Choice Answers
    if (questions.singleChoice && questions.singleChoice.length > 0) {
        paragraphs.push(
            new docx.Paragraph({
                text: 'Одна правильна відповідь:',
                bold: true,
                spacing: { before: 200, after: 200 }
            })
        );
        paragraphs.push(...formatSingleChoiceAnswers(questions.singleChoice, startIndex));
        startIndex += questions.singleChoice.length;
    }

    // Multiple Choice Answers
    if (questions.multipleChoice && questions.multipleChoice.length > 0) {
        paragraphs.push(
            new docx.Paragraph({
                text: 'Дві правильні відповіді:',
                bold: true,
                spacing: { before: 300, after: 200 }
            })
        );
        paragraphs.push(...formatMultipleChoiceAnswers(questions.multipleChoice, startIndex));
        startIndex += questions.multipleChoice.length;
    }

    // Matching Answers
    if (questions.matching && questions.matching.length > 0) {
        paragraphs.push(
            new docx.Paragraph({
                text: 'Встановлення відповідності:',
                bold: true,
                spacing: { before: 300, after: 200 }
            })
        );
        paragraphs.push(...formatMatchingAnswers(questions.matching, startIndex));
        startIndex += questions.matching.length;
    }

    // Sorting Answers
    if (questions.sorting && questions.sorting.length > 0) {
        paragraphs.push(
            new docx.Paragraph({
                text: 'Сортування:',
                bold: true,
                spacing: { before: 300, after: 200 }
            })
        );
        paragraphs.push(...formatSortingAnswers(questions.sorting, startIndex));
    }

    // Footer with author
    paragraphs.push(
        new docx.Paragraph({
            text: '',
            spacing: { before: 600 }
        })
    );
    paragraphs.push(
        new docx.Paragraph({
            text: `Створено: ${CONFIG.app.author} | ${CONFIG.app.name}`,
            alignment: docx.AlignmentType.CENTER,
            italics: true,
            spacing: { before: 400 }
        })
    );

    return paragraphs;
}
