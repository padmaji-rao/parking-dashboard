# Parking Dashboard

A dashboard application to display parking data from MongoDB.

## Features

- Real-time display of parking data
- Dashboard showing total vehicles, available spots, and revenue
- Integration with MongoDB database
- Automatic data refresh

## Prerequisites

- Node.js (v14 or later)
- NPM (v6 or later)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your MongoDB credentials

## Environment Variables

The application uses the following environment variables:

- `MONGODB_URI`: Your MongoDB connection string
- `REACT_APP_API_URL`: The URL for the API (defaults to http://localhost:5000/api)

## Running the Application

To start both the backend and frontend servers concurrently:

```