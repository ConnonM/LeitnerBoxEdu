/**
 * Leitner Flashcards Application
 * A simple, accessible flashcard revision tool for students
 * 
 * Features:
 * - 3-box Leitner system (Daily, Every 2 days, Every 4 days)
 * - Create, review, and manage flashcards
 * - Subject grouping for cards
 * - Import/export functionality
 * - Full W3C accessibility compliance
 * - No sensitive student data collection
 * - Local storage only
 */

// Application State
const AppState = {
    // Box configuration (3 boxes as per requirements)
    boxes: [
        { id: 0, name: 'Box 1', interval: 'Daily', intervalDays: 1 },
        { id: 1, name: 'Box 2', interval: 'Every 2 days', intervalDays: 2 },
        { id: 2, name: 'Box 3', interval: 'Every 4 days', intervalDays: 4 }
    ],
    
    // Flashcards storage
    flashcards: [],
    
    // Subjects storage
    subjects: [],
    
    // Current mode
    currentMode: 'create',
    
    // Review state
    currentBox: null,
    currentSubject: 'all',
    currentCardIndex: 0,
    reviewCards: [],
    showingAnswer: false
};

// DOM Elements
const elements = {
    // Navigation
    modeCreateBtn: document.getElementById('mode-create'),
    modeReviewBtn: document.getElementById('mode-review'),
    modeSubjectsBtn: document.getElementById('mode-subjects'),
    modeImportExportBtn: document.getElementById('import-export'),
    
    // Sections
    createSection: document.getElementById('create-section'),
    reviewSection: document.getElementById('review-section'),
    subjectsSection: document.getElementById('subjects-section'),
    importExportSection: document.getElementById('import-export-section'),
    
    // Create Form
    cardForm: document.getElementById('card-form'),
    subjectSelect: document.getElementById('subject-select'),
    questionInput: document.getElementById('question'),
    answerInput: document.getElementById('answer'),
    addCardBtn: document.getElementById('add-card'),
    clearFormBtn: document.getElementById('clear-form'),
    cardList: document.getElementById('card-list'),
    noCardsMessage: document.getElementById('no-cards'),
    cardsContainer: document.getElementById('cards-container'),
    filterSubject: document.getElementById('filter-subject'),
    
    // Review
    boxButtons: document.querySelectorAll('.box-button'),
    cardCounts: document.querySelectorAll('.card-count'),
    reviewArea: document.getElementById('review-area'),
    noCardsReview: document.getElementById('no-cards-review'),
    reviewCard: document.getElementById('review-card'),
    reviewQuestion: document.getElementById('review-question'),
    reviewSubjectDisplay: document.getElementById('review-subject-display'),
    reviewAnswer: document.getElementById('review-answer'),
    cardFront: document.querySelector('.card-front'),
    cardBack: document.querySelector('.card-back'),
    showAnswerBtn: document.getElementById('show-answer'),
    correctBtn: document.getElementById('correct-btn'),
    incorrectBtn: document.getElementById('incorrect-btn'),
    reviewProgress: document.getElementById('review-progress'),
    currentCardSpan: document.getElementById('current-card'),
    totalCardsSpan: document.getElementById('total-cards'),
    reviewSubjectFilter: document.getElementById('review-subject-filter'),
    
    // Subjects Management
    subjectForm: document.getElementById('subject-form'),
    newSubjectName: document.getElementById('new-subject-name'),
    newSubjectColor: document.getElementById('new-subject-color'),
    addSubjectBtn: document.getElementById('add-subject-btn'),
    subjectsContainer: document.getElementById('subjects-container'),
    noSubjectsMessage: document.getElementById('no-subjects'),
    subjectNameError: document.getElementById('subject-name-error'),
    
    // Import/Export
    exportBtn: document.getElementById('export-btn'),
    importFile: document.getElementById('import-file'),
    importBtn: document.getElementById('import-btn'),
    exportMessage: document.getElementById('export-message'),
    importMessage: document.getElementById('import-message'),
    
    // Error messages
    questionError: document.getElementById('question-error'),
    answerError: document.getElementById('answer-error'),
    subjectError: document.getElementById('subject-error')
};

// Initialize the application
function init() {
    loadData();
    setupEventListeners();
    updateUI();
    renderSubjectDropdowns();
    renderCardList();
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('leitnerFlashcards');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            // Load flashcards
            if (Array.isArray(data.flashcards)) {
                AppState.flashcards = data.flashcards.map(card => ({
                    id: card.id || generateId(),
                    question: card.question || '',
                    answer: card.answer || '',
                    box: Math.min(card.box || 0, AppState.boxes.length - 1),
                    subject: card.subject || ''
                }));
            }
            
            // Load subjects
            if (Array.isArray(data.subjects)) {
                AppState.subjects = data.subjects.map(subject => ({
                    id: subject.id || generateId(),
                    name: subject.name || 'Untitled Subject',
                    color: subject.color || '#0056b3'
                }));
            }
            
            // Load boxes configuration
            if (Array.isArray(data.boxes) && data.boxes.length >= 3 && data.boxes.length <= 7) {
                AppState.boxes = data.boxes.map((box, index) => ({
                    id: index,
                    name: box.name || `Box ${index + 1}`,
                    interval: box.interval || getDefaultInterval(index),
                    intervalDays: box.intervalDays || getDefaultIntervalDays(index)
                }));
            }
            
            // If no subjects exist, create a default one
            if (AppState.subjects.length === 0) {
                AppState.subjects.push({
                    id: generateId(),
                    name: 'General',
                    color: '#0056b3'
                });
            }
            
        } catch (e) {
            console.error('Error loading data:', e);
            // Start with defaults
            AppState.flashcards = [];
            AppState.subjects = [
                { id: generateId(), name: 'General', color: '#0056b3' }
            ];
        }
    } else {
        // First time - initialize with defaults
        AppState.flashcards = [];
        AppState.subjects = [
            { id: generateId(), name: 'General', color: '#0056b3' }
        ];
    }
}

// Save data to localStorage
function saveData() {
    const data = {
        flashcards: AppState.flashcards,
        subjects: AppState.subjects,
        boxes: AppState.boxes,
        version: '1.0'
    };
    localStorage.setItem('leitnerFlashcards', JSON.stringify(data));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get default interval for box
function getDefaultInterval(index) {
    const intervals = ['Daily', 'Every 2 days', 'Every 4 days', 'Weekly', 'Every 2 weeks', 'Every 4 weeks', 'Monthly'];
    return intervals[index] || `Every ${Math.pow(2, index)} days`;
}

// Get default interval days for box
function getDefaultIntervalDays(index) {
    const days = [1, 2, 4, 7, 14, 28, 30];
    return days[index] || Math.pow(2, index);
}

// Get subject by ID
function getSubjectById(id) {
    return AppState.subjects.find(s => s.id === id);
}

// Get subject name by ID
function getSubjectName(id) {
    const subject = getSubjectById(id);
    return subject ? subject.name : 'Unknown';
}

// Get subject color by ID
function getSubjectColor(id) {
    const subject = getSubjectById(id);
    return subject ? subject.color : '#0056b3';
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    elements.modeCreateBtn.addEventListener('click', () => switchMode('create'));
    elements.modeReviewBtn.addEventListener('click', () => switchMode('review'));
    elements.modeSubjectsBtn.addEventListener('click', () => switchMode('subjects'));
    elements.modeImportExportBtn.addEventListener('click', () => switchMode('import-export'));
    
    // Create form
    elements.cardForm.addEventListener('submit', handleFormSubmit);
    elements.clearFormBtn.addEventListener('click', clearForm);
    
    // Subject filter for card list
    elements.filterSubject.addEventListener('change', renderCardList);
    
    // Box selection for review
    elements.boxButtons.forEach(button => {
        button.addEventListener('click', () => {
            AppState.currentBox = parseInt(button.dataset.box);
            startReview();
        });
    });
    
    // Subject filter for review
    elements.reviewSubjectFilter.addEventListener('change', (e) => {
        AppState.currentSubject = e.target.value;
        startReview();
    });
    
    // Review actions
    elements.showAnswerBtn.addEventListener('click', showAnswer);
    elements.correctBtn.addEventListener('click', () => handleReviewResponse(true));
    elements.incorrectBtn.addEventListener('click', () => handleReviewResponse(false));
    
    // Subjects management
    elements.subjectForm.addEventListener('submit', handleSubjectFormSubmit);
    
    // Import/Export
    elements.exportBtn.addEventListener('click', exportFlashcards);
    elements.importBtn.addEventListener('click', importFlashcards);
    
    // Keyboard accessibility
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Switch between modes
function switchMode(mode) {
    AppState.currentMode = mode;
    
    // Update button states
    elements.modeCreateBtn.setAttribute('aria-pressed', mode === 'create');
    elements.modeReviewBtn.setAttribute('aria-pressed', mode === 'review');
    elements.modeSubjectsBtn.setAttribute('aria-pressed', mode === 'subjects');
    elements.modeImportExportBtn.setAttribute('aria-pressed', mode === 'import-export');
    
    // Update section visibility
    elements.createSection.classList.toggle('active', mode === 'create');
    elements.reviewSection.classList.toggle('active', mode === 'review');
    elements.subjectsSection.classList.toggle('active', mode === 'subjects');
    elements.importExportSection.classList.toggle('active', mode === 'import-export');
    
    // Reset review state when switching away from review
    if (mode !== 'review') {
        resetReview();
    }
    
    // Refresh subject dropdowns when switching to create mode
    if (mode === 'create') {
        renderSubjectDropdowns();
    }
    
    // Refresh subjects list when switching to subjects mode
    if (mode === 'subjects') {
        renderSubjectsList();
    }
    
    // Clear import/export messages
    if (mode === 'import-export') {
        elements.exportMessage.textContent = '';
        elements.importMessage.textContent = '';
        elements.importFile.value = '';
    }
    
    // Focus on the first interactive element in the new section
    setTimeout(() => {
        const section = mode === 'create' ? elements.createSection :
                       mode === 'review' ? elements.reviewSection :
                       mode === 'subjects' ? elements.subjectsSection :
                       elements.importExportSection;
        const firstFocusable = section.querySelector('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }, 100);
}

// Update UI elements
function updateUI() {
    updateCardCounts();
    updateReviewUI();
}

// Update card counts for each box
function updateCardCounts() {
    AppState.boxes.forEach((box, index) => {
        const count = AppState.flashcards.filter(card => card.box === index).length;
        elements.cardCounts[index].textContent = `${count} card${count !== 1 ? 's' : ''}`;
        elements.cardCounts[index].setAttribute('data-count', count);
    });
}

// Render subject dropdowns
function renderSubjectDropdowns() {
    const subjects = [...AppState.subjects];
    
    // Sort subjects alphabetically
    subjects.sort((a, b) => a.name.localeCompare(b.name));
    
    // Create form subject dropdown
    const subjectOptions = ['<option value="" disabled selected>Select a subject</option>'];
    subjects.forEach(subject => {
        subjectOptions.push(`<option value="${subject.id}">${escapeHtml(subject.name)}</option>`);
    });
    elements.subjectSelect.innerHTML = subjectOptions.join('');
    
    // Filter dropdown
    const filterOptions = ['<option value="all">All Subjects</option>'];
    subjects.forEach(subject => {
        filterOptions.push(`<option value="${subject.id}">${escapeHtml(subject.name)}</option>`);
    });
    elements.filterSubject.innerHTML = filterOptions.join('');
    
    // Review subject filter
    const reviewFilterOptions = ['<option value="all">All Subjects</option>'];
    subjects.forEach(subject => {
        reviewFilterOptions.push(`<option value="${subject.id}">${escapeHtml(subject.name)}</option>`);
    });
    elements.reviewSubjectFilter.innerHTML = reviewFilterOptions.join('');
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Clear previous errors
    elements.questionError.textContent = '';
    elements.answerError.textContent = '';
    elements.subjectError.textContent = '';
    
    // Validate inputs
    const subjectId = elements.subjectSelect.value;
    const question = elements.questionInput.value.trim();
    const answer = elements.answerInput.value.trim();
    
    let isValid = true;
    
    if (!subjectId) {
        elements.subjectError.textContent = 'Please select a subject.';
        elements.subjectSelect.focus();
        isValid = false;
    }
    
    if (!question) {
        elements.questionError.textContent = 'Please enter a question.';
        if (isValid) {
            elements.questionInput.focus();
        }
        isValid = false;
    }
    
    if (!answer) {
        elements.answerError.textContent = 'Please enter an answer.';
        if (isValid) {
            elements.answerInput.focus();
        }
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Create new flashcard (always starts in Box 1 / index 0)
    const newCard = {
        id: generateId(),
        question: question,
        answer: answer,
        box: 0,
        subject: subjectId
    };
    
    AppState.flashcards.push(newCard);
    saveData();
    
    // Update UI
    renderCardList();
    updateUI();
    clearForm();
    
    // Show success message
    showTemporaryMessage('Flashcard added successfully!', 'success');
}

// Clear the form
function clearForm() {
    elements.cardForm.reset();
    elements.questionError.textContent = '';
    elements.answerError.textContent = '';
    elements.subjectError.textContent = '';
    elements.questionInput.focus();
}

// Render the list of flashcards
function renderCardList() {
    const filteredSubject = elements.filterSubject.value;
    
    let filteredCards = AppState.flashcards;
    
    if (filteredSubject !== 'all') {
        filteredCards = AppState.flashcards.filter(card => card.subject === filteredSubject);
    }
    
    if (filteredCards.length === 0) {
        elements.noCardsMessage.style.display = 'block';
        elements.cardsContainer.innerHTML = '';
        return;
    }
    
    elements.noCardsMessage.style.display = 'none';
    
    elements.cardsContainer.innerHTML = filteredCards.map(card => {
        const subject = getSubjectById(card.subject);
        const subjectName = subject ? subject.name : 'Unknown';
        const subjectColor = subject ? subject.color : '#0056b3';
        
        return `
        <li class="card-item" tabindex="0">
            <div class="card-header">
                <div>
                    <span class="card-box box-${card.box}">${AppState.boxes[card.box].name}</span>
                    <span class="subject-tag" style="background-color: ${subjectColor}">${escapeHtml(subjectName)}</span>
                </div>
                <button class="delete-btn" data-id="${card.id}" aria-label="Delete this flashcard">Delete</button>
            </div>
            <p class="card-question">${escapeHtml(card.question)}</p>
            <p class="card-answer">${escapeHtml(card.answer)}</p>
        </li>
    `}).join('');
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFlashcard(btn.dataset.id);
        });
    });
}

// Delete a flashcard
function deleteFlashcard(id) {
    if (confirm('Are you sure you want to delete this flashcard?')) {
        AppState.flashcards = AppState.flashcards.filter(card => card.id !== id);
        saveData();
        renderCardList();
        updateUI();
        
        // If we're in review mode and this card was in the current review set, reset review
        if (AppState.currentMode === 'review' && AppState.reviewCards.some(c => c.id === id)) {
            startReview();
        }
        
        showTemporaryMessage('Flashcard deleted.', 'info');
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start review for current box and subject
function startReview() {
    if (AppState.currentBox === null) {
        elements.noCardsReview.style.display = 'block';
        elements.reviewCard.classList.add('hidden');
        elements.reviewProgress.classList.add('hidden');
        return;
    }
    
    AppState.currentCardIndex = 0;
    AppState.showingAnswer = false;
    
    // Filter cards for this box and subject
    let filteredCards = AppState.flashcards.filter(card => card.box === AppState.currentBox);
    
    if (AppState.currentSubject !== 'all') {
        filteredCards = filteredCards.filter(card => card.subject === AppState.currentSubject);
    }
    
    AppState.reviewCards = [...filteredCards];
    
    // Shuffle the cards for random review
    shuffleArray(AppState.reviewCards);
    
    updateReviewUI();
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Update review UI
function updateReviewUI() {
    if (AppState.reviewCards.length === 0) {
        elements.noCardsReview.style.display = 'block';
        elements.reviewCard.classList.add('hidden');
        elements.reviewProgress.classList.add('hidden');
        return;
    }
    
    elements.noCardsReview.style.display = 'none';
    
    if (AppState.currentBox === null) {
        elements.reviewCard.classList.add('hidden');
        elements.reviewProgress.classList.add('hidden');
        return;
    }
    
    // Show the current card
    const currentCard = AppState.reviewCards[AppState.currentCardIndex];
    
    // Only populate the question initially - answer will be added when shown
    elements.reviewQuestion.textContent = currentCard.question;
    elements.reviewAnswer.textContent = '';
    
    // Show subject
    const subject = getSubjectById(currentCard.subject);
    const subjectName = subject ? subject.name : 'Unknown';
    const subjectColor = subject ? subject.color : '#0056b3';
    elements.reviewSubjectDisplay.textContent = subjectName;
    elements.reviewSubjectDisplay.style.backgroundColor = subjectColor;
    
    // Reset to question side
    AppState.showingAnswer = false;
    elements.cardFront.classList.remove('hidden');
    elements.cardBack.classList.add('hidden');
    
    // Update progress
    elements.currentCardSpan.textContent = AppState.currentCardIndex + 1;
    elements.totalCardsSpan.textContent = AppState.reviewCards.length;
    elements.reviewProgress.classList.remove('hidden');
    elements.reviewCard.classList.remove('hidden');
    
    // Focus on the show answer button
    elements.showAnswerBtn.focus();
}

// Show the answer
function showAnswer() {
    const currentCard = AppState.reviewCards[AppState.currentCardIndex];
    
    // Only populate the answer now
    elements.reviewAnswer.textContent = currentCard.answer;
    
    AppState.showingAnswer = true;
    elements.cardFront.classList.add('hidden');
    elements.cardBack.classList.remove('hidden');
    
    // Focus on the correct button
    elements.correctBtn.focus();
}

// Handle review response (correct or incorrect)
function handleReviewResponse(isCorrect) {
    const currentCard = AppState.reviewCards[AppState.currentCardIndex];
    
    if (isCorrect) {
        // Move to next box (if not already in the last box)
        if (currentCard.box < AppState.boxes.length - 1) {
            currentCard.box++;
        }
    } else {
        // Move to previous box (if not already in the first box)
        if (currentCard.box > 0) {
            currentCard.box--;
        }
    }
    
    // Update the card in the array
    const cardIndex = AppState.flashcards.findIndex(c => c.id === currentCard.id);
    if (cardIndex !== -1) {
        AppState.flashcards[cardIndex] = { ...currentCard };
    }
    
    saveData();
    updateUI();
    
    // Move to next card
    AppState.currentCardIndex++;
    
    if (AppState.currentCardIndex >= AppState.reviewCards.length) {
        // Review complete
        resetReview();
        showTemporaryMessage(`Review complete! All ${AppState.reviewCards.length} cards reviewed.`, 'success');
    } else {
        updateReviewUI();
    }
}

// Reset review state
function resetReview() {
    AppState.currentCardIndex = 0;
    AppState.reviewCards = [];
    AppState.showingAnswer = false;
    
    elements.reviewCard.classList.add('hidden');
    elements.reviewProgress.classList.add('hidden');
    elements.noCardsReview.style.display = 'block';
    
    // Clear the answer content
    elements.reviewAnswer.textContent = '';
    elements.reviewSubjectDisplay.textContent = '';
    elements.reviewSubjectDisplay.style.backgroundColor = '';
}

// Handle subject form submission
function handleSubjectFormSubmit(e) {
    e.preventDefault();
    
    // Clear previous error
    elements.subjectNameError.textContent = '';
    
    // Validate input
    const name = elements.newSubjectName.value.trim();
    const color = elements.newSubjectColor.value;
    
    if (!name) {
        elements.subjectNameError.textContent = 'Please enter a subject name.';
        elements.newSubjectName.focus();
        return;
    }
    
    // Check if subject already exists
    const existing = AppState.subjects.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        elements.subjectNameError.textContent = 'A subject with this name already exists.';
        elements.newSubjectName.focus();
        return;
    }
    
    // Create new subject
    const newSubject = {
        id: generateId(),
        name: name,
        color: color
    };
    
    AppState.subjects.push(newSubject);
    saveData();
    
    // Update UI
    renderSubjectDropdowns();
    renderSubjectsList();
    clearSubjectForm();
    
    // Show success message
    showTemporaryMessage('Subject added successfully!', 'success');
}

// Clear subject form
function clearSubjectForm() {
    elements.subjectForm.reset();
    elements.subjectNameError.textContent = '';
    elements.newSubjectName.focus();
}

// Render subjects list
function renderSubjectsList() {
    if (AppState.subjects.length === 0) {
        elements.noSubjectsMessage.style.display = 'block';
        elements.subjectsContainer.innerHTML = '';
        return;
    }
    
    elements.noSubjectsMessage.style.display = 'none';
    
    elements.subjectsContainer.innerHTML = AppState.subjects.map(subject => {
        const cardCount = AppState.flashcards.filter(card => card.subject === subject.id).length;
        
        return `
        <li class="subject-item">
            <div class="subject-color-preview" style="background-color: ${subject.color}"></div>
            <div class="subject-info">
                <span class="subject-name">${escapeHtml(subject.name)}</span>
                <span class="subject-card-count">${cardCount} card${cardCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="subject-actions">
                <button class="subject-edit-btn" data-id="${subject.id}" aria-label="Edit subject ${escapeHtml(subject.name)}">Edit</button>
                <button class="subject-delete-btn" data-id="${subject.id}" aria-label="Delete subject ${escapeHtml(subject.name)}">Delete</button>
            </div>
        </li>
    `}).join('');
    
    // Add event listeners
    document.querySelectorAll('.subject-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSubject(btn.dataset.id);
        });
    });
    
    document.querySelectorAll('.subject-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editSubject(btn.dataset.id);
        });
    });
}

// Delete a subject
function deleteSubject(id) {
    const subject = getSubjectById(id);
    if (!subject) return;
    
    // Check if subject has cards
    const cardCount = AppState.flashcards.filter(card => card.subject === id).length;
    
    let message = `Are you sure you want to delete "${subject.name}"?`;
    if (cardCount > 0) {
        message += `\n\nThis subject has ${cardCount} flashcard${cardCount !== 1 ? 's' : ''}. `;
        message += `The cards will be moved to "${AppState.subjects.length > 1 ? AppState.subjects.find(s => s.id !== id).name : 'General'}".`;
    }
    
    if (confirm(message)) {
        // Move cards to another subject (if any) or remove subject reference
        if (cardCount > 0) {
            const otherSubject = AppState.subjects.find(s => s.id !== id);
            if (otherSubject) {
                AppState.flashcards.forEach(card => {
                    if (card.subject === id) {
                        card.subject = otherSubject.id;
                    }
                });
            } else {
                // If this is the only subject, remove subject from cards
                AppState.flashcards.forEach(card => {
                    if (card.subject === id) {
                        card.subject = '';
                    }
                });
            }
        }
        
        // Remove the subject
        AppState.subjects = AppState.subjects.filter(s => s.id !== id);
        
        // If no subjects left, create a default one
        if (AppState.subjects.length === 0) {
            AppState.subjects.push({
                id: generateId(),
                name: 'General',
                color: '#0056b3'
            });
        }
        
        saveData();
        renderSubjectDropdowns();
        renderSubjectsList();
        renderCardList();
        updateUI();
        
        showTemporaryMessage('Subject deleted.', 'info');
    }
}

// Edit a subject
function editSubject(id) {
    const subject = getSubjectById(id);
    if (!subject) return;
    
    const newName = prompt('Edit subject name:', subject.name);
    if (newName === null) return; // User cancelled
    
    const trimmedName = newName.trim();
    if (!trimmedName) {
        showTemporaryMessage('Subject name cannot be empty.', 'error');
        return;
    }
    
    // Check if name already exists
    const existing = AppState.subjects.some(s => s.id !== id && s.name.toLowerCase() === trimmedName.toLowerCase());
    if (existing) {
        showTemporaryMessage('A subject with this name already exists.', 'error');
        return;
    }
    
    // Update subject
    subject.name = trimmedName;
    saveData();
    
    renderSubjectDropdowns();
    renderSubjectsList();
    renderCardList();
    
    showTemporaryMessage('Subject updated.', 'success');
}

// Export flashcards
function exportFlashcards() {
    const data = {
        flashcards: AppState.flashcards,
        subjects: AppState.subjects,
        boxes: AppState.boxes,
        version: '1.0',
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `leitner-flashcards-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    elements.exportMessage.textContent = 'Flashcards exported successfully!';
    elements.exportMessage.className = 'info-message success';
    
    // Clear message after 3 seconds
    setTimeout(() => {
        elements.exportMessage.textContent = '';
        elements.exportMessage.className = 'info-message';
    }, 3000);
}

// Import flashcards
function importFlashcards() {
    const file = elements.importFile.files[0];
    
    if (!file) {
        elements.importMessage.textContent = 'Please select a file to import.';
        elements.importMessage.className = 'info-message error';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate the imported data
            if (!Array.isArray(data.flashcards)) {
                throw new Error('Invalid file format: flashcards array not found');
            }
            
            // Import subjects if they exist
            if (Array.isArray(data.subjects)) {
                const existingSubjectNames = new Set(AppState.subjects.map(s => s.name.toLowerCase()));
                const newSubjects = [];
                
                data.subjects.forEach(subject => {
                    if (subject.name && !existingSubjectNames.has(subject.name.toLowerCase())) {
                        newSubjects.push({
                            id: subject.id || generateId(),
                            name: subject.name,
                            color: subject.color || '#0056b3'
                        });
                        existingSubjectNames.add(subject.name.toLowerCase());
                    }
                });
                
                AppState.subjects = [...AppState.subjects, ...newSubjects];
            }
            
            // Import flashcards
            const importedCards = data.flashcards.map(card => ({
                id: card.id || generateId(),
                question: card.question || '',
                answer: card.answer || '',
                box: Math.min(Math.max(card.box || 0, 0), AppState.boxes.length - 1),
                subject: card.subject || ''
            }));
            
            // Check if we should also import boxes configuration
            if (Array.isArray(data.boxes) && data.boxes.length >= 3 && data.boxes.length <= 7) {
                AppState.boxes = data.boxes.map((box, index) => ({
                    id: index,
                    name: box.name || `Box ${index + 1}`,
                    interval: box.interval || getDefaultInterval(index),
                    intervalDays: box.intervalDays || getDefaultIntervalDays(index)
                }));
            }
            
            // Merge with existing cards (avoid duplicates by ID)
            const existingIds = new Set(AppState.flashcards.map(c => c.id));
            const newCards = importedCards.filter(card => !existingIds.has(card.id));
            
            AppState.flashcards = [...AppState.flashcards, ...newCards];
            saveData();
            
            elements.importMessage.textContent = `Successfully imported ${newCards.length} flashcard${newCards.length !== 1 ? 's' : ''}.`;
            elements.importMessage.className = 'info-message success';
            
            // Update UI
            renderSubjectDropdowns();
            renderCardList();
            updateUI();
            
            // Clear file input
            elements.importFile.value = '';
            
        } catch (error) {
            console.error('Import error:', error);
            elements.importMessage.textContent = `Error importing file: ${error.message}`;
            elements.importMessage.className = 'info-message error';
        }
    };
    
    reader.onerror = () => {
        elements.importMessage.textContent = 'Error reading file.';
        elements.importMessage.className = 'info-message error';
    };
    
    reader.readAsText(file);
}

// Show temporary message
function showTemporaryMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = `temporary-message ${type}`;
    messageElement.setAttribute('role', 'alert');
    messageElement.setAttribute('aria-live', 'assertive');
    
    // Style the message
    Object.assign(messageElement.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '500',
        zIndex: '1000',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        backgroundColor: type === 'success' ? '#28a745' : 
                        type === 'error' ? '#dc3545' : 
                        '#0056b3',
        color: 'white',
        animation: 'slideIn 0.3s ease'
    });
    
    document.body.appendChild(messageElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            messageElement.remove();
        }, 300);
    }, 3000);
}

// Handle keyboard shortcuts for accessibility
function handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Escape key - go back to mode selection or reset review
    if (e.key === 'Escape') {
        if (AppState.currentMode === 'review' && AppState.currentBox !== null) {
            resetReview();
            AppState.currentBox = null;
            updateReviewUI();
        }
    }
    
    // Arrow keys for review navigation
    if (AppState.currentMode === 'review' && AppState.currentBox !== null) {
        if (e.key === 'ArrowRight' && !AppState.showingAnswer) {
            showAnswer();
        } else if (e.key === 'ArrowLeft' && AppState.showingAnswer) {
            // Go back to question
            AppState.showingAnswer = false;
            elements.cardFront.classList.remove('hidden');
            elements.cardBack.classList.add('hidden');
            elements.reviewAnswer.textContent = '';
        } else if (e.key === 'ArrowUp' && AppState.showingAnswer) {
            handleReviewResponse(true);
        } else if (e.key === 'ArrowDown' && AppState.showingAnswer) {
            handleReviewResponse(false);
        }
    }
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
