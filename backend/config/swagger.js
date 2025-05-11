import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

// Đảm bảo lấy đúng __dirname khi dùng ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "My Movie API",
			version: "1.0.0",
			description: "API documentation for movie streaming backend",
		},
		servers: [
			{
				url: "http://localhost:5000/api/v1",
			},
		],
		components: {
			securitySchemes: {
				cookieAuth: {
				type: "apiKey",
				in: "cookie",
				name: "jwt-netflix",
				},
			},
		},
	},
	// Đường dẫn tuyệt đối tới routes
	apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
	console.log("Swagger loaded with paths:", Object.keys(swaggerSpec.paths)); // 🐞 Debug
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
