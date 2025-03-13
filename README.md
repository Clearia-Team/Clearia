# Clearia

A web application powered by PostgreSQL, Prisma, and Docker.

## 🚀 Getting Started

Follow these steps to set up the project for development.

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/ParichayeGrover/Clearia.git
```

### 2️⃣ Fork the Repository
Go to your GitHub account and fork the repository for your own development.

### 3️⃣ Create a Feature Branch
```sh
git checkout -b feature-branch-name
```

### 4️⃣ Navigate to the Project Directory
```sh
cd Clearia/clearia
```

### 5️⃣ Install Dependencies
```sh
npm install
```

### 6️⃣ Set Up the Database
Run the script to start a Docker container with PostgreSQL:
```sh
./start-database.sh
```

### 7️⃣ Set Up Environment Variables
Copy the example `.env.example` file and create a `.env` file:
```sh
cp .env.example .env
```

### 8️⃣ Push Database Schema
```sh
npm run db:push
```

Modify `.env` with your database credentials and other necessary configurations.

### 9️⃣ Start the Development Server
```sh
npm run dev
```
The app should now be running locally!

## Syncing Changes with the Original Repo
To fetch the latest changes from the original repository, do the following:
```sh
git switch main
git remote add upstream https://github.com/ParichayeGrover/Clearia.git
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

## Contributing
1. Create a branch: `git checkout -b feature-branch`
2. Make your changes and commit them: `git commit -m "Description of changes"`
3. Push to your fork: `git push origin feature-branch`
4. Open a Pull Request on GitHub


Happy coding! 🚀


