const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();


const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.launch()

require('./cron-jobs/checkResult').start(bot)

const app = express();

app.use(cors({
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

const server = require('http').createServer(app);
const prisma = new PrismaClient();

// Define the directory where PDF files are stored
const resultsDirectory = path.join(__dirname, 'results');

const authorizedUsers = [
    { id: 'user', password: 'pass' },
    { id: 'user2', password: 'password2' },
];


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'results' directory
app.use('/results', express.static(resultsDirectory));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle form submission and download of results
app.post('/download', async (req, res) => {
    try {
        const { id, password } = req.body;

        // Verify user credentials
        const user = authorizedUsers.find(user => user.id === id && user.password === password);
        if (!user) {
            return res.status(401).send('Unauthorized: Invalid credentials');
        }

        require('./cron-jobs/checkResult').start(bot);

        res.status(200).send('Results will be downloaded successfully!');
    } catch (error) {
        console.error("Error downloading results:", error);
        res.status(500).send('Error downloading results. Please try again.');
    }
});


app.get('/getResults', async (req, res) => {
    const data = await prisma.student.findMany({
        include: {
            subjects: true
        },
        orderBy: {
            id: 'asc'
        }
    });
    res.json(data);
})


// Route to handle PDF download
app.get('/results/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(resultsDirectory, `${filename}.pdf`);

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, send 404 HTML page
            return res.status(404).sendFile(path.join(__dirname, '404.html'));
        }

        // File exists, force download
        const downloadStream = fs.createReadStream(filePath);
        downloadStream.on('error', (error) => {
            console.log("Error downloading file:", error);
            res.status(500).send("Internal Server Error");
        });

        // Pipe the download stream to the response object
        downloadStream.pipe(res);
    });
});

// Route to handle success page
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// Wildcard route to handle 404 errors
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


process.on('uncaughtException', async (err) => {
    console.error(err);
})
process.on('unhandledRejection', async (err) => {
    console.error(err);
})
