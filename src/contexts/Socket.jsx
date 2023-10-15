import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000'; // TODO change to server address

export const socket = io(SOCKET_URL);