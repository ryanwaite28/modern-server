
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import * as path from 'path';
import { Server } from "socket.io";
import { ExpressPeerServer } from 'peer';
import * as http from 'http';

// @ts-ignore
import express_device from 'express-device';
import express_fileupload from 'express-fileupload';
import * as body_parser from 'body-parser';
import * as cookie_parser from 'cookie-parser';

// import { v1 as uuidv1 } from 'uuid';
import { installExpressApp } from './template-engine';
import { IRequest } from './apps/_common/interfaces/common.interface';
import { db_init } from './apps/_common/models/_init.model';
import { SocketsService } from './apps/_common/services/sockets.service';
import { AppsRouter } from './apps/apps.router';
import { corsMiddleware, uniqueValue, whitelist_domains } from './apps/_common/common.chamber';

/** Setup */

const PORT: string | number = process.env.PORT || 6700;
const app: express.Application = express();

installExpressApp(app);

app.use(express_fileupload({ safeFileNames: true, preserveExtension: true }));
app.use(express_device.capture());
app.use(cookie_parser.default());
app.use(body_parser.urlencoded({ extended: false }));
app.set('trust proxy', true);

const appServer: http.Server = http.createServer(app);

// const peerServer = ExpressPeerServer(appServer, {
//   // debug: true,
//   path: '/modern-peer'
// });
// app.use('/peerjs', peerServer);


const io: Server = new Server(appServer, {
  cors: {
    origin: whitelist_domains,
  },

  allowRequest: (req, callback) => {
    console.log(`socket req origin: ${req.headers.origin}`);
    const useOrigin = (req.headers.origin || '');
    const originIsAllowed = whitelist_domains.includes(useOrigin);
    console.log({ originIsAllowed });
    callback(null, originIsAllowed);
  }
});
io.engine.generateId = (req: any) => {
  return uniqueValue(); // must be unique across all Socket.IO servers
};

// SocketsService.set_io(io);
SocketsService.handle_io_connections(io);

app.use((
  request: express.Request, 
  response: express.Response, 
  next: express.NextFunction
) => {
  (<IRequest> request).io = io;
  (<IRequest> request).socketsService = SocketsService;
  next();
});






/** Mount Sub-Routers to Master Application Instance */

app.options(`*`, corsMiddleware);
app.use('/apps', corsMiddleware, AppsRouter);

/** Static file declaration */

const publicPath = path.join(__dirname, '../_public');
const expressStaticPublicPath = express.static(publicPath);
app.use(expressStaticPublicPath);

/** init database */
console.log(`PORT = ${PORT}\n`);
console.log(`Connecting to database...\n`);
try {
  db_init().then(() => {
    console.log(`app db ready; starting app.`);
  
    /** Start Server */
    appServer.listen(PORT);
    console.log(`Listening on port ${PORT}...\n\n`);
  });  
} catch (error) {
  console.log(`db_init error...`, { error });
  throw error;
}
