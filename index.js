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

        // if(this.x < player.x) {
        //     this.x = this.x + this.velocity;
        // }
        // if(this.x > player.x) {
        //     this.x = this.x - this.velocity;
        // }
        // if(this.y < player.y) {
        //     this.y = this.y + this.velocity;
        // }
        // if(this.y > player.y) {
        //     this.y = this.y - this.velocity;
        // }

        // this.x = this.x + this.velocity.x;
        // this.y = this.y + this.velocity.y;

        this.angle = Math.atan2(canvas.height / 2 - this.y, canvas.width / 2 - this.x);

        this.velocity = {
            x: Math.cos(this.angle),
            y: Math.sin(this.angle)
        }

        if(!up&&!down&&!left&&!right) {
            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
        }

        if (up) {
            gsap.to(this, {
                y: this.y + this.velocity.y + player_velocity,
                x: this.x + this.velocity.x*3,
                ease: "power3",
                duration: 0,
            });
        }
        if (right) {
            gsap.to(this, {
                x: this.x + this.velocity.x - player_velocity,
                y: this.y + this.velocity.y*3,
                ease: "power3",
                duration: 0,
            });
        }
        if (down) {
            gsap.to(this, {
                y: this.y + this.velocity.y - player_velocity,
                x: this.x + this.velocity.x*3,
                ease: "power3",
                duration: 0,
            });
        }
        if (left) {
            gsap.to(this, {
                x: this.x + this.velocity.x + player_velocity,
                y: this.y + this.velocity.y*3,
                ease: "power3",
                duration: 0,
            });
        }
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

let player;
let player_velocity = 2;
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
            color = `hsl(${240},50%,50%)`;
        } else if (radius < 20) {
            color = `hsl(${120},50%,50%)`;
        } else {
            color = `hsl(${360},50%,50%)`;
        }

        // const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        // const velocity = Math.random() * (3 - 1) + 1;
        // const velocity = 2;
        // const velocity = {
        //     x: Math.cos(angle),
        //     y: Math.sin(angle)
        // }
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

    const angle = Math.atan2(
        mouseY - canvas.height / 2,
        mouseX - canvas.width / 2
    );
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };
    projectiles.push(
        new Projectile(canvas.width / 2, canvas.height / 2, 5, "red", velocity)
    );
}, 500);

let up;
let down;
let left;
let right;
function move() {
    up = false;
    down = false;
    left = false;
    right = false;

    document.addEventListener("keydown", (e) => {
        if (e.keyCode === 87 /* w */) {
            up = true;
        }
        if (e.keyCode === 68 /* d */) {
            right = true;
        }
        if (e.keyCode === 83 /* s */) {
            down = true;
        }
        if (e.keyCode === 65 /* a */) {
            left = true;
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.keyCode === 87 /* w */) {
            up = false;
        }
        if (e.keyCode === 68 /* d */) {
            right = false;
        }
        if (e.keyCode === 83 /* s */) {
            down = false;
        }
        if (e.keyCode === 65 /* a */) {
            left = false;
        }
    });
}

startGameBtn.addEventListener("click", () => {
    init();
    animate();
    spawnEnemies();
    move();
    modalEl.style.display = "none";
});
