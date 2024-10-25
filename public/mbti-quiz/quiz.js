let allQuestions = null;
let selectedQuestions = [];
let unansweredQuestions = [];
let totalQuestions = 0;

document.addEventListener('DOMContentLoaded', (event) => {
    allQuestions = [
        { text: "I feel more energized by spending time by myself or by being around other people.", left: "By myself", right: "Around other people", key: "q2", dimension: 'introversion_extroversion' },
        { text: "When attending events, I feel energized by being around many people or prefer smaller, intimate gatherings.", left: "Smaller gatherings", right: "Many people", key: "q83", dimension: 'introversion_extroversion' },
        { text: "I usually prefer a few close friends or a wide circle of acquaintances.", left: "Few close friends", right: "Wide circle", key: "q6", dimension: 'introversion_extroversion' },
        { text: "I recharge by spending time alone or by interacting with others.", left: "Spending time alone", right: "Interacting with others", key: "q10", dimension: 'introversion_extroversion' },

        { text: "I tend to focus on tasks and goals or on relationships and people.", left: "Tasks and goals", right: "Relationships and people", key: "q21", dimension: 'thinking_feeling' },
        { text: "I prefer to understand systems and structures or understand the motivations and feelings of others.", left: "Systems and structures", right: "Motivations and feelings", key: "q26", dimension: 'thinking_feeling' },
        { text: "I value internal consistency and logical coherence or authenticity and staying true to oneself.", left: "Internal consistency", right: "Authenticity", key: "q27", dimension: 'thinking_feeling' },
        { text: "I am more guided my by emotions or purely by logic and reason?", left: "Logic and reason", right: "Emptions", key: "q62", dimension: 'thinking_feeling' },

        { text: "I prefer learning practical skills or exploring theoretical concepts.", left: "Theoretical concepts", right: "Practical skills", key: "q97", dimension: 'sensing_intuition' },
        { text: "I am excited by exploring new ideas and possibilities or by engaging in new physical experiences.", left: "Ideas and possibilities", right: "Physical experiences", key: "q39", dimension: 'sensing_intuition' },
        { text: "I enjoy theorizing about what could be or participating in real-world activities.", left: "Theorizing", right: "Real-world activities", key: "q41", dimension: 'sensing_intuition' },
        { text: "I like to engage in discussions about abstract concepts or in hands-on experiences.", left: "Abstract concepts", right: "Hands-on experiences", key: "q43", dimension: 'sensing_intuition' },

        { text: "I feel more at ease when I have a detailed plan or when I can go with the flow.", left: "Have a detailed plan", right: "Go with the flow", key: "q94", dimension: 'perceiving_judging' },
        { text: "I like to make decisions early or to keep my options open.", left: "Make decisions early", right: "Keep options open", key: "q48", dimension: 'perceiving_judging' },
        { text: "I prefer to stick to schedules or I like to be spontaneous and flexible with my time.", left: "Stick to schedules", right: "Be flexible with my time", key: "q87", dimension: 'perceiving_judging' },
        { text: "I like to be adaptable and versatile to changing circumstances, or I like to anticipate and solve problems before they arise.", left: "Anticipate and solve", right: "Versatile to changing circumstances", key: "q59", dimension: 'perceiving_judging' },

        { text: "I gain energy from interacting with large groups or from spending time alone.", left: "Spending time alone", right: "Interacting with groups", key: "q73", dimension: 'introversion_extroversion' },
        { text: "I prefer to express my thoughts openly or reflect on them privately before sharing.", left: "Reflect privately", right: "Express openly", key: "q74", dimension: 'introversion_extroversion' },

        { text: "I focus on concrete details and practical experiences or explore abstract concepts and future possibilities.", left: "Abstract concepts", right: "Concrete details", key: "q75", dimension: 'sensing_intuition' },
        { text: "I rely on tried-and-true methods or enjoy experimenting with new ideas.", left: "Experimenting with new ideas", right: "Tried-and-true methods", key: "q76", dimension: 'sensing_intuition' },

        { text: "I make decisions based on logical analysis or personal values and how it affects others.", left: "Logical analysis", right: "Personal values", key: "q77", dimension: 'thinking_feeling' },
        { text: "I prioritize fairness and objective criteria or empathy and maintaining harmony.", left: "Fairness and objectivity", right: "Empathy and harmony", key: "q78", dimension: 'thinking_feeling' },

        { text: "I prefer a flexible schedule or like to have things decided and settled.", left: "Decided and settled", right: "Flexible schedule", key: "q79", dimension: 'perceiving_judging' },
        { text: "I am more comfortable adapting as new situations arise or following a detailed plan.", left: "Following a plan", right: "Adapting to new situations", key: "q80", dimension: 'perceiving_judging' },
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
    .then(response => {
        // Redirect to the similar-users page after the MBTI is saved
        if (response.ok) {
            window.location.href = `/similar-users?email=${urlParams.get('email')}`;
        } else {
            // Handle error
            console.error('Error saving MBTI vector:', response.statusText);
            alert('Error saving your results. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An unexpected error occurred. Please try again.');
    });
    
    
}
