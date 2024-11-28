let allQuestions = null;
let selectedQuestions = [];
let unansweredQuestions = [];
let totalQuestions = 0;

document.addEventListener('DOMContentLoaded', (event) => {
    const allQuestions = [
        {text: "I feel most alive when I’m fully immersed in hands-on, real-time activities.", dimension: "Se", left: "Strongly dissagree", right: "Strongly agree", key: "q1"},
        {text: "I easily notice details in my environment that others might overlook.", dimension: "Se", left: "Strongly dissagree", right: "Strongly agree", key: "q2"},
        {text: "I enjoy fast-paced environments where I can adapt to changes on the spot.", dimension: "Se", left: "Strongly dissagree", right: "Strongly agree", key: "q3"},
        {text: "I find comfort in familiar routines and established traditions.", dimension: "Si", left: "Strongly dissagree", right: "Strongly agree", key: "q4"},
        {text: "I prefer to rely on my past experiences to guide my decisions.", dimension: "Si", left: "Strongly dissagree", right: "Strongly agree", key: "q5"},
        {text: "I enjoy reflecting on how current events relate to past memories or lessons.", dimension: "Si", left: "Strongly dissagree", right: "Strongly agree", key: "q6"},
        {text: "I often connect seemingly unrelated ideas in creative ways.", dimension: "Ne", left: "Strongly dissagree", right: "Strongly agree", key: "q7"},
        {text: "I enjoy brainstorming multiple possibilities before deciding on one.", dimension: "Ne", left: "Strongly dissagree", right: "Strongly agree", key: "q8"},
        {text: "I feel energized by exploring potential outcomes and what-ifs.", dimension: "Ne", left: "Strongly dissagree", right: "Strongly agree", key: "q9"},
        {text: "I often get sudden, deep insights about situations that feel meaningful.", dimension: "Ni", left: "Strongly dissagree", right: "Strongly agree", key: "q10"},
        {text: "I prefer to focus on one clear vision or goal and work toward it.", dimension: "Ni", left: "Strongly dissagree", right: "Strongly agree", key: "q11"},
        {text: "I enjoy uncovering the underlying patterns or truths in complex problems.", dimension: "Ni", left: "Strongly dissagree", right: "Strongly agree", key: "q12"},
        {text: "I enjoy creating systems to make tasks and processes more efficient.", dimension: "Te", left: "Strongly dissagree", right: "Strongly agree", key: "q13"},
        {text: "I feel accomplished when I can implement practical solutions to problems.", dimension: "Te", left: "Strongly dissagree", right: "Strongly agree", key: "q14"},
        {text: "I like to organize people and resources to achieve clear, measurable goals.", dimension: "Te", left: "Strongly dissagree", right: "Strongly agree", key: "q15"},
        {text: "I enjoy analyzing problems to uncover their underlying principles.", dimension: "Ti", left: "Strongly dissagree", right: "Strongly agree", key: "q16"},
        {text: "I strive for consistency in my reasoning and logical coherence in my ideas.", dimension: "Ti", left: "Strongly dissagree", right: "Strongly agree", key: "q17"},
        {text: "I feel most satisfied when I solve a complex problem through careful analysis.", dimension: "Ti", left: "Strongly dissagree", right: "Strongly agree", key: "q18"},
        {text: "I feel fulfilled when I can help others feel understood and supported.", dimension: "Fe", left: "Strongly dissagree", right: "Strongly agree", key: "q19"},
        {text: "I prioritize maintaining harmony in group dynamics and relationships.", dimension: "Fe", left: "Strongly dissagree", right: "Strongly agree", key: "q20"},
        {text: "I often adjust my actions to meet the needs or expectations of others.", dimension: "Fe", left: "Strongly dissagree", right: "Strongly agree", key: "q21"},
        {text: "I make decisions based on how well they align with my personal values.", dimension: "Fi", left: "Strongly dissagree", right: "Strongly agree", key: "q22"},
        {text: "I often reflect deeply on what matters most to me, even if it differs from others.", dimension: "Fi", left: "Strongly dissagree", right: "Strongly agree", key: "q23"},
        {text: "I feel most at peace when my actions reflect my authentic self.", dimension: "Fi", left: "Strongly dissagree", right: "Strongly agree", key: "q24"}
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

    // Add instructions at the top
    form.innerHTML += '<h2>MBTI Cognitive Functions Test</h2>';
    form.innerHTML += '<p>Please indicate your level of agreement with each statement by moving the slider. There are no right or wrong answers.</p>';

    selectedQuestions.forEach((q, index) => {
        const questionNumber = index + 1;
        unansweredQuestions.push(questionNumber); // Add all questions to the list initially
        const questionHTML = `
            <div class="question">
                <label for="${q.key}">${index + 1}. ${q.text}</label>
                <input type="range" id="${q.key}" name="${q.key}" min="0" max="100" value="50" oninput="markAnswered('${q.key}', ${questionNumber})" onchange="markAnswered('${q.key}', ${questionNumber})">
                <div class="range-labels">
                    <span>Less agreement</span>
                    <span>More agreement</span>
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
        let resultHTML = '<h2>Your Results</h2>';
        resultHTML += `<p>Please answer the following questions before submitting:</p>`;
        resultHTML += `<p>Unanswered Questions: ${unansweredQuestions.join(', ')}</p>`;
        resultsElement.innerHTML = resultHTML;
        return;
    }

    const form = document.getElementById('mbti-form');
    const formData = new FormData(form);

    let scores = {
        Se_total: 0, Se_n: 0,
        Si_total: 0, Si_n: 0,
        Ne_total: 0, Ne_n: 0,
        Ni_total: 0, Ni_n: 0,
        Te_total: 0, Te_n: 0,
        Ti_total: 0, Ti_n: 0,
        Fe_total: 0, Fe_n: 0,
        Fi_total: 0, Fi_n: 0,
    };

    formData.forEach((value, key) => {
        const question = selectedQuestions.find(q => q.key === key);
        if (question && question.dimension) {
            const dimension = question.dimension.trim();
            scores[`${dimension}_total`] += parseFloat(value);
            scores[`${dimension}_n`]++;
        }
    });

    const functions = ['Se', 'Si', 'Ne', 'Ni', 'Te', 'Ti', 'Fe', 'Fi'];
    let functionScores = {};
    functions.forEach(func => {
        functionScores[func] = scores[`${func}_n`] > 0
            ? scores[`${func}_total`] / scores[`${func}_n`]
            : 50; // Default neutral score
    });

    // Define function attitudes and types
    const functionAttitudes = {
        'Se': 'E', 'Si': 'I',
        'Ne': 'E', 'Ni': 'I',
        'Te': 'E', 'Ti': 'I',
        'Fe': 'E', 'Fi': 'I',
    };

    const functionTypes = {
        'Se': 'Perceiving', 'Si': 'Perceiving',
        'Ne': 'Perceiving', 'Ni': 'Perceiving',
        'Te': 'Judging', 'Ti': 'Judging',
        'Fe': 'Judging', 'Fi': 'Judging',
    };

    // Find the dominant function
    let sortedFunctions = Object.entries(functionScores)
        .map(([func, score]) => ({ func, score }))
        .sort((a, b) => b.score - a.score);

    const dominantFunction = sortedFunctions[0].func;
    const dominantToTypes = {
        'Ni': ['INTJ:Te','INFJ:Fe'],
        'Si': ['ISTJ:Te', 'ISFJ:Fe'],
        'Ti': ['INTP:Ne', 'ISTP:Se'],
        'Fi': ['ISFP:Se','INFP:Ne'],
        'Ne': ['ENTP:Ti','ENFP:Fi'],
        'Te': ['ENTJ:Ni','ESTJ:Si'],
        'Se': ['ENFJ:Si', 'ESFP:Fi'],
        'Fe': ['ENFJ:Ni','ESFJ:Si']
    };
    sortedFunctions.shift();
    let possibleTypes = dominantToTypes[dominantFunction];
    let mbtiType;
    let typeFound = false;
    possibleTypes.forEach(typeString => {
        let auxillary = typeString.slice(5);
        sortedFunctions.forEach(cognitiveFuncObj => {
            if(cognitiveFuncObj.func==auxillary){
                mbtiType=typeString.slice(0, -3);
                typeFound = true;
                return;
            }
        });
        if(typeFound){
            return;
        }
    });
    if (!mbtiType) {
        mbtiType = 'ERROR CALCULATING TYPE';
        console.warn(`MBTI type could not be determined for possible types: ${possibleTypes}`);
    }
    let isExactly50 = Object.values(functionScores).some(score => score === 50);

    let resultHTML = '<h2>Your Results</h2>';
    functions.forEach(func => {
        const percentage = functionScores[func];
        resultHTML += `
            <div class="result-bar">
                <div class="result-labels">
                    <span>${func}</span>
                    <span>${percentage.toFixed(2)}%</span>
                </div>
                <div class="slider-container">
                    <div class="slider" style="left: ${percentage}%;"></div>
                </div>
            </div>
        `;
    });
    resultHTML += `<h3>Your MBTI Type: ${mbtiType}</h3>`;

    if (isExactly50) {
        resultHTML += `<p>Your results indicate a 50/50 balance in one or more functions. Further introspection may help identify your dominant preferences.</p>`;
    }

    resultsElement.innerHTML = resultHTML;

    const urlParams = new URLSearchParams(window.location.search);
    fetch('/save-mbti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: urlParams.get('email'),
            mbti_type: mbtiType,
            mbti_vector: functions.map(func => functionScores[func]),
        }),
    })
    .then(response => {
        if (response.ok) {
            window.location.href = `/similar-users?email=${urlParams.get('email')}`;
        } else {
            console.error('Error saving MBTI vector:', response.statusText);
            alert('Error saving your results. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultsElement.innerHTML += '<p class="error">Error saving your results. Please try again later.</p>';
    });
}
