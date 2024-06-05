# Charusat Result Scraper

## Overview

This Node.js script aims to streamline the process of accessing results for all classmates from CHARUSAT (Charotar University of Science and Technology). It automates result checking by monitoring the result declaration page and fetching results for all students once they are available. This saves time and effort, especially considering the delays in loading results on the official website.

## Features

- Automatically checks if results are declared
- Fetches results for all students at once
- Can be scheduled as a cronjob for periodic result checking

## Why This Project?

The official CHARUSAT result page often experiences slow loading times, making it inconvenient for students to access their results promptly. This script provides a solution by automating the result retrieval process, ensuring quick access to results for all classmates.

## How It Works

The script periodically checks the CHARUSAT result declaration page to determine if results have been published. If results are available, it proceeds to fetch the results for all students, compiling them into a single easily accessible format.

## Usage

To use this script:

1. Clone the repository.
2. Install dependencies using `npm install` for client and server both.
3. Configure the script with your credentials and desired settings.
4. Run the frontend using `npm run dev` from client directory.
5. Run the backend using `node .` from server directory.
6. Optionally, set up a cronjob to run the script periodically.

## .env files for client and server
```
VITE_BACKEND_URL=""
```

```
DATABASE_URL=""
STATUS_WEBHOOK_URL=""
FAILED_WEBHOOK_URL=""
DECLARED_WEBHOOK_URL=""
```

## Troubleshooting

If you encounter any issues, feel free to [create an issue](#) on GitHub for assistance.

## Contributions

Contributions are welcome! If you have any ideas for improvements or new features, please [open an issue](#) or submit a pull request.
