let allQuestions = null;
let selectedQuestions = [];
let unansweredQuestions = [];
let totalQuestions = 0;

document.addEventListener('DOMContentLoaded', (event) => {
    allQuestions = [
        { text: "I feel more energized by spending time by myself or by being around other people.", left: "By myself", right: "Around other people", key: "q2", dimension: 'introversion_extroversion' },
        { text: "I tend to reflect deeply on my thoughts or seek external stimulation.", left: "Reflect deeply", right: "Seek stimulation", key: "q3", dimension: 'introversion_extroversion' },
        { text: "I usually prefer a few close friends or a wide circle of acquaintances.", left: "Few close friends", right: "Wide circle", key: "q6", dimension: 'introversion_extroversion' },
        { text: "I recharge by spending time alone or by interacting with others.", left: "Spending time alone", right: "Interacting with others", key: "q10", dimension: 'introversion_extroversion' },

        { text: "I tend to focus on tasks and goals or on relationships and people.", left: "Tasks and goals", right: "Relationships and people", key: "q21", dimension: 'thinking_feeling' },
        { text: "I prefer to understand systems and structures or understand the motivations and feelings of others.", left: "Systems and structures", right: "Motivations and feelings", key: "q26", dimension: 'thinking_feeling' },
        { text: "I value internal consistency and logical coherence or authenticity and staying true to oneself.", left: "Internal consistency", right: "Authenticity", key: "q27", dimension: 'thinking_feeling' },
        { text: "I am more guided my by emotions or purely by logic and reason?", left: "Emptions", right: "Logic and reason", key: "q62", dimension: 'thinking_feeling' },

        { text: "I often imagine potential future scenarios or recall detailed past events.", left: "Future scenarios", right: "Past events", key: "q36", dimension: 'sensing_intuition' },
        { text: "I am excited by exploring new ideas and possibilities or by engaging in new physical experiences.", left: "Ideas and possibilities", right: "Physical experiences", key: "q39", dimension: 'sensing_intuition' },
        { text: "I enjoy theorizing about what could be or participating in real-world activities.", left: "Theorizing", right: "Real-world activities", key: "q41", dimension: 'sensing_intuition' },
        { text: "I like to engage in discussions about abstract concepts or in hands-on experiences.", left: "Abstract concepts", right: "Hands-on experiences", key: "q43", dimension: 'sensing_intuition' },

        { text: "I prefer to plan and organize my activities or to go with the flow.", left: "Plan and organize", right: "Go with the flow", key: "q46", dimension: 'perceiving_judging' },
        { text: "I like to make decisions early or to keep my options open.", left: "Make decisions early", right: "Keep options open", key: "q48", dimension: 'perceiving_judging' },
        { text: "I like to have a sense of control over my life or to adapt to new situations as they arise.", left: "Sense of control", right: "Adapt to new situations", key: "q52", dimension: 'perceiving_judging' },
        { text: "I like to have a plan for everything or to be spontaneous and adaptable.", left: "Plan for everything", right: "Spontaneous and adaptable", key: "q59", dimension: 'perceiving_judging' },
    ];

    // Shuffle all questions
    shuffle(allQuestions);
    selectedQuestions = allQuestions; // All 24 questions are selected
    totalQuestions = selectedQuestions.length;

    renderQuestions();
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderQuestions() {
    const container = document.getElementById('mbti-container');
    container.innerHTML = '<form id="mbti-form"></form>\n<div id="results" class="results"></div>';
    const form = document.getElementById('mbti-form');
    
    selectedQuestions.forEach((q, index) => {
        const questionNumber = index + 1;
        unansweredQuestions.push(questionNumber); // Add all questions to the list initially
        const questionHTML = `
            <div class="question">
                <label for="${q.key}">${index + 1}. ${q.text}</label>
                <input type="range" id="${q.key}" name="${q.key}" min="0" max="100" value="50" oninput="markAnswered('${q.key}', ${questionNumber})" onchange="markAnswered('${q.key}', ${questionNumber})">
                <div class="range-labels">
                    <span>${q.left}</span>
                    <span>${q.right}</span>
                </div>
                <span id="tick-${q.key}" class="tick-mark"></span>
            </div>
        `;
        form.innerHTML += questionHTML;
    });

    form.innerHTML += '<button id="submit-button" type="button" onclick="calculateResults()">Submit</button>';
}

function markAnswered(key, questionNumber) {
    const tick = document.getElementById(`tick-${key}`);
    tick.innerHTML = '✔️';
    tick.classList.add('answered');

    // Remove the answered question from the list
    const index = unansweredQuestions.indexOf(questionNumber);
    if (index !== -1) {
        unansweredQuestions.splice(index, 1);
    }
}

function calculateResults() {
    const resultsElement = document.getElementById('results');
    if (!resultsElement) {
        console.error("The results element does not exist.");
        return;
    }
    if (unansweredQuestions.length > 0) {
        // Display the list of unanswered questions in the HTML
        let resultHTML = '<h2>Your Results</h2>';
        resultHTML += `<p>Please answer the following questions before submitting:</p>`;
        resultHTML += `<p>Unanswered Questions: ${unansweredQuestions.join(', ')}</p>`;
        resultsElement.innerHTML = resultHTML;
        return; // Exit the function if there are unanswered questions
    }

    const form = document.getElementById('mbti-form');
    const formData = new FormData(form);

    let scores = {
        introversion_extroversion: 0,
        introversion_extroversion_total: 0,
        introversion_extroversion_n: 0,
        sensing_intuition: 0,
        sensing_intuition_total: 0,
        sensing_intuition_n: 0,
        thinking_feeling: 0,
        thinking_feeling_n: 0,
        thinking_feeling_total: 0,
        perceiving_judging: 0,
        perceiving_judging_n: 0,
        perceiving_judging_total: 0
    };

    // Calculate scores based on the selected questions
    formData.forEach((value, key) => {
        const question = selectedQuestions.find(q => q.key === key);
        if (question) {
            scores[`${question.dimension}_total`] += parseFloat(value);
            scores[`${question.dimension}_n`]++;
        }
    });

    // Calculate averages for each dimension
    for (const dimension of ['introversion_extroversion', 'sensing_intuition', 'thinking_feeling', 'perceiving_judging']) {
        if (scores[`${dimension}_n`] > 0) {
            scores[dimension] = scores[`${dimension}_total`] / scores[`${dimension}_n`];
        } else {
            scores[dimension] = 50; // Default to 50 if no questions were answered for a dimension
        }
    }

    const dimensions = [
        { name: 'Introversion', score: scores.introversion_extroversion, opposite: 'Extraversion' },
        { name: 'Intuition', score: scores.sensing_intuition, opposite: 'Sensing' },
        { name: 'Thinking', score: scores.thinking_feeling, opposite: 'Feeling' },
        { name: 'Judging', score: scores.perceiving_judging, opposite: 'Perceiving' }
    ];

    let mbtiType = '';
    let isExactly50 = false;

    let mbtiVectorObj = [];
    // Determine MBTI type and check for balanced dimensions
    dimensions.forEach(dimension => {
        mbtiVectorObj.push(dimension.score);
        if (dimension.score === 50) {
            isExactly50 = true;
        }
        if (dimension.opposite === 'Sensing') {
            mbtiType += (dimension.score > 50 ? 'S' : 'N');
        } else {
            mbtiType += (dimension.score > 50 ? dimension.opposite.charAt(0) : dimension.name.charAt(0));
        }
    });

    // Generate the results HTML
    let resultHTML = '<h2>Your Results</h2>';

    dimensions.forEach(dimension => {
        const percentage = dimension.score;
        resultHTML += `
            <div class="result-bar">
                <div class="result-labels">
                    <span>${dimension.name}</span>
                    <span>${dimension.opposite}</span>
                </div>
                <div class="slider-container">
                    <div class="slider" style="left: ${percentage}%;"></div>
                </div>
            </div>
        `;
    });

    resultHTML += `<h3>Your MBTI Type: ${mbtiType}</h3>`;

    if (isExactly50) {
        resultHTML += `<p>Your results indicate a 50/50 balance in one or more dimensions. This suggests that your type may be somewhere between two types, and further introspection might be necessary to determine your dominant preferences.</p>`;
    }
    // Display the results
    resultsElement.innerHTML = resultHTML;

    const urlParams = new URLSearchParams(window.location.search);
    fetch('/save-mbti', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: urlParams.get('email'), // Get the email from the URL.
            mbti_type: mbtiType,
            mbti_vector: mbtiVectorObj
        }),
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // MBTI vector saved successfully
            console.log('MBTI vector saved successfully.');
            console.log('MBTI vector: ' + mbtiVectorObj);
            // Proceed to display results or next steps
        } else {
            // Handle error
            console.error('Error saving MBTI vector:', result.error);
            alert('Error saving your results. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An unexpected error occurred. Please try again.');
    });
}
