document.addEventListener('DOMContentLoaded', () => {
    // Get references to the main containers and key elements
    const mainMenu = document.getElementById('main-menu');
    const optionsScreen = document.getElementById('options-screen');
    const chamberSelectScreen = document.getElementById('chamber-select-screen');
    const gameView = document.getElementById('game-view'); // <-- Reference to game view container

    const menuItems = document.querySelectorAll('#main-menu .menu-item');
    const backButtonFromOptions = document.getElementById('back-to-main-from-options');
    const backButtonFromChambers = document.getElementById('back-to-main-from-chambers');
    const backButtonFromGame = document.getElementById('back-to-main-from-game'); // <-- Reference back button from game
    const chamberSelectItems = document.querySelectorAll('.chamber-select-item');

    // Options screen elements (keep these)
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValueSpan = document.getElementById('volume-value');
    const difficultySelect = document.getElementById('difficulty-select');

    // --- Function to Show/Hide Screens ---
    function showScreen(screenToShow) {
        // Hide all screens first
        mainMenu.classList.add('hidden');
        optionsScreen.classList.add('hidden');
        chamberSelectScreen.classList.add('hidden');
        gameView.classList.add('hidden'); // <-- Hide game view too

        // Stop game loop if we are leaving the game screen AND the game exists/is active
        // Use optional chaining (?.) in case window.currentGame doesn't exist yet
        if (window.currentGame?.isActive && screenToShow !== 'game') {
             console.log("Stopping game loop...");
             window.currentGame.stop(); // Call the stop function from game.js
        }

        // Show the requested screen
        if (screenToShow === 'main') {
            mainMenu.classList.remove('hidden');
        } else if (screenToShow === 'options') {
            optionsScreen.classList.remove('hidden');
        } else if (screenToShow === 'chamber-select') {
            chamberSelectScreen.classList.remove('hidden');
        } else if (screenToShow === 'game') { // <-- Handle showing the game view
            gameView.classList.remove('hidden');
            // Start game loop if game exists and isn't running
            // Use optional chaining (?.) again
            if (window.currentGame && !window.currentGame?.isActive) {
                console.log("Starting game loop...");
                window.currentGame.start(); // Call the start function from game.js
            }
        }
    }

    // --- Event Listeners for Main Menu Items ---
    menuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const action = item.getAttribute('data-action');
            console.log(`Main Menu Action clicked: ${action}`);

            switch (action) {
                case 'new-game':
                    console.log("Opening Chamber Select...");
                    showScreen('chamber-select'); // Show the chamber select screen
                    break;
                case 'continue':
                    // Later: Check for saved game, maybe go direct to game or show different select screen
                    alert("Loading Saved Game... (Placeholder - Needs implementation)");
                    // Potentially load last chamber and showScreen('game')
                    break;
                case 'options':
                    console.log("Opening Options...");
                    showScreen('options');
                    break;
                case 'exit':
                    console.log("Attempting to close tab...");
                    window.close(); // Note: This often doesn't work due to browser security
                    console.warn("If the tab did not close, browser security restrictions likely prevented it.");
                    break;
                default:
                    console.warn(`Unknown menu action: ${action}`);
            }
        });
    });

    // --- Event Listener for the Back Button in Options ---
    if (backButtonFromOptions) {
        backButtonFromOptions.addEventListener('click', () => {
            console.log("Closing Options, returning to Main Menu...");
            saveOptions(); // Save options when leaving screen
            showScreen('main');
        });
    }

    // --- Event Listener for the Back Button in Chamber Select ---
    if (backButtonFromChambers) {
        backButtonFromChambers.addEventListener('click', () => {
            console.log("Closing Chamber Select, returning to Main Menu...");
            showScreen('main');
        });
    }

    // --- Event Listener for the Back Button in Game --- // <-- NEW
    if (backButtonFromGame) {
        backButtonFromGame.addEventListener('click', () => {
            console.log("Exiting Chamber, returning to Main Menu...");
            // The showScreen function already handles stopping the game loop
            showScreen('main'); // Or maybe 'chamber-select'? Your choice.
        });
    }


    // --- Event Listeners for Chamber Selection Items ---
    chamberSelectItems.forEach(item => {
        // Skip adding listener if the item is disabled
        if (item.classList.contains('disabled')) {
            return; // Don't attach click listener to disabled items
        }

        item.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const chamberId = item.getAttribute('data-chamber-id');
            console.log(`Selected Test Chamber: ${chamberId}`);

            // Check if the initGame function is available (loaded from game.js)
            if (typeof window.initGame === 'function') {
                 try {
                    window.initGame(chamberId); // Initialize the game scene via game.js
                    showScreen('game');         // Switch to the game view
                 } catch (error) {
                    console.error("Error during game initialization:", error);
                    alert("Failed to initialize the game. Check console for errors.");
                    showScreen('main'); // Go back to main menu on error
                 }
            } else {
                console.error("Game initialization function (initGame) not found! Make sure game.js is loaded correctly and exposes initGame globally.");
                alert("Error: Could not load the game dependencies.");
            }
        });
    });


    // --- Options Logic (Volume, Difficulty, Load/Save - Unchanged from your version) ---
    if (volumeSlider && volumeValueSpan) {
        // Set initial display value
        volumeValueSpan.textContent = `${volumeSlider.value}%`;
        // Add listener
        volumeSlider.addEventListener('input', () => {
            const volume = volumeSlider.value;
            volumeValueSpan.textContent = `${volume}%`;
            console.log(`Volume changed to: ${volume}%`);
            // Update actual audio volume here (requires AudioContext usually)
        });
    }

    if (difficultySelect) {
        difficultySelect.addEventListener('change', () => {
             const selectedDifficulty = difficultySelect.value;
             console.log(`Difficulty changed to: ${selectedDifficulty}`);
             // This value could be passed to initGame or stored for later use
        });
     }

    function saveOptions() {
        const currentVolume = volumeSlider.value;
        const currentDifficulty = difficultySelect.value;
        console.log(`Saving Options - Volume: ${currentVolume}%, Difficulty: ${currentDifficulty}`);
        try {
            // Uncomment to enable saving to localStorage
            /*
            localStorage.setItem('gameOptions', JSON.stringify({
                 volume: currentVolume,
                 difficulty: currentDifficulty
            }));
            console.log("Options saved to localStorage.");
            */
        } catch (e) {
            console.error("Failed to save options to localStorage:", e);
        }
    }

     function loadOptions() {
        let loaded = false;
         try {
            // Uncomment to enable loading from localStorage
            /*
             const savedOptionsJSON = localStorage.getItem('gameOptions');
             if (savedOptionsJSON) {
                 const savedOptions = JSON.parse(savedOptionsJSON);
                 console.log("Loading saved options:", savedOptions);
                 volumeSlider.value = savedOptions.volume !== undefined ? savedOptions.volume : 75;
                 difficultySelect.value = savedOptions.difficulty || 'normal';
                 loaded = true;
             }
             */
         } catch (e) {
             console.error("Failed to load or parse options from localStorage:", e);
         }

         if (!loaded) {
            console.log("No saved options found or loading disabled, using defaults.");
            volumeSlider.value = 75; // Default value
            difficultySelect.value = 'normal'; // Default value
         }

         // Update visual display AFTER setting value
         if (volumeValueSpan) volumeValueSpan.textContent = `${volumeSlider.value}%`;
         console.log(`Options loaded - Volume: ${volumeSlider.value}%, Difficulty: ${difficultySelect.value}`);
     }


    // --- Initial Setup ---
    loadOptions(); // Load options first
    showScreen('main'); // Show main menu initially
    console.log("Menu system initialized.");
});
