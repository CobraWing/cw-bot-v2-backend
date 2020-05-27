# Cobra Wing bot V2.0 - Work in progress

## 📌 Requirements and tips:

- [Node.js 12+](https://nodejs.org/en/)
- [Yarn 1.22+](https://yarnpkg.com/)
- [Docker](https://docs.docker.com/docker-for-windows/install/)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscod)
- [My VSCode settings.json](https://gist.github.com/rafaelpivatto/b4d77ca681941d68ceed6f1c7ca12c3f)

### 🐳 Docker for Postgres database

Docker image and run

```bash
docker run --name cobrawing -e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```

### To start:

```bash
# Install node dependencies
yarn

# Run migrations
yarn typeorm migration:run

# Run in development mode
yarn dev:server
```

## 🤓 Dev support stuffs...

### Migration commands:

| Command                                           | Description                     |
| ------------------------------------------------- | ------------------------------- |
| yarn typeorm migration:create -n <migration_name> | To create a new migration       |
| yarn typeorm migration:show                       | To show all migrations executed |
| yarn typeorm migration:revert                     | To revert migration             |
