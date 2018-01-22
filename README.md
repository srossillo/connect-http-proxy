# connect-http-proxy

A simple HTTP/HTTPS proxy for Express/Connect based applications.

## Install

    npm i --save connect-http-proxy

## Usage

    const express = require("express");
    const HttpProxy = require("./index");
    const app = express();
    const proxy = new HttpProxy({ hostname: "example.com" });

    app.use("/proxy", proxy.handle());

## Configuration options

* protocol: <string> Protocol to use. Defaults to http:.
* hostname: <string> A domain name or IP address of the server to proxy the requests to.
* port <number> Port of remote server. Defaults to 80.
* timeout <number>: A number specifying the socket timeout in milliseconds. This will set the timeout before the socket is connected.

### HTTPS

To proxy an HTTPS host, simply set the protocol to `https:`

    const proxy = new HttpProxy({
        hostname: "example.com",
        protocol: "https:"
    });
