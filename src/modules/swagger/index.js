import express, {Router} from 'express';
import path from 'path';

export default class Swagger {

    constructor(app) {
        this.app = app;


        this.errorHandler = this.errorHandler.bind(this);
        this.responseHandler = this.responseHandler.bind(this);
        this.setup = this.setup.bind(this)
        this.createSwaggerJson = this.createSwaggerJson.bind(this)
        this.render = this.render.bind(this);
        this.setup();
    }

    setup() {

        let app = this.app;

        let pathDir = path.join(app.get('root'), 'modules', 'swagger', 'public');


        let router = this.app.get('router');

        let _this = this;

        app.use('/explorer/public', express.static(pathDir));

        router.get('/explorer', (req, res) => {
            return res.send(_this.render());
        });

        router.get('/explorer/swagger.json', (req, res) => {
            return _this.responseHandler(res, this.createSwaggerJson());
        });


    }

    createSwaggerJson() {

        let data = {
            swagger: "2.0",
            info: {
                "description": "Tabvn ES6 Redis Restful service.",
                "version": "1.0.0",
                "title": "Tabvn ES6 Redis Restful API"
            },
            host: "0.0.0.0:8080",
            basePath: "/api",
            schemes: [
                "http"
            ],
            paths: {
                "/pet": {
                    post: {
                        tags: [
                            "pet"
                        ],
                        summary: "Add a new pet to the store",
                        description: "",
                        operationId: "addPet",
                        consumes: [
                            "application/json"
                        ],
                        produces: [
                            "application/json"
                        ],
                        parameters: [
                            {
                                "in": "body",
                                "name": "body",
                                "description": "Pet object that needs to be added to the store",
                                "required": true,
                                "schema": {
                                    "$ref": "#/definitions/Pet"
                                }
                            }
                        ],
                        responses: {
                            "405": {
                                description: "Invalid input"
                            }
                        },
                        security: [
                            {
                                api_key: []
                            }
                        ]
                    }
                },
                "/users/login": {
                    post: {
                        "tags": [
                            "pet"
                        ],
                        "summary": "User login",
                        "description": "",
                        "operationId": "userLogin",
                        "consumes": [
                            "application/json"
                        ],
                        "produces": [
                            "application/json"
                        ],
                        "parameters": [
                            {
                                "in": "body",
                                "name": "body",
                                "description": "User Object",
                                "required": true,
                                "schema": {
                                    "$ref": "#/definitions/Pet"
                                }
                            }
                        ],
                        "responses": {
                            "405": {
                                "description": "Invalid input"
                            }
                        },
                        "security": [
                            {
                                "api_key": []
                            }
                        ]
                    }
                },
                "/pet/findByStatus": {
                    "get": {
                        "tags": [
                            "pet"
                        ],
                        "summary": "Finds Pets by status",
                        "description": "Multiple status values can be provided with comma separated strings",
                        "operationId": "findPetsByStatus",
                        "produces": [
                            "application/xml",
                            "application/json"
                        ],
                        "parameters": [
                            {
                                "name": "status",
                                "in": "query",
                                "description": "Status values that need to be considered for filter",
                                "required": true,
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "enum": [
                                        "available",
                                        "pending",
                                        "sold"
                                    ],
                                    "default": "available"
                                },
                                "collectionFormat": "multi"
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "successful operation",
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/definitions/Pet"
                                    }
                                }
                            },
                            "400": {
                                "description": "Invalid status value"
                            }
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets"
                                ]
                            }
                        ]
                    }
                },
                "/pet/{id}": {
                    "get": {
                        "tags": [
                            "pet"
                        ],
                        "summary": "Find pet by ID",
                        "description": "Returns a single pet",
                        "operationId": "getPetById",
                        "produces": [
                            "application/xml",
                            "application/json"
                        ],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "description": "ID of pet to return",
                                "required": true,
                                "type": "integer",
                                "format": "int64"
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "successful operation",
                                "schema": {
                                    "$ref": "#/definitions/Pet"
                                }
                            },
                            "400": {
                                "description": "Invalid ID supplied"
                            },
                            "404": {
                                "description": "Pet not found"
                            }
                        },
                        "security": [
                            {
                                "api_key": []
                            }
                        ]
                    },
                    "post": {
                        "tags": [
                            "pet"
                        ],
                        "summary": "Updates a pet in the store with form data",
                        "description": "",
                        "operationId": "updatePetWithForm",
                        "consumes": [
                            "application/x-www-form-urlencoded"
                        ],
                        "produces": [
                            "application/xml",
                            "application/json"
                        ],
                        "parameters": [
                            {
                                "name": "petId",
                                "in": "path",
                                "description": "ID of pet that needs to be updated",
                                "required": true,
                                "type": "integer",
                                "format": "int64"
                            },
                            {
                                "name": "name",
                                "in": "formData",
                                "description": "Updated name of the pet",
                                "required": false,
                                "type": "string"
                            },
                            {
                                "name": "status",
                                "in": "formData",
                                "description": "Updated status of the pet",
                                "required": false,
                                "type": "string"
                            }
                        ],
                        "responses": {
                            "405": {
                                "description": "Invalid input"
                            }
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets"
                                ]
                            }
                        ]
                    },
                    "delete": {
                        "tags": [
                            "pet"
                        ],
                        "summary": "Deletes a pet",
                        "description": "",
                        "operationId": "deletePet",
                        "produces": [
                            "application/xml",
                            "application/json"
                        ],
                        "parameters": [
                            {
                                "name": "api_key",
                                "in": "header",
                                "required": false,
                                "type": "string"
                            },
                            {
                                "name": "petId",
                                "in": "path",
                                "description": "Pet id to delete",
                                "required": true,
                                "type": "integer",
                                "format": "int64"
                            }
                        ],
                        "responses": {
                            "400": {
                                "description": "Invalid ID supplied"
                            },
                            "404": {
                                "description": "Pet not found"
                            }
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets"
                                ]
                            }
                        ]
                    }
                },
                "/pet/{petId}/uploadImage": {
                    "post": {
                        "tags": [
                            "pet"
                        ],
                        "summary": "uploads an image",
                        "description": "",
                        "operationId": "uploadFile",
                        "consumes": [
                            "multipart/form-data"
                        ],
                        "produces": [
                            "application/json"
                        ],
                        "parameters": [
                            {
                                "name": "petId",
                                "in": "path",
                                "description": "ID of pet to update",
                                "required": true,
                                "type": "integer",
                                "format": "int64"
                            },
                            {
                                "name": "additionalMetadata",
                                "in": "formData",
                                "description": "Additional data to pass to server",
                                "required": false,
                                "type": "string"
                            },
                            {
                                "name": "file",
                                "in": "formData",
                                "description": "file to upload",
                                "required": false,
                                "type": "file"
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "successful operation",
                                "schema": {
                                    "$ref": "#/definitions/ApiResponse"
                                }
                            }
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets"
                                ]
                            }
                        ]
                    }
                }
            },
            "securityDefinitions": {
                "api_key": {
                    "type": "apiKey",
                    "name": "Authorization",
                    "in": "header"
                }
            },
            "definitions": {
                "User": {
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "integer",
                            "format": "int64"
                        },
                        "username": {
                            "type": "string"
                        },
                        "firstName": {
                            "type": "string"
                        },
                        "lastName": {
                            "type": "string"
                        },
                        "email": {
                            "type": "string"
                        },
                        "password": {
                            "type": "string"
                        },
                        "phone": {
                            "type": "string"
                        },
                        "userStatus": {
                            "type": "integer",
                            "format": "int32",
                            "description": "User Status"
                        }
                    },
                    "xml": {
                        "name": "User"
                    }
                },
                "ApiResponse": {
                    "type": "object",
                    "properties": {
                        "code": {
                            "type": "integer",
                            "format": "int32"
                        },
                        "type": {
                            "type": "string"
                        },
                        "message": {
                            "type": "string"
                        }
                    }
                }
            }
        };


        return data;
    }

    errorHandler(res, err, code = 500) {
        return res.status(code).json({error: err})
    }

    responseHandler(res, data, code = 200) {
        return res.status(code).json(data);
    }

    render() {


        let config = this.app.get('config');

        let explorerURL = 'http://' + config.url + 'explorer/';

        return '<!DOCTYPE html>\n' +
            '<html lang="en">\n' +
            '<head>\n' +
            '    <meta charset="UTF-8">\n' +
            '    <title>Explorer</title>\n' +
            '    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700|Source+Code+Pro:300,600|Titillium+Web:400,600,700"\n' +
            '          rel="stylesheet">\n' +
            '    <link rel="stylesheet" type="text/css" href="./public/swagger-ui.css">\n' +
            '    <link rel="icon" type="image/png" href="./public/favicon-32x32.png" sizes="32x32"/>\n' +
            '    <link rel="icon" type="image/png" href="./public/favicon-16x16.png" sizes="16x16"/>\n' +
            '    <style>\n' +
            '        html {\n' +
            '            box-sizing: border-box;\n' +
            '            overflow: -moz-scrollbars-vertical;\n' +
            '            overflow-y: scroll;\n' +
            '        }\n' +
            '\n' +
            '        *,\n' +
            '        *:before,\n' +
            '        *:after {\n' +
            '            box-sizing: inherit;\n' +
            '        }\n' +
            '\n' +
            '        body {\n' +
            '            margin: 0;\n' +
            '            background: #fafafa;\n' +
            '        }\n' +
            '\n' +
            '        .download-url-wrapper, .information-container {\n' +
            '            display: none !important;\n' +
            '        }\n' +
            '    </style>\n' +
            '</head>\n' +
            '\n' +
            '<body>\n' +
            '\n' +
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"\n' +
            '     style="position:absolute;width:0;height:0">\n' +
            '    <defs>\n' +
            '        <symbol viewBox="0 0 20 20" id="unlocked">\n' +
            '            <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z"></path>\n' +
            '        </symbol>\n' +
            '\n' +
            '        <symbol viewBox="0 0 20 20" id="locked">\n' +
            '            <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8zM12 8H8V5.199C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8z"/>\n' +
            '        </symbol>\n' +
            '\n' +
            '        <symbol viewBox="0 0 20 20" id="close">\n' +
            '            <path d="M14.348 14.849c-.469.469-1.229.469-1.697 0L10 11.819l-2.651 3.029c-.469.469-1.229.469-1.697 0-.469-.469-.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-.469-.469-.469-1.228 0-1.697.469-.469 1.228-.469 1.697 0L10 8.183l2.651-3.031c.469-.469 1.228-.469 1.697 0 .469.469.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c.469.469.469 1.229 0 1.698z"/>\n' +
            '        </symbol>\n' +
            '\n' +
            '        <symbol viewBox="0 0 20 20" id="large-arrow">\n' +
            '            <path d="M13.25 10L6.109 2.58c-.268-.27-.268-.707 0-.979.268-.27.701-.27.969 0l7.83 7.908c.268.271.268.709 0 .979l-7.83 7.908c-.268.271-.701.27-.969 0-.268-.269-.268-.707 0-.979L13.25 10z"/>\n' +
            '        </symbol>\n' +
            '\n' +
            '        <symbol viewBox="0 0 20 20" id="large-arrow-down">\n' +
            '            <path d="M17.418 6.109c.272-.268.709-.268.979 0s.271.701 0 .969l-7.908 7.83c-.27.268-.707.268-.979 0l-7.908-7.83c-.27-.268-.27-.701 0-.969.271-.268.709-.268.979 0L10 13.25l7.418-7.141z"/>\n' +
            '        </symbol>\n' +
            '\n' +
            '\n' +
            '        <symbol viewBox="0 0 24 24" id="jump-to">\n' +
            '            <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>\n' +
            '        </symbol>\n' +
            '\n' +
            '        <symbol viewBox="0 0 24 24" id="expand">\n' +
            '            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>\n' +
            '        </symbol>\n' +
            '\n' +
            '    </defs>\n' +
            '</svg>\n' +
            '\n' +
            '<div id="swagger-ui"></div>\n' +
            '\n' +
            '<script src="./public/swagger-ui-bundle.js"></script>\n' +
            '<script src="./public/swagger-ui-standalone-preset.js"></script>\n' +
            '<script>\n' +
            '    window.onload = function () {\n' +
            '\n' +
            '        // Build a system\n' +
            '        const ui = SwaggerUIBundle({\n' +
            '            url: "' + explorerURL + 'swagger.json",\n' +
            '            dom_id: \'#swagger-ui\',\n' +
            '            deepLinking: true,\n' +
            '            presets: [\n' +
            '                SwaggerUIBundle.presets.apis,\n' +
            '                SwaggerUIStandalonePreset\n' +
            '            ],\n' +
            '            plugins: [\n' +
            '                SwaggerUIBundle.plugins.DownloadUrl\n' +
            '            ],\n' +
            '            layout: "StandaloneLayout"\n' +
            '        });\n' +
            '        window.ui = ui\n' +
            '    }\n' +
            '</script>\n' +
            '</body>\n' +
            '\n' +
            '</html>\n'
    }
}