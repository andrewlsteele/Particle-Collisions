const canvas = document.getElementById('canvas');
let start = null;
let particles = [];
let w = 0;
let h = 0;
let mousePosition = {x: 0, y: 0}, leftMouseDown = false;

function fixSize() {
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w;
    canvas.height = h;
    console.log("Fixing size");
}

function particle() {
        this.r = Math.random() * 30 + 20;
        this.x = mousePosition.x;
        this.y = mousePosition.y;
        this.dx = Math.random() * 20 - 10;
        this.dy = Math.random() * 20 - 10;
        this.color = Math.floor(Math.random()*16777215).toString(16); // Random 5 hex values (16^5)
        leftMouseDown = false;
} // Constructor class for creating particles

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
    context.fillStyle = '#000000';
    context.fillRect(0, 0, w, h);
    if (!start) start = timestamp;
    let progress = timestamp - start;

    if (leftMouseDown === true) {
        particles.push(new particle()); // Constructs new particle and adds to object list
        console.log(particles);
    }

    function distance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)); // Pythagoras Theorem to find distance between two points (centers of particles)
    }

    for (i = 0; i < particles.length; i++) {
        for (j = i + 1; j < particles.length; j++) {
            const b1 = particles[i];
            const b2 = particles[j];
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
            }
        } // Loop to check every pair of particles if any overlap.
          // Could be more efficient - implement sweep and prune algorithms or KD trees or bounding volume hierarchies.

        // Continuous Collision Detection (linear interpolation):
        let t = 0; // Where 0 <= t <= 1, t represents the time between frames when the particle is touching the edge.

        // let xt = (1-t)*particles[i].x + t*(particles[i].x + particles[i].dx); // x(t) = t*x(0) + (1-t)*x(1)
        // let yt = (1-t)*particles[i].y + t*(particles[i].y + particles[i].dy);


        if (particles[i].x + particles[i].r + particles[i].dx > w) {
            t = (w - particles[i].r - particles[i].y) / ((particles[i].x + particles[i].dx) - particles[i].y);
            particles[i].x += particles[i].dx * t - particles[i].dx * (1-t);
            particles[i].dx *= -1;
        } else if (particles[i].x - particles[i].r + particles[i].dx < 0) {
            t = (0 + particles[i].r - particles[i].x) / ((particles[i].x + particles[i].dx) - particles[i].x);
            particles[i].x += particles[i].dx * t - particles[i].dx * (1-t);
            particles[i].dx *= -1;
        }

        if (particles[i].y + particles[i].r + particles[i].dy > h) {
            t = (h - particles[i].r - particles[i].y) / ((particles[i].y + particles[i].dy) - particles[i].y);
            particles[i].y += particles[i].dy * t - particles[i].dy * (1-t);
            particles[i].dy *= -1;
        } else if (particles[i].y - particles[i].r + particles[i].dy < 0) {
            t = (0 + particles[i].r - particles[i].y) / ((particles[i].y + particles[i].dy) - particles[i].y);
            particles[i].y += (particles[i].dy * t - particles[i].dy * (1-t));
            particles[i].dy *= -1;
        }

        if (t == 0) { // crude solution but whatever
            particles[i].x += particles[i].dx;
            particles[i].y += particles[i].dy;
        }

        context.beginPath();
        context.fillStyle = "#" + particles[i].color;
        context.arc(particles[i].x, particles[i].y, particles[i].r, 0, 2*Math.PI);
        context.fill();
    }
    window.requestAnimationFrame(startAnim);
}
