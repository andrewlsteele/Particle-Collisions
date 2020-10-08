const canvas = document.getElementById('mazeCanvas');
let start = null;
let balls = [];
let w = 0;
let h = 0;
let mousePosition = {x: 0, y: 0}, leftMouseDown = false;

function fixSize() {
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w;
    canvas.height = h;
}

function spawnBall() {
        let r = Math.random() * 30 + 20;
        let x = mousePosition.x;
        let y = mousePosition.y;
        let dx = Math.random() * 20 - 10;
        let dy = Math.random() * 20 - 10;
        balls.push({x, y, dx, dy, r});
        leftMouseDown = false;
}

function pageLoad() {
    console.log("Page loaded");
    window.addEventListener("resize", fixSize());
    fixSize();

    canvas.addEventListener('mousemove', event => {
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
    }, false);

    canvas.addEventListener('mousedown', event => {
        if (event.button === 0) {
            leftMouseDown = true;
        }
    }, false);

    canvas.addEventListener('mouseup', event => {
        if (event.button === 0) {
            leftMouseDown = false;
        }
    }, false);

    window.requestAnimationFrame(startAnim);
}

function startAnim(timestamp) {
    const context = canvas.getContext('2d');
    context.fillStyle = '#2F4F4F';
    context.fillRect(0, 0, w, h);
    if (!start) start = timestamp;
    let progress = timestamp - start;
    let img = new Image();
    img.src = "red.png";

    if (leftMouseDown === true) {
        spawnBall();
    }

    function distance(b1, b2) {
        return Math.sqrt(Math.pow(b2.x - b1.x, 2) + Math.pow(b2.y - b1.y, 2));
    }

    for (i=0; i < balls.length; i++) {
        if (balls[i].x + balls[i].r > w) {
            balls[i].x = w - balls[i].r;
            balls[i].dx *= -1;
        } else if (balls[i].x - balls[i].r < 0) {
            balls[i].x = balls[i].r;
            balls[i].dx *= -1;
        }
        if (balls[i].y + balls[i].r > h) {
            balls[i].y = h - balls[i].r;
            balls[i].dy *= -1;
        } else if (balls[i].y - balls[i].r < 0) {
            balls[i].y = balls[i].r;
            balls[i].dy *= -1;
        }

        balls[i].x += balls[i].dx;
        balls[i].y += balls[i].dy;
        context.drawImage(img, balls[i].x - balls[i].r, balls[i].y - balls[i].r, balls[i].r * 2, balls[i].r * 2);
    }

    for (i = 0; i < balls.length; i++) {
        for (j = i + 1; j < balls.length; j++) {
            const b1 = balls[i];
            const b2 = balls[j];
            const s = distance(b1, b2);
            const overlap = b1.r + b2.r - s;

            if (overlap >= 0) {

                let unitVector = {x: (b2.x - b1.x) / s, y: (b2.y - b1.y) / s}; // Unit vector gives exact ratio of x to y of the vector.
                let tanUnitVector = {x: -unitVector.y, y: unitVector.x}; // When one ball hits another, it is always at a tangent. Therefore, the angle between the tangent and the ball's vector will always be perpendicular. We can calculate the line vector of the tangent by using {x, y} --> {-y, x} (try on paper to see why this works).
                let relativeVelocity = {dx: b1.dx - b2.dx, dy: b1.dy - b2.dy}; // We need the difference in the velocities because the original velocities don't matter.
                let dotProduct = (tanUnitVector.x * relativeVelocity.dx) + (tanUnitVector.y * relativeVelocity.dy); // The tangent vector and the velocity vector are not perpendicular. We can use the dot product to find the multiplier by which the tangent vector meets the velocity vector.
                let velocityComponentOnTangent = {dx: dotProduct*tanUnitVector.x, dy: dotProduct*tanUnitVector.y}; // By multiplying the dot product scalar by the unit vector of the tangent, we can find the whole velocity vector for the component parallel to the tangent.
                let velocityComponentPerpendicularToTangent = {dx: relativeVelocity.dx - velocityComponentOnTangent.dx, dy: relativeVelocity.dy - velocityComponentOnTangent.dy}; // Using simple GCSE vector addition/subtraction, we can determine that the velocity vector plus the velocity component vector parallel to the tangent going backwards (so negative) must equal the velocity vector perpendicular to the tangent.

                b1.dx -= velocityComponentPerpendicularToTangent.dx;
                b1.dy -= velocityComponentPerpendicularToTangent.dy;
                b2.dx += velocityComponentPerpendicularToTangent.dx;
                b2.dy += velocityComponentPerpendicularToTangent.dy;

                // This code was pretty much taken from here: http://flatredball.com/documentation/tutorials/math/circle-collision/
            }
        }
    }
    window.requestAnimationFrame(startAnim);
}
