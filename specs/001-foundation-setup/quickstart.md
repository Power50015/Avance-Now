# Quick Start Guide

## Prerequisites

Before you begin, ensure you have installed:
- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Node.js](https://nodejs.org/) (version 20 LTS)
- [Git](https://git-scm.com/)

## Getting Started

Follow these steps to set up the avance-now development environment:

### 1. Initialize the Project

```bash
mkdir avance-now
cd avance-now
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root based on the example:

```bash
cp .env.example .env
```

Edit the `.env` file to configure your environment:
- API ports
- Security secrets (in development, you can use the provided defaults)
- Environment-specific variables

### 4. Start the Development Stack

```bash
npm run dev
```

This will start all services defined in `docker-compose.yml`:
- (Optional) Redis cache if configured
- Application server (Fastify)

### 5. Verify the Setup

Once all services are healthy, you can verify the setup:

#### Health Check
```bash
curl http://localhost:3000/health
```
Should return a JSON response indicating the server is operational.

#### API Documentation
Visit `http://localhost:3000/api/docs` to view the automatically generated OpenAPI documentation.

## Development Workflow

### Making Changes
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run tests: `npm test`
4. Lint your code: `npm run lint`
5. Format your code: `npm run format`
6. Commit your changes: `git commit -m "Description of changes"`
7. Push to remote: `git push origin feature/your-feature-name`
8. Open a pull request

### Available Scripts
- `npm run dev` - Start development stack
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run build` - Build for production
- `npm start` - Start production server

## Troubleshooting

### Common Issues

**Docker not found**: Ensure Docker is installed and running. On Windows/Mac, start Docker Desktop.

**Port already in use**: Change the port in `.env` or stop the conflicting service.

**Health check failing**:
- Check application logs: `docker logs avance-now-backend`
- Verify all required environment variables are set
- Look for configuration validation errors

## Next Steps

Once the foundation setup is complete, you can proceed with:
1. Implementing authentication core (Phase 2)
2. Building the RBAC system (Phase 3)
3. Developing the hook engine (Phase 4)
4. Creating the UI foundation (Phase 5)

Refer to the implementation plan in `plan.md` for detailed phase breakdowns.

## Support

If you encounter issues not covered in this guide:
1. Check the troubleshooting section above
2. Review the logs of the failing service
3. Consult the [documentation](./docs/)
4. Contact the development team