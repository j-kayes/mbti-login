document.addEventListener('DOMContentLoaded', () => {
    // Define an empty array to store user data
    let usersArray = [];

    // Get the current user's email from the query string
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    // Fetch the users excluding the current user
    fetch(`/other-users?email=${email}`)
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
            // Populate the array with user data
            usersArray = data.users;

            // Now use the array to populate the UI or perform other actions
            const usersList = document.getElementById('usersList');
            if (usersArray.length > 0) {
                usersArray.forEach(user => {
                    const userDiv = document.createElement('div');
                    userDiv.classList.add('user');
                    userDiv.innerHTML = `<p><strong>${user.name}</strong> - ${user.mbti_type}</p>`;
                    usersList.appendChild(userDiv);
                });
            } else {
                usersList.innerHTML = '<p>No users found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            document.getElementById('usersList').innerHTML = '<p>An error occurred while fetching users.</p>';
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
