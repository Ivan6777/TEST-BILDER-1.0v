// Main Generator Logic
// Author: Artnestico

import { CONFIG } from './config.js';
import { generateQuestions } from './api.js';
import { createDocxFile } from './docx_exporter.js';

// DOM Elements
let form, generateBtn, loadingContainer, loadingText, errorMessage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    form = document.getElementById('testForm');
    generateBtn = document.getElementById('generateBtn');
    loadingContainer = document.getElementById('loadingContainer');
    loadingText = document.getElementById('loadingText');
    errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', handleFormSubmit);
});

/**
 * Handles form submission
 * @param {Event} e - Form submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(form);
    const context = {
        topic: formData.get('topic'),
        grade: formData.get('grade'),
        lesson: formData.get('lesson'),
        sourceText: formData.get('sourceText')
    };

    const counts = {
        singleChoice: parseInt(formData.get('singleChoice')) || 0,
        multipleChoice: parseInt(formData.get('multipleChoice')) || 0,
        matching: parseInt(formData.get('matching')) || 0,
        sorting: parseInt(formData.get('sorting')) || 0
    };

    // Validate
    const totalQuestions = Object.values(counts).reduce((a, b) => a + b, 0);
    if (totalQuestions === 0) {
        showError('Будь ласка, оберіть хоча б один тип питання');
        return;
    }

    if (!context.sourceText.trim()) {
        showError('Будь ласка, введіть текст для генерації');
        return;
    }

    // Start generation
    try {
        showLoading(true);
        hideError();

        // Generate both variants
        updateLoadingText('Генерація варіанту 1...');
        const variant1 = await generateAllQuestions(context, counts);

        updateLoadingText('Генерація варіанту 2...');
        const variant2 = await generateAllQuestions(context, counts);

        // Create DOCX
        updateLoadingText('Створення документу...');
        await createDocxFile({ variant1, variant2 }, context);

        updateLoadingText('Готово! Завантаження файлу...');

        // Reset form after short delay
        setTimeout(() => {
            showLoading(false);
            showSuccess();
        }, 1000);

    } catch (error) {
        console.error('Generation error:', error);
        showLoading(false);
        showError(error.message || 'Виникла помилка при генерації тесту');
    }
}

/**
 * Generates all question types for one variant
 * @param {Object} context - Test context (topic, grade, lesson, sourceText)
 * @param {Object} counts - Question counts by type
 * @returns {Promise<Object>} - Generated questions
 */
async function generateAllQuestions(context, counts) {
    const questions = {
        singleChoice: [],
        multipleChoice: [],
        matching: [],
        sorting: []
    };

    // Generate each type
    if (counts.singleChoice > 0) {
        updateLoadingText(`Генерація питань з однією відповіддю...`);
        questions.singleChoice = await generateQuestions({
            ...context,
            questionType: 'singleChoice',
            count: counts.singleChoice
        });
    }

    if (counts.multipleChoice > 0) {
        updateLoadingText(`Генерація питань з двома відповідями...`);
        questions.multipleChoice = await generateQuestions({
            ...context,
            questionType: 'multipleChoice',
            count: counts.multipleChoice
        });
    }

    if (counts.matching > 0) {
        updateLoadingText(`Генерація питань на відповідність...`);
        questions.matching = await generateQuestions({
            ...context,
            questionType: 'matching',
            count: counts.matching
        });
    }

    if (counts.sorting > 0) {
        updateLoadingText(`Генерація питань на сортування...`);
        questions.sorting = await generateQuestions({
            ...context,
            questionType: 'sorting',
            count: counts.sorting
        });
    }

    return questions;
}

/**
 * Shows/hides loading state
 * @param {boolean} show - Whether to show loading
 */
function showLoading(show) {
    if (show) {
        generateBtn.disabled = true;
        loadingContainer.style.display = 'flex';
        form.querySelectorAll('input').forEach(input => input.disabled = true);
    } else {
        generateBtn.disabled = false;
        loadingContainer.style.display = 'none';
        form.querySelectorAll('input').forEach(input => input.disabled = false);
    }
}

/**
 * Updates loading text
 * @param {string} text - Loading message
 */
function updateLoadingText(text) {
    if (loadingText) {
        loadingText.textContent = text;
    }
}

/**
 * Shows error message
 * @param {string} message - Error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

/**
 * Hides error message
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * Shows success message briefly
 */
function showSuccess() {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    successMsg.textContent = '✓ Тест успішно згенеровано!';

    document.body.appendChild(successMsg);

    setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => successMsg.remove(), 300);
    }, 3000);
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
