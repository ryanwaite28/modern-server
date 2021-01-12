
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import * as path from 'path';

import socket_io from 'socket.io';

import * as http from 'http';

import client_sessions from 'client-sessions';
// @ts-ignore
import express_device from 'express-device';

import express_fileupload from 'express-fileupload';

import * as body_parser from 'body-parser';

import { installExpressApp } from './template-engine';
import { IRequest } from './interfaces/all.interface';
import { MainRouter } from './routers/_main.router';
import { EVENT_TYPES, whitelist_domains } from './chamber';
import { db_init } from './models/_init.model';

/** Setup */

const PORT: string | number = process.env.PORT || 6700;
const app: express.Application = express();

installExpressApp(app);

app.use(express_fileupload({ safeFileNames: true, preserveExtension: true }));
app.use(express_device.capture());
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));
app.use(client_sessions({
  cookieName: 'session',
  secret: process.env.APP_SECRET!,
  duration: 7 * 60 * 60 * 1000,
  activeDuration: 2 * 5 * 60 * 1000,
  cookie: {
	  httpOnly: false,
	  secure: false,
  }
}));

const server: http.Server = http.createServer(app);
const io: socket_io.Server = socket_io(server);

io.on('connection', (socket: socket_io.Socket) => {
  console.log('new socket:');
  // console.log('socket handshake:', socket.handshake);

  const originIsAllowed = whitelist_domains.includes(socket.handshake.headers.origin);

  /** Global IO events */

  if (originIsAllowed) {
    console.log(`socket connection is valid`);
    socket.on(EVENT_TYPES.MESSAGE_TYPING, (data) => {
      io.emit(`${EVENT_TYPES.MESSAGE_TYPING}:from-${data.from_id}-to-${data.to_id}`, data);
    });
  
    socket.on(EVENT_TYPES.MESSAGE_TYPING_STOPPED, (data) => {
      io.emit(`${EVENT_TYPES.MESSAGE_TYPING_STOPPED}:from-${data.from_id}-to-${data.to_id}`, data);
    });
  
    socket.on(EVENT_TYPES.CONVERSATION_MESSAGE_TYPING, (data) => {
      io.emit(`${EVENT_TYPES.CONVERSATION_MESSAGE_TYPING}:conversation-${data.conversation_id}`, data);
    });
  
    socket.on(EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED, (data) => {
      io.emit(`${EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED}:conversation-${data.conversation_id}`, data);
    });
  } else {
    console.log(`origin "${socket.handshake.headers.origin}" is not allowed`);
  }

  /** end */
});

app.use((
  request: express.Request, 
  response: express.Response, 
  next: express.NextFunction
) => {
  (<IRequest> request).io = io;
  next();
});

/** Mount Sub-Routers to Main Application */

app.use('/main', MainRouter);

/** Static file declaration */

const publicPath = path.join(__dirname, '../_public');
const expressStaticPublicPath = express.static(publicPath);
app.use(expressStaticPublicPath);

/** init database */

db_init();

/** Start Server */

server.listen(PORT);
console.log(`Listening on port ${PORT}...`);
