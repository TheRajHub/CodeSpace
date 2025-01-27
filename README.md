---

# CodeSpace

A real-time platform for collaborative coding. Users can join rooms, edit code, run commands in a virtual terminal, and interact with each other. And here is the frontend part of the code: <a href="https://github.com/TheRajHub/CodeSpace-Fontend.git">Frontend</a>

## Features
- **Room-based collaboration**: Users join rooms to share a workspace.
- **Terminal interaction**: Run commands in a shared terminal.
- **File sharing**: Read and write code files in real-time.
- **User management**: View and update the list of room members.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TheRajHub/CodeSpace.git
   cd CodeSpace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up `.env`:
   ```env
   PORT=your_port_number
   ```

4. Start the server:
   ```bash
   node index.js
   ```

   Access at `http://localhost:PORT`.

## Events
- **`joinRoom({ room, username })`**: Join a room with a username.
- **`getcode(file)`**: Request file content.
- **`write({ data, file })`**: Write to a file.
- **`input(input)`**: Send input to the terminal.
- **`disconnect`**: Handle user disconnections.

## Technologies
- **Node.js**, **Socket.io**, **Express**, **Child Process**, **fs**, **dotenv**
