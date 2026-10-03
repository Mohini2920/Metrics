document.addEventListener("DOMContentLoaded",function(){

    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-cont");

    const easyProgress = document.querySelector(".easy-progress");
    const mediumProgress = document.querySelector(".medium-progress");
    const hardProgress = document.querySelector(".hard-progress");

    const easyLabel = document.getElementById('easy-label');
    const mediumLabel = document.getElementById('medium-label');
    const hardLabel = document.getElementById('hard-label');

    const statsCardContainer = document.querySelector('.stats-card'); 

    // return true or false based on a regex(regular expression)
    function validateUsername(username){
        if(username.trim() == ""){
            alert("Username should not be empty");
            return false;
        }

        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;
    }

    const updateProgress = (solved,total,label,circle) => {
        const progressDegree = Math.ceil(Number((solved/total)*100));
        label.textContent = `${solved}/${total}`
        circle.style.setProperty("--progress-degree",`${progressDegree}%`);
    }

    // NEW: puts the three circles back to their empty state
    function resetDisplay(){
        [
            [easyLabel, easyProgress, "Easy"],
            [mediumLabel, mediumProgress, "Medium"],
            [hardLabel, hardProgress, "Hard"]
        ].forEach(([label, circle, text]) => {
            label.textContent = text;
            circle.style.setProperty("--progress-degree", "0%");
        });
    }

    const showData = (data)=> {
        const t_easy_qs = data.totalEasy;
        const t_medium_qs = data.totalMedium;
        const t_hard_qs = data.totalHard;

        const s_easy_qs = data.easySolved;
        const s_medium_qs = data.mediumSolved;
        const s_hard_qs = data.hardSolved;

        updateProgress(s_easy_qs,t_easy_qs,easyLabel,easyProgress);
        updateProgress(s_medium_qs,t_medium_qs,mediumLabel,mediumProgress);
        updateProgress(s_hard_qs,t_hard_qs,hardLabel,hardProgress);

        // CHANGED: removed the "Acceptance rate" card, because the API
        // does not return that field and it always showed "undefined"
        const cardData = [
            {
                label : "Total Solved",
                value : data.totalSolved
            },
            {
                label : "Ranking",
                value : data.ranking
            }
        ]

        statsCardContainer.innerHTML = cardData.map(
            (data) => {
                return `
                    <div class = 'card'>
                        <h3>${data.label}</h3>
                        <p>${data.value}</p>
                    </div>
                `
            }
        ).join("")
    }

    async function fetchUserDetails(username) {
        const url = `https://alfa-leetcode-api.onrender.com/${username}/profile`
        try{

            searchButton.textContent = "Searching..";
            searchButton.disabled = true;
            statsCardContainer.style.display = 'none';

            const response = await fetch(url);
            if(!response.ok){
                throw new Error("Unable to fetch data !");
            }

            const data = await response.json();

            // NEW: the API can reply normally even for unknown users,
            // so check that real data came back before using it
            if(data.totalSolved === undefined){
                throw new Error("User not found");
            }

            showData(data);
        }
        catch(error){
            console.log(error);
            // CHANGED: reset the circles and show the message in the card area.
            // Before, this replaced statsContainer, which deleted the circles.
            resetDisplay();
            statsCardContainer.innerHTML = `<p>User not found, or the server could not be reached. Please try again.</p>`;
        }
        finally{
            searchButton.textContent = "Search";
            searchButton.disabled = false;
            statsCardContainer.style.display = 'block';
        }
    }

    searchButton.addEventListener('click', ()=> {
        const username = usernameInput.value;

        if(validateUsername(username)){
            fetchUserDetails(username);
        }
    })

})
