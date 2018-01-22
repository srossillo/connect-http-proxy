/*
 * Copyright 2017 Scott Rossillo. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
const express = require("express");
const enableDestroy = require("server-destroy");
const logger = require("pino")("backend-app");
const bodyParser = require("body-parser");
const multer = require("multer");

const formUpload = multer();

function BackendApp() {
    const app = express();
    const server = app.listen(0);

    enableDestroy(server);

    this.close = () => {
        server.close();
    };

    this.destroy = () => {
        server.destroy();
    };

    this.port = server.address().port;

    this.address = `http://localhost:${this.port}`;

    logger.info("Backend app listening at http://localhost:%s", this.port);

    app.get("/foo", (req, res) => {
        res.status(200);
        res.json({
            message: "foobar"
        });
    });

    app.get("/query", (req, res) => {
        res.status(200);
        res.json(req.query);
    });

    app.get("/file", (req, res) => {
        res.connection.destroy();
    });

    app.post("/multipart-form-upload", formUpload.array(), (req, res) => {
        res.status(200);
        res.json(req.body);
    });

    app.post("/urlencoded-form-upload", bodyParser.urlencoded({ extended: true }), (req, res) => {
        res.status(200);
        res.json(req.body);
    });

    app.post("/json-form-upload", bodyParser.json(), (req, res) => {
        res.status(200);
        res.json(req.body);
    });

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
}

module.exports = BackendApp;
