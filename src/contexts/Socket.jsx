import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000'; // 'https://stoked-champion-402109.wl.r.appspot.com/';

export const socket = io(SOCKET_URL);