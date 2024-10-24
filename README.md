
# Football Team Information Dashboard

## Description

The **Football Team Information Dashboard** is a simple React application that allows users to input the names of football teams and retrieve detailed information about upcoming fixtures, standings, and injuries for each team. This project leverages the [API-Football](https://rapidapi.com/api-sports/api/api-football) API to fetch real-time data related to football teams. The app provides a clean interface for football enthusiasts to easily keep track of their favorite teams and their upcoming matches.

### Problem It Solves

Finding detailed, up-to-date information about football teams across different leagues often requires visiting multiple websites or apps. This project solves that problem by integrating all relevant information — including upcoming fixtures, standings, and player injuries — into one unified, easy-to-use interface. It streamlines the process of keeping track of multiple teams, providing real-time data all in one place.

## Features

- Input up to three football teams by name.
- Fetch upcoming fixtures for each team with detailed match information.
- Display current league standings for the specified teams.
- Show injuries, if available, for each team.
- Clean and responsive design for a user-friendly experience.

## Setup and Run Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nayalafifi/FootballDashboard.git
   cd FootballDashboard
   ```

2. **Install dependencies**:
   Make sure you have [Node.js](https://nodejs.org/) installed. Then, run the following command in the project directory to install required packages:
   ```bash
   npm install
   ```

3. **Create an `.env` file**:
   Inside the root folder of your project, create an `.env` file and add your API key:
   ```bash
   REACT_APP_API_KEY=your-api-key-here
   ```

4. **Run the project**:
   Start the development server by running:
   ```bash
   npm start
   ```

   This will launch the app on `http://localhost:3000`.

## API Information

This project utilizes the [API-Football](https://rapidapi.com/api-sports/api/api-football) to gather real-time data about football teams, including:

- **Upcoming Fixtures**: Displays the next 15 matches for the teams.
- **Standings**: Shows the team's current position and points in the league.
- **Injuries**: Lists player injuries without duplicates.

The API is integrated using `fetch` requests in React. Data is pulled from API-Football's endpoints and dynamically displayed in the dashboard based on user input.

## Credits for AI-Generated Code

Portions of this project were generated using **ChatGPT**, an AI language model. The AI assisted in generating the core logic for fetching data from the API, handling team information inputs, and formatting the data display. Specifically, AI was used to help structure the following features:
- Fetching data for team fixtures, standings, and injuries.
- Structuring the display of fixtures in a visually appealing card layout.

These AI-generated sections greatly accelerated the development process and helped in setting up the core functionality of the application. The AI-generated code was adapted and modified to fit the specific requirements of the project.

