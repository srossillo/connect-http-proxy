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
const http = require("http");
const https = require("https");
const defaultLogger = require("./lib/logger");

class HttpProxy {
    constructor(config, logger) {
        this.logger = logger || defaultLogger;
        this.http = config.protocol === "https:" ? https : http;
        this.agent = this.createAgent();
        this.options = {
            agent: this.agent,
            protocol: config.protocol,
            hostname: config.hostname,
            port: config.port
        };
    }

    createAgent() {
        const agent = new this.http.Agent({
            keepAlive: true,
            maxSockets: 50
        });
        this.logger.debug(`Created agent: ${agent}`);
        return agent;
    }

    createProxyUrl(req) {
        return req.url;
    }

    copyRequestHeaders(req, proxyReq) {
        Object.keys(req.headers).forEach((k) => {
            proxyReq.setHeader(k, req.header(k));
        });
        return this;
    }

    copyResponseHeaders(res, headers) {
        res.set(headers);
    }

    processRequestHeaders() {
    }

    filterResponseHeaders(req, headers) {
        return headers;
    }

    handle() {
        return ((req, res, next) => {
            this.logger.info(`Proxying ${req.url}`);

            const options = Object.assign({}, this.options, {
                path: this.createProxyUrl(req),
                method: req.method
            });

            const proxyReq = this.http.request(options, (proxyRes) => {
                res.status(proxyRes.statusCode);
                this.copyResponseHeaders(
                    res,
                    this.filterResponseHeaders(req, proxyRes.headers)
                );
                proxyRes.pipe(res, {
                    end: true
                });
            });

            proxyReq.once("timeout", () => {
                next(new Error(`Upstream timeout for ${req.url}`));
            });

            proxyReq.once("error", (err) => {
                next(err);
            });

            this.copyRequestHeaders(req, proxyReq);
            this.processRequestHeaders(req, proxyReq);
            req.pipe(proxyReq, {
                end: true
            });
        });
    }
}

module.exports = HttpProxy;
