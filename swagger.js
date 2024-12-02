import swaggerAutogen from "swagger-autogen";

const doc = {
    openapi: "3.0.0",
    info: {
        title: "ShiftMate API with Swagger",
        version: "0.0.1",
        description: "shiftmate API"
    },
    host: "localhost:3080",
    servers: [
        {
            url: "http://localhost:3080"
        }
    ],
    tags: [
        {
            name: '근무표'
        }
    ]
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./BE/myapp/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
