/**
* The game
 */
class Game {
    /**
     * Inicializa un juego
     */
    constructor () {
        this.started = false; // Indicates whether the game has started or not.
        this.ended = false; // Indicates whether the game has ended or not
        this.keyPressed = undefined; // Indicates the key being pressed by the user
        this.width = 0; // Width of the game screen
        this.height = 0; // Height of the game screen
        this.player = undefined; // Instance of the game's main character
        this.playerShots = []; // Shots of the main character
        this.opponent = undefined; // Instance of the game opponent
        this.opponentShots = []; // Opponent's shots
        this.xDown = null; // Position where the user has touched the screen
        this.paused = false; // Indicates if the game is paused
    }

    /**
     * Starts the game
     */
    start () {
        if (!this.started) {
            // RequestAnimationFrame(this.update());
            window.addEventListener("keydown", (e) => this.checkKey(e, true));
            window.addEventListener("keyup", (e) => this.checkKey(e, false));
            window.addEventListener("touchstart", (e) => this.handleTouchStart(e, true));
            window.addEventListener("touchmove", (e) => this.handleTouchMove(e, false));
            document.getElementById("pause").addEventListener("click", () => {
                this.pauseOrResume();
            });
            document.getElementById("reset").addEventListener("click", () => {
                this.resetGame();
            });
            this.started = true;
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.player = new Player(this);
            this.timer = setInterval(() => this.update(), 50);
        }
    }

    /**
     * Pause or continue the game
     */
    pauseOrResume() {
        if (this.paused) {
            this.timer = setInterval(() => this.update(), 50);
            document.body.classList.remove('paused');
            this.paused = false;
        } else {
            clearInterval(this.timer);
            document.body.classList.add('paused');
            this.paused = true;
        }
    }
    /**
     * Adds a new shot to the game, either from the opponent or from the main character
     * @param character {Character} Shooting character
     */
    shoot (character) {
        const arrayShots = character instanceof Player ? this.playerShots : this.opponentShots;

        arrayShots.push(new Shot(this, character));
        this.keyPressed = undefined;
    }

    /**
     * Removes a shot from the game when it goes off the screen or the game is over
     * @param shot {Shot} Shot to be removed
     */
    removeShot (shot) {
        const shotsArray = shot.type === "PLAYER" ? this.playerShots : this.opponentShots,
            index = shotsArray.indexOf(shot);

        if (index > -1) {
            shotsArray.splice(index, 1);
        }
    }

    /**
     * Eliminates the opponent from the game
     */
    removeOpponent () {
        if (this.opponent) {
            document.body.removeChild(this.opponent.image);
        }
        this.opponent = new Opponent(this);
    }

    /**
     * Checks the key the user is pressing
     * @param event {Event} Raised/pressed key event
     * @param isKeyDown {Boolean} Indicates whether the key is pressed (true) or not (false).
     */
    checkKey (event, isKeyDown) {
        if (!isKeyDown) {
            this.keyPressed = undefined;
        } else {
            switch (event.keyCode) {
            case 37: // Left arrow
                this.keyPressed = KEY_LEFT;
                break;
            case 32: // Space bar
                this.keyPressed = KEY_SHOOT;
                break;
            case 39: // Right arrow
                this.keyPressed = KEY_RIGHT;
                break;
            case 27: case 81: // ESC or Q key
                this.pauseOrResume();
            }
        }
    }

    /**
     * Checks the position of the screen the user is touching
     * @param evt {Event} Screen touch event
     * @returns {*} Position of the screen being touched by the user
     */
    getTouches (evt) {
        return evt.touches || evt.originalEvent.touches;
    }

    /**
     * Handles the touch event on the screen
     * @param evt {Event} Screen touch event
     */
    handleTouchStart (evt) {
        const firstTouch = this.getTouches(evt)[0];

        this.xDown = firstTouch.clientX;
        this.keyPressed = KEY_SHOOT;
    }

    /**
     * Handles the event of dragging the finger on the screen
     * @param evt {Event} Finger dragging event on the screen
     */
    handleTouchMove (evt) {
        if (!this.xDown) {
            return;
        }
        const xUp = evt.touches[0].clientX,
            xDiff = this.xDown - xUp;

        if (xDiff > MIN_TOUCHMOVE) { /* Left swipe */
            this.keyPressed = KEY_LEFT;
        } else if (xDiff < -MIN_TOUCHMOVE) { /* Right swipe */
            this.keyPressed = KEY_RIGHT;
        } else {
            this.keyPressed = KEY_SHOOT;
        }
        this.xDown = null; /* Reset values */
    }

    /**
     *Check if the main character and the opponent have collided with each other or with the shots by using the hasCollision method.
     */
    checkCollisions () {
        let impact = false;

        for (let i = 0; i < this.opponentShots.length; i++) {
            impact = impact || this.hasCollision(this.player, this.opponentShots[i]);
        }
        if (impact || this.hasCollision(this.player, this.opponent)) {
            this.player.collide();
        }
        let killed = false;

        for (let i = 0; i < this.playerShots.length; i++) {
            killed = killed || this.hasCollision(this.opponent, this.playerShots[i]);
        }
        if (killed) {
            this.opponent.collide();
        }
    }

    /**
     * * Checks if two set elements are colliding
     * @param item1 {Entity} Set element 1
     * @ @param item2 {Entity} Set element 2
     * @returns {boolean} Returns true if they are colliding and false otherwise.
     */
    hasCollision (item1, item2) {
        if (item2 === undefined) {
            return false; // When opponent is undefined, there is no collision
        }
        const b1 = item1.y + item1.height,
            r1 = item1.x + item1.width,
            b2 = item2.y + item2.height,
            r2 = item2.x + item2.width;

        if (b1 < item2.y || item1.y > b2 || r1 < item2.x || item1.x > r2) {
            return false;
        }

        return true;
    }

    /**
     * Finish the game
     */
    endGame () {
        this.ended = true;
        let gameOver = new Entity(this, this.width / 2, "auto", this.width / 4, this.height / 4, 0, GAME_OVER_PICTURE)
        gameOver.render();
    }

    /**
     * reset the game
     */
     resetGame () {
       document.location.reload();
     }

    /**
     * Upgrade game elements
     */
    update () {
        if (!this.ended) {
            this.player.update();
            if (this.opponent === undefined) {
                this.opponent = new Opponent(this);
            }
            this.opponent.update();
            this.playerShots.forEach((shot) => {
                shot.update();
            });
            this.opponentShots.forEach((shot) => {
                shot.update();
            });
            this.checkCollisions();
            this.render();
        }
    }

    /**
     * Displays all game elements on the screen
     */
    render () {
        this.player.render();
        if (this.opponent !== undefined) {
            this.opponent.render();
        }
        this.playerShots.forEach((shot) => {
            shot.render();
        });
        this.opponentShots.forEach((shot) => {
            shot.render();
        });
    }
}
