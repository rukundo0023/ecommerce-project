import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description:
        "E-commerce backend API built with Express, TypeScript, MongoDB and Mongoose. Register or log in to receive a bearer token for product endpoints.",
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "Token",
        },
      },
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
      {
        url: "https://ecommerce-project-123.onrender.com/",
        description: "Production server",
      },
    ],
  },

  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;