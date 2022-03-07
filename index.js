const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl");
const startGameBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
const bigScoreEl = document.querySelector("#bigScoreEl");

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.angle;
        this.velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();

        // enemy follows player
        this.angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.velocity = {
            x: Math.cos(this.angle),
            y: Math.sin(this.angle),
        };

        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();

        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
    player = new Player(x, y, 10, "white");
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

function spawnEnemies() {
    setInterval(() => {
        // radius between 4 and 30
        const radius = Math.random() * (30 - 4) + 4;

        let x;
        let y;

        // set spawn position
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        // radius determines color
        let color;
        if (radius < 10) {
            color = `hsl(${240},50%,50%)`
        } else if (radius < 20) {
            color = `hsl(${120},50%,50%)`
        } else {
            color = `hsl(${360},50%,50%)`
        }

        enemies.push(new Enemy(x, y, radius, color));
    }, 1000);
}

let animationId;
let score = 0;
function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgb(0,0,0,0.1)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });
    projectiles.forEach((projectile, index) => {
        projectile.update();

        // Check if projectile is out of bounds
        if (
            projectile.x - projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y - projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        // end game
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
            modalEl.style.display = "flex";
            bigScoreEl.innerText = score;
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            );

            // when projectiles touch enemy
            if (dist - enemy.radius - projectile.radius < 1) {
                // create explosions
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 6),
                                y: (Math.random() - 0.5) * (Math.random() * 6),
                            }
                        )
                    );
                }
                if (enemy.radius - 10 > 5) {
                    // increase our score
                    score += 100;
                    scoreEl.innerHTML = score;

                    // make an enemy smaller using gsap library
                    gsap.to(enemy, {
                        radius: enemy.radius - 10,
                    });
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    // remove from scene altogether
                    score += 250;
                    scoreEl.innerHTML = score;

                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            }
        });
    });
}

let mouseX;
let mouseY;
setInterval(() => {
    onmousemove = function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };
    projectiles.push(new Projectile(player.x, player.y, 5, "red", velocity));
}, 500);

// TODO: 플레이어는 가운데 놓고 모든 적들의 x,y 좌표가 변경
addEventListener("keydown", (event) => {
    // left(a)
    if (event.keyCode == 65) {
        if (player.x - player.radius > 100) {
            gsap.to(player, {x: player.x - 100,ease:'power4',duration:2});
        }
    }
    // up(w)
    if (event.keyCode == 87) {
        if (player.y - player.radius > 100) {
            gsap.to(player, {y: player.y - 100,ease:'power4',duration:2});
        }
    }
    // right(d)
    if (event.keyCode == 68) {
        if (player.x + player.radius < canvas.width - 100) {
            gsap.to(player, {x: player.x + 100,ease:'power4',duration:2});
        }
    }
    // down(s)
    if (event.keyCode == 83) {
        if (player.y + player.radius < canvas.height - 100) {
            gsap.to(player, {y: player.y + 100,ease:'power4',duration:2});
        }
    }
});

// diagonal movement of player
let keysdown = {};
addEventListener(
    "keydown",
    function (event) {
        keysdown[event.which] = true;
        // up & left
        if (keysdown["65"] === true && keysdown["87"] === true) {
            if (player.x - player.radius > 100 && player.y - player.radius > 100){
                gsap.to(player, {x: player.x - 100,ease:'power4',duration:2});
                gsap.to(player, {y: player.y - 100,ease:'power4',duration:2});
            }
        }
        // up & right
        if (keysdown["68"] === true && keysdown["87"] === true) {
            if(player.y - player.radius > 100 && player.x + player.radius < canvas.width - 100){
                gsap.to(player, {x: player.x + 100,ease:'power4',duration:2});
                gsap.to(player, {y: player.y - 100,ease:'power4',duration:2});
            }
        }
        // down and left
        if (keysdown["65"] === true && keysdown["83"] === true) {
            if(player.x - player.radius > 100 && player.y + player.radius < canvas.height - 100){
                gsap.to(player, {x: player.x - 100,ease:'power4',duration:2});
                gsap.to(player, {y: player.y + 100,ease:'power4',duration:2});
            }
        }
        // down and right
        if (keysdown["68"] === true && keysdown["83"] === true) {
            if(player.x + player.radius < canvas.width - 100 && player.y + player.radius < canvas.height - 100){
                gsap.to(player, {x: player.x + 100,ease:'power4',duration:2});
                gsap.to(player, {y: player.y + 100,ease:'power4',duration:2});
            }
        }
    },
    false
);

addEventListener(
    "keyup",
    function (event) {
        keysdown[event.which] = false;
    },
    false
);

startGameBtn.addEventListener("click", () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = "none";
});
