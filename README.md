# Reverse Proxy

This repository contains a simple implementation of a Reverse Proxy in Node.js. A Reverse Proxy acts as an intermediary for requests from clients seeking resources from other servers. It forwards client requests to backend servers and sends the response back to the client.

This reverse proxy is useful for load balancing, enhancing security, hiding internal server details, and improving performance by caching responses.


## Prerequisites

- [Node.js](https://nodejs.org) (v12 or higher)
- [pnpm](https://pnpm.io) (Preferred Node package manager)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rohitxdd/reverse-proxy.git
   ```

2. Navigate into the project directory:

   ```bash
   cd reverse-proxy
   ```

3. Install dependencies using `pnpm`:

   ```bash
   pnpm install
   ```

## Development

To run the project in development mode with hot-reloading, use the following:

```bash
pnpm run dev
```

This will start the server with `nodemon`, automatically restarting the server on changes.


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -am 'Add feature-name'`)
4. Push to your branch (`git push origin feature-name`)
5. Create a new Pull Request