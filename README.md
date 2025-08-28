# The k6 Whisperer : AI-Powered k6 Performance Testing Tool

This project is a web-based interface for the powerful open-source load testing tool, [k6](https://k6.io/). It allows users to generate and run complex performance tests by simply describing them in plain English. The application leverages a Generative AI (Google's Gemini) to translate natural language prompts into executable k6 JavaScript scripts and to provide human-readable summaries of the test results.

## Features

-   **Natural Language Interface**: No need to write k6 scripts manually. Just describe the test you want to run (e.g., "stress test my login page with 100 users for 5 minutes").
-   **AI-Powered Script Generation**: Uses Large Language Model (LLM) to dynamically create k6 test scripts based on your prompts.
-   **Automated Test Execution**: A Node.js backend executes the generated scripts and captures the results.
-   **Intelligent Result Analysis**: The AI analyzes the raw k6 JSON output and provides a concise, human-readable summary of the key performance metrics.
-   **Full k6 Capabilities**: Supports all major k6 features, including stages, thresholds, POST requests, and custom checks, through natural language commands.
-   **Local and Remote Testing**: Test applications running on `localhost` or any publicly accessible URL.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Frontend**: HTML, CSS, Vanilla JavaScript
-   **Performance Testing Engine**: Grafana k6
-   **Generative AI**: Google Gemini API (will explore more models)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

1.  **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
2.  **k6**: You must have the k6 engine installed on your system. Follow the [official k6 installation guide](https://k6.io/docs/getting-started/installation/).
3.  **Google Gemini API Key**:
    -   Go to [Google AI Studio](https://ai.google.dev/studio).
    -   Click "Get API Key" and create a new API key. It's free and does not require a billing account for the standard usage tier.

### Installation

1.  **Clone the repository:**
    ```
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install NPM packages:**
    ```
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Google Gemini API key:
    ```
    # .env file
    GEMINI_API_KEY="your_gemini_api_key_here"
    ```
    *Note: The application code needs to be updated to load this environment variable (e.g., using a library like `dotenv`).*

### Running the Application

1.  **Start the server:**
    ```
    node server.js
    ```

2.  **Open the application:**
    Open your web browser and navigate to `http://localhost:3000`. You should see the main interface.


## How to Use

1.  **Describe Your Test**: In the text area, type a description of the performance test you want to run.
2.  **Generate and Run**: Click the "Generate & Run Test" button.
3.  **View Results**: The application will display:
    -   The **Generated Script** created by the AI.
    -   The **AI Analysis**, a human-readable summary of the test results.
    -   The **Raw Output** from the k6 command line for detailed analysis.

### Sample Prompts

Here are some examples you can try:

-   **Basic Load Test**: `Run a simple load test on https://test.k6.io with 10 virtual users for 30 seconds.`
-   **Stress Test with Ramping**: `Create a stress test for https://test.k6.io/news.php. Start with 5 users, ramp up to 30 users over 45 seconds, and then stay at 30 users for another 30 seconds.`
-   **POST Request with Checks**: `Test the POST endpoint at https://test.k6.io/flip_coin.php. Send a payload with bet=heads for 20 seconds using 5 virtual users. Add a check to verify the HTTP status is 200.`
-   **Test with Thresholds**: `Run a load test on https://test.k6.io/pi.php?decimals=8 for 30 seconds with 15 users. Add a threshold to make the entire test fail if the 95th percentile response time is over 900 milliseconds.`
-   **Localhost Test**: `Test my local server at http://localhost:8080/api/users with 10 users for 1 minute.`

## Acknowledgments

-   [Grafana k6](https://k6.io/) for their incredible open-source tool.
-   [Google Gemini](https://ai.google.dev/) for providing the powerful generative AI capabilities.
```