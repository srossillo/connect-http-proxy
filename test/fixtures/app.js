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
const logger = require("pino")("app");

function App(proxy) {
    const app = express();
    const server = app.listen(0);
    const errorHandler = (err, req, res, _) => {
        if (res.headersSent) {
            res.end();
        }
        res.status(502).json({ error: err.message });
    };

    enableDestroy(server);

    this.close = () => {
        server.close();
    };

    this.destroy = () => {
        server.destroy();
    };

    this.port = server.address().port;

    this.address = `http://localhost:${this.port}`;

    app.use("/proxy", proxy.handle(), errorHandler);

    logger.info("App listening at http://localhost:%s", this.port);

    app.use("*", (req, res) => {
        res.status(404).end("Not found");
    });
}

module.exports = App;
