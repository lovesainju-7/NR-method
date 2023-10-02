const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const math = require('mathjs'); // Import the math.js library
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/css", express.static("css"));
app.use("/resources", express.static("resources"));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.post('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.post('/solve', (req, res) => {
    // Get user inputs
    const equationInput = req.body.equation;
    const initialGuess = parseFloat(req.body.initialGuess);
    const tol = req.body.error;
    // Define tolerance and maximum iterations
   
    const tolerance = 1/Math.pow(10,tol);
    const maxIterations = 100;

    // Initialize iteration counter and x-value
    let iteration = 0;
    let xVal = initialGuess;

    let resultsHTML= `<table><tr><th>Iteration</th><th>x</th><th>f(x)</th><th>f'(x)</th></tr>`;

    // Define the equation as a function
    const equationFunction = math.parse(equationInput).compile();

    while (iteration < maxIterations) {
        try {
            // Calculate the function value and its derivative at xVal
            const fxVal = equationFunction.evaluate({ x: xVal });
            const dfxVal = math.derivative(equationInput, 'x').evaluate({ x: xVal });

            // Check for convergence
            if (Math.abs(fxVal) < tolerance) {
                break;
            }

            // Update x using the Newton-Raphson formula
            xVal = xVal - fxVal / dfxVal;

            // Append current iteration details to results HTML
            resultsHTML += `<tr><td>${iteration}</td><td>${xVal.toFixed(6)}</td><td>${fxVal.toFixed(7)}</td><td>${dfxVal.toFixed(6)}</td></tr>`;

            iteration++;
        } catch (error) {
            console.error(error);
            resultsHTML += `<tr><td colspan="3">Error occurred during evaluation.</td></tr>`;
            break;
        }
    }

    if (iteration === maxIterations) {
        resultsHTML += `<tr><td colspan="3">Maximum iterations reached. The method did not converge.</td></tr>`;
    }

    resultsHTML += '</table>';

    // Display the results
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Newton-Raphson Solver</title>
        <link rel="stylesheet" type="text/css" href="css/styles.css" />
    </head>
    <body background="resources/mcsc.png">
        <b>
        <h1>Newton-Raphson </h1>
        <h1>Solver</h1>
                <form id="solver-form" action="/" method="post">
                <div class="prev">
                <p> Equation = ${equationInput} </p>
                <p>Initial Guess = ${initialGuess} </p>
                <p>The Solution correct to ${tol} digits is found by:</p>
                </div>
                <div class="text">
                <p>${resultsHTML}</p>
                <p>Converged to solution:${xVal.toFixed(tol)}</p>

                <center>
                    <input type="submit" class="btn" value="Back">
                </center>
                </div>
                </form>
        </b>
    </body>
    </html>
`);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
