# SQL Mastery: An AI-Powered SQL Learning Platform

**SQL Mastery** is an innovative, immersive platform designed to help users master SQL through real-world challenges and personalized, AI-driven feedback. Whether you're a beginner or an experienced developer, SQL Mastery provides the tools and resources you need to level up your SQL skills.

## Key Features

*   **Interactive SQL Challenges:** Practice SQL with hands-on exercises based on realistic scenarios.
*   **Real-Time AI Feedback:** Get instant, personalized feedback on your SQL code using the power of AI.
*   **Progress Tracking:** Monitor your learning journey with detailed analytics and visualizations.
*   **Community Benchmarking:** Compare your skills with other learners and stay motivated.
*   **GitHub Classroom Integration:** Seamlessly integrate exercises with GitHub Classroom for easy project management.
*   **Multi-SGBD Support:** Work with various database systems, including PostgreSQL, MySQL, Oracle, and SQLite.
*   **Advanced AI Assistance:** Benefit from AI-powered code correction, concept explanations, personalized exercises, and query optimization tips.
*   **Live SQL Environment:** Test your queries in a live SQL editor with schema visualization and result previews.
* **Ollama Integration:** The platform uses Ollama with the DeepSeek 7B model for AI-powered features.

## Technology Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/): A React framework for building performant web applications.
    *   [React](https://react.dev/): A JavaScript library for building user interfaces.
    *   [TypeScript](https://www.typescriptlang.org/): A statically typed superset of JavaScript.
    *   [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapid UI development.
    *   [Framer Motion](https://www.framer.com/motion/): A library for creating smooth animations.
    *   [React Hook Form](https://react-hook-form.com/): For managing forms.
    *   [Zod](https://zod.dev/): For schema validation.
    *   [Typewriter-effect](https://www.npmjs.com/package/typewriter-effect): For the typewriter effect.
    *   [Next-auth](https://next-auth.js.org/): For authentication.
    *   [Radix UI](https://www.radix-ui.com/): For unstyled UI components.
*   **Backend:**
    *   [Node.js](https://nodejs.org/): A JavaScript runtime environment.
    *   [Prisma](https://www.prisma.io/): An ORM for database access.
    *   [Ollama](https://ollama.com/): For running large language models locally.
    *   [DeepSeek 7B](https://deepseekcoder.github.io/): The specific large language model used for AI features.
*   **Database:**
    *   [PostgreSQL](https://www.postgresql.org/): A powerful, open-source relational database.

## Getting Started

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/noreyni03/sql-training.git
    cd sql-training
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set Up the Database:**

    *   Ensure you have PostgreSQL installed and running.
    *   Create a new database for the project.
    *   Update the `DATABASE_URL` in your `.env` file with your database connection string.
    *   Run Prisma migrations:

    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Set Up Ollama:**

    *   Install Ollama from https://ollama.com/.
    *   Pull the DeepSeek Coder model:
    ```bash
    ollama pull deepseek-coder:7b-instruct-q4_1
    ```
    *   Ensure Ollama is running in the background.

5.  **Environment Variables:**

    *   Create a `.env` file in the root directory.
    *   Add the following variables (replace with your actual values):

    ```
    DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your_secret_key"
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    GITHUB_CLIENT_ID="your_github_client_id"
    GITHUB_CLIENT_SECRET="your_github_client_secret"
    ```

6.  **Run the Development Server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

7.  **Access the Application:**

    *   Open your browser and go to `http://localhost:3000`.

## AI Integration with Ollama and DeepSeek 7B

This project leverages the power of Ollama and the DeepSeek 7B model to provide AI-driven features. Here's how it works:

*   **Ollama:** Ollama is used to run the DeepSeek 7B model locally. This eliminates the need for external API calls and provides a more private and efficient AI experience.
*   **DeepSeek 7B:** This large language model is specifically trained for code generation and understanding. It's used to:
    *   Analyze user-submitted SQL code.
    *   Identify errors and suggest corrections.
    *   Provide explanations of SQL concepts.
    *   Generate personalized exercises.
    *   Offer query optimization advice.

## API Endpoints

*   `/api/exercices`:
    *   `GET`: Retrieve all exercises.
    *   `POST`: Create a new exercise.
*   `/api/exercices/{id}`:
    *   `GET`: Retrieve a specific exercise by ID.
    *   `PUT`: Update an existing exercise.
    *   `DELETE`: Delete an exercise.
*   `/api/exercices/{id}/soumissions`:
    *   `GET`: Retrieve all submissions for a specific exercise.
*   `/api/auth/[...nextauth]`:
    *   Handles authentication using NextAuth.js.

## Deployment

This project is designed to be deployed on platforms that support Node.js and Next.js applications. Here are some options:

*   Vercel: A popular choice for deploying Next.js applications.
*   Netlify: Another excellent option for deploying web applications.
*   AWS: Deploy on EC2 or use serverless functions with Lambda.
*   DigitalOcean: Deploy on Droplets or App Platform.
*   Heroku: A platform as a service (PaaS) that supports Node.js.

## Contributing

We welcome contributions to SQL Mastery! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Push your branch to your fork.
5.  Submit a pull request.

## License

MIT License
