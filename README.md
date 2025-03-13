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
cd clearia
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

### 7️⃣ Push Database Schema
```sh
npm run db:push
```

### 8️⃣ Set Up Environment Variables
Copy the example `.env.example` file and create a `.env` file:
```sh
cp .env.example .env
```
Modify `.env` with your database credentials and other necessary configurations.

### 9️⃣ Start the Development Server
```sh
npm run dev
```
The app should now be running locally!

## 🎯 Contributing
1. Create a new branch for your feature.
2. Make changes and commit them.
3. Push to your fork and create a pull request.

## 🛠️ Tech Stack
- **Node.js**
- **Prisma** (Database ORM)
- **PostgreSQL** (Database)
- **Docker** (Containerization)

Happy coding! 🚀


