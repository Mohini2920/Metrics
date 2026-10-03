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

    // puts the three circles back to their empty state
    function resetDisplay(){
        [
            [easyLabel, easyProgress],
            [mediumLabel, mediumProgress],
            [hardLabel, hardProgress]
        ].forEach(([label, circle]) => {
            label.textContent = "";
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

        // The API does not return an acceptance rate, so that card was removed.
        // Ranking is formatted with commas (e.g. 13,67,369).
        const cardData = [
            {
                label : "Total Solved",
                value : data.totalSolved
            },
            {
                label : "Global Ranking",
                value : data.ranking ? Number(data.ranking).toLocaleString("en-IN") : "N/A"
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
            statsContainer.classList.add("loading");

            const response = await fetch(url);
            if(!response.ok){
                throw new Error("Unable to fetch data !");
            }

            const data = await response.json();

            // The API can reply normally even for unknown users,
            // so check that real data came back before using it
            if(data.totalSolved === undefined){
                throw new Error("User not found");
            }

            showData(data);
        }
        catch(error){
            console.log(error);
            resetDisplay();
            statsCardContainer.innerHTML = `<p class="error-msg">User not found, or the server could not be reached. Please try again.</p>`;
        }
        finally{
            searchButton.textContent = "Search";
            searchButton.disabled = false;
            statsContainer.classList.remove("loading");
        }
    }

    searchButton.addEventListener('click', ()=> {
        const username = usernameInput.value;

        if(validateUsername(username)){
            fetchUserDetails(username);
        }
    })

    // pressing Enter in the box also searches
    usernameInput.addEventListener('keydown', (e)=> {
        if(e.key === "Enter"){
            searchButton.click();
        }
    })

})
