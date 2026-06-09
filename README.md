# TodoApp

Full-stack todo application with user authentication, categories, filtering, pagination, and task completion tracking.

## Stack

- Backend: ASP.NET Core 8, Entity Framework Core, ASP.NET Identity, JWT auth
- Database: PostgreSQL
- Frontend: Angular 21, RxJS, Tailwind CSS

## Project Structure

```text
TodoApp.API/        ASP.NET Core Web API
TodoApp.ClientApp/  Angular client
```

## Requirements

- .NET SDK 8+
- Node.js and npm
- PostgreSQL database

## Configuration

Create `TodoApp.API/appsettings.Development.json` locally:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=todo_db;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Key": "replace-with-a-long-random-secret-key"
  }
}
```

`appsettings.Development.json` is ignored by git because it can contain secrets.

## Run Backend

```bash
cd TodoApp.API
dotnet restore
dotnet run
```

The API runs with Swagger enabled in development. The app applies EF Core migrations on startup.

## Run Frontend

```bash
cd TodoApp.ClientApp
npm install
npm start
```

Open `http://localhost:4200`.

## Build

Backend:

```bash
dotnet build TodoApp.API/TodoApp.API.csproj
```

Frontend:

```bash
cd TodoApp.ClientApp
npm run build
```

## Notes

- Registering creates a user and returns a JWT, so the client logs in automatically.
- Tasks can be created, edited, deleted, filtered by category, and toggled complete.
- Categories show task counts and can be deleted without deleting their tasks.
