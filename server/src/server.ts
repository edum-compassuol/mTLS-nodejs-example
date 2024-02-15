import fs from 'fs'
import http from 'http'
import https from 'https'
import express from 'express'
import axios from 'axios';
import { Router, Request, Response } from 'express'
import dotenv from 'dotenv'

const app = express()
const route = Router()
dotenv.config({ path: `.env.${process.env.NODE_ENV}`});

const hostname = String(process.env.SERVER_HOSTNAME)
const port = Number(process.env.SERVER_HTTP_PORT)
const portSsl = Number(process.env.SERVER_HTTPS_PORT)
const portMTLS = Number(process.env.SERVER_MTLS_PORT)
const ca = String(process.env.SERVER_CA)
const serverCert = String(process.env.SERVER_CERT)
const serverCertSigned = String(process.env.SERVER_CERT_SIGNED)
const serverKey = String(process.env.SERVER_CERT_KEY)

type Message = {
  message: string;
  secure: boolean;
}

const config = {
  headers: {
    Accept:'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    ca: fs.readFileSync(ca),
    cert: fs.readFileSync(serverCertSigned),
    key: fs.readFileSync(serverKey),
  })
}

app.use(express.json())

route.get('/health', (req: Request, res: Response) => {
  console.log("Health Check: Status UP")
  res.json({ status: `up`})
})

route.get('/pong', (req: Request, res: Response) => {
  console.log("Ping received" )
  res.json({ message: `Pong from ${req.headers.host}`, secure: req.secure })
})

route.get('/ping', async (req: Request, res: Response) => {
  try {
    const url = getURL(String(req.headers.host), String(req.protocol));
    const {data, status} = await axios.get<Message>(url, config);
    console.log(JSON.stringify(data, null, 4));
    console.log('response status is: ', status);
    return res.json(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('error message: ', error.message);
      return error.message;
    } else {
      console.log('unexpected error: ', error);
      return 'An unexpected error occurred';
    }
  }
});

function getURL(host: string, protocol:string) {
  if (protocol === 'https') {
    var reqPort = host.substring(host.lastIndexOf(':') + 1);
    if (reqPort === process.env.SERVER_MTLS_PORT) {
      return mountURL(String(process.env.CLIENT_MTLS_PORT), protocol);
    } else {
      return mountURL(String(process.env.CLIENT_HTTPS_PORT), protocol);
    }
  } else {
    return mountURL(String(process.env.CLIENT_HTTP_PORT), protocol);
  }
}

function mountURL(reqPort:string, protocol:string) {
  return `${protocol}://${process.env.CLIENT_HOSTNAME}:${reqPort}/pong`;
}

app.use(route)

const options = { 
  cert: fs.readFileSync(serverCert), 
  key: fs.readFileSync(serverKey), 
  rejectUnauthorized: true,
  requestCert: false, 
}

const optionsMTLS = { 
  ca: fs.readFileSync(ca), 
  cert: fs.readFileSync(serverCertSigned),
  key: fs.readFileSync(serverKey), 
  rejectUnauthorized: true,
  requestCert: true, 
}

http.createServer(app).listen(port, hostname, () => {
  console.log(`Server running at port ${port} on ${hostname}`);
})

https.createServer(options, app).listen(portSsl, hostname, () => {
  console.log(`Server running at port ${portSsl} on ${hostname}`);
})

https.createServer(optionsMTLS, app).listen(portMTLS, hostname, () => {
  console.log(`Server running at port ${portMTLS} on ${hostname}`);
})