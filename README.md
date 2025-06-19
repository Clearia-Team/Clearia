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
npm run db push
// for remote on supabase
npx prisma generate
npx prisma migrate dev   # Or `npx prisma db pull` if schema is already live

```

Modify `.env` with your database credentials and other necessary configurations.

### 9️⃣ Start the Development Server
```sh
npm run dev
```
The app should now be running locally!


## Syncing Changes from the Original Repository
To keep your fork up to date with the original repository, follow these steps:

### 1. Switch to `main`
```sh
git switch main  # or `git checkout main`
```

### 2. Add the Original Repository as Upstream (if not already added)
```sh
git remote add upstream https://github.com/ParichayeGrover/Clearia.git
```

### 3. Fetch and Merge Latest Changes
```sh
git fetch upstream
git merge upstream/main  # or `git rebase upstream/main` for a cleaner history
```

### 4. Push the Updated `main` to Your Fork
```sh
git push origin main
```

### 5. Sync Your Feature Branch with the Updated `main`
```sh
git switch your-branch-name  # Switch to your branch
git merge main  # Merge latest changes into your branch
```
Alternatively, for a cleaner commit history, use rebase:
```sh
git rebase main
```

### 6. Push the Updated Branch (If Needed)
```sh
git push origin your-branch-name
```
If you rebased, you may need to force push:
```sh
git push --force origin your-branch-name
```

Now your feature branch includes the latest updates from the original repository!

## Contributing
1. Create a branch: `git checkout -b feature-branch`
2. Make your changes and commit them: `git commit -m "Description of changes"`
3. Push to your fork: `git push origin feature-branch`
4. Open a Pull Request on GitHub


Happy coding! 🚀


