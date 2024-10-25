document.addEventListener('DOMContentLoaded', () => {
    fetch('/similar-users', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch similar users: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.users && data.currentUser) {
            displayUsers(data.users, data.currentUser.mbtiVector);
        } else if(data.message){
            const usersList = document.getElementById('usersList');
            usersList.innerHTML = `
                <p>${data.message}</p>
                <button id="quizButton" onclick="window.location.href='/mbti-quiz/main.htm'" class="button">Take the Quiz</button>
            `;
        } else {
            console.error('Error fetching users:', data.error);
            displayError('Unable to fetch similar users.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayError('An error occurred while fetching similar users.');
    });
});

function calculateEuclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length) {
        console.error('Vectors have different lengths');
        return null;
    }
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
        const diff = vec1[i] - vec2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

function displayUsers(users, currentUserVector) {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = ''; // Clear any existing content

    if (users.length === 0) {
        usersList.innerHTML = '<p>No similar users found.</p>';
        return;
    }

    // Filter out users without mbtiVector
    const usersWithVectors = users.filter(user => user.mbtiVector && Array.isArray(user.mbtiVector));

    if (usersWithVectors.length === 0) {
        usersList.innerHTML = '<p>No similar users found.</p>';
        return;
    }

    // Calculate distance for each user
    usersWithVectors.forEach(user => {
        user.distance = calculateEuclideanDistance(user.mbtiVector, currentUserVector);
    });

    // Filter out users where distance calculation failed (e.g., due to vector length mismatch)
    const validUsers = usersWithVectors.filter(user => user.distance !== null);

    if (validUsers.length === 0) {
        usersList.innerHTML = '<p>No similar users found.</p>';
        return;
    }

    // Sort users by distance (ascending order)
    validUsers.sort((a, b) => a.distance - b.distance);

    validUsers.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('user-item');

        const mbtiVectorDisplay = `[${user.mbtiVector.join(', ')}]`;
        const distanceDisplay = user.distance.toFixed(2);

        userDiv.innerHTML = `
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Similarity Score:</strong> ${distanceDisplay}</p>
            <p><strong>MBTI Type:</strong> ${user.mbtiType}</p>
            <p><strong>MBTI Vector:</strong> ${mbtiVectorDisplay}</p>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Gender:</strong> ${user.gender}</p>
            <p><strong>Email:</strong> ${user.email}</p>
        `;
        usersList.appendChild(userDiv);
    });
}

function displayError(message) {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = `<p class="error">${message}</p>`;
}
