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
const BackendApp = require("./fixtures/backend");
const App = require("./fixtures/app");
const HttpProxy = require("../index");
const test = require("blue-tape");
const fetch = require("node-fetch");
const FormData = require("form-data");

let backend;
let app;

test("setup", (t) => {
    backend = new BackendApp();
    app = new App(new HttpProxy({
        hostname: "localhost",
        protocol: "http:",
        port: backend.port
    }));
    t.end();
});

test("Should proxy a get route", (t) => {
    t.plan(1);
    return fetch(`http://localhost:${app.port}/proxy/foo`)
        .then(res => res.json())
        .then((body) => {
            t.equal(body.message, "foobar");
        })
        .catch((err) => {
            t.fail(err);
        });
});

test("Should proxy get with query string", (t) => {
    t.plan(2);
    const foo = "aFoo";
    const bar = "aBar";
    return fetch(`http://localhost:${app.port}/proxy/query?foo=${foo}&bar=${bar}`)
        .then(res => res.json())
        .then((body) => {
            t.equal(body.foo, foo);
            t.equal(body.bar, bar);
        })
        .catch((err) => {
            t.fail(err);
        });
});

test("Should proxy post with mutlipart form data", (t) => {
    t.plan(2);
    const form = new FormData();
    const foo = "aFoo";
    const bar = "aBar";

    form.append("foo", foo);
    form.append("bar", bar);

    return fetch(`http://localhost:${app.port}/proxy/multipart-form-upload`, {
        method: "POST",
        body: form,
        headers: form.getHeaders()
    })
        .then(res => res.json())
        .then((body) => {
            t.equal(body.foo, foo, "Posted field foo should be echoed back");
            t.equal(body.bar, bar, "Posted field bar should be echoed back");
        })
        .catch((err) => {
            t.fail(err);
        });
});

test("Should proxy post with url-encoded form data", (t) => {
    t.plan(2);
    const foo = "aFoo";
    const bar = "aBar";
    const form = `foo=${foo}&bar=${bar}`;

    return fetch(`http://localhost:${app.port}/proxy/urlencoded-form-upload`, {
        method: "POST",
        body: form,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.from(form).length
        }
    })
        .then(res => res.json())
        .then((body) => {
            t.equal(body.foo, foo, "Posted field foo should be echoed back");
            t.equal(body.bar, bar, "Posted field bar should be echoed back");
        })
        .catch((err) => {
            t.fail(err);
        });
});

test("Should handle upstream hangup", (t) => {
    t.plan(2);
    return fetch(`http://localhost:${app.port}/proxy/file`)
        .then((res) => {
            t.equal(502, res.status);
            return res.json();
        })
        .then((body) => {
            t.equal("socket hang up", body.error, "Expected socket hang up");
        })
        .catch((err) => {
            t.fail(err);
        });
});

test("teardown", (t) => {
    backend.close();
    app.close();
    t.end();
});
