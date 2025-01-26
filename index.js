// joinRoom= to join the room and start terminal and create the workingfolder
// getcode= request file name to read
// write= to rewrite a file
// input= to input into terminal
// disconnect= to disconnect to the server
// file= the respose of read
// code= to get the updated version of the code
// output= to get the output of the terminal
// user= to get an array of usernames in the room
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server({
    cors: { origin: '*' },
});

io.attach(server);

let activeroom=new Map()
let id={}


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);


    // Listen for room joining
    socket.on('joinRoom', ({room,username}) => {
        room=room.trim()
        
        id[socket.id]=username
        
        //room folder
        socket.join(room);
        const folderPath = path.join(process.cwd(),room);
        let child;

        if(!activeroom.has(room)){
            

            try{
                fs.mkdirSync(folderPath ,(err)=> {
                    if (err) {
                      console.error('Error writing to file:', err);
                    }
                });
                fs.writeFileSync(path.join(folderPath,'p.py'), "#File Name: p.py\n#Write your Code here", (err) => {
                    if (err) {
                      console.error('Error writing to file:', err);
                    }
                });
                const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
                try{
                    console.log(folderPath)
                    console.log(process.env)
                    child = spawn(shell, [], {
                        cwd: folderPath, // Set working directory
                        env: process.env,
                    });
                }
                catch(err){
                    console.log(err)
                }
                activeroom.set(room,child)
                
                console.log(`User ${socket.id} joined room: ${room}`);

            }
            catch(err){
                if(err.code === 'EEXIST'){
                    socket.emit('output',"This room is protected can't be a part of this")
                }
                else{
                    console.error(err.message)
                }
            }

        }
        else{
            
            child=activeroom.get(room)
        }
        // terminal part
        // Send terminal output to the room
        try{
            console.log("terminal part 2")
            child.stdout.on('data', (data) => {
                console.log(data.toString())
                io.to(room).emit('output', data.toString());
            });
    
            child.stderr.on('data', (data) => {
                console.log(data.toString())
                io.to(room).emit('output', data.toString());
            });
        }
        catch(a){
            console.log(a)
        }
        
        setTimeout(()=>{
            fs.readFile(path.join(folderPath,'p.py'),'utf-8',(err,data)=>{
                if(err){
                    console.log("the read error "+err)
                    return
                }
                console.log("sss")
                console.log(data)
                socket.emit('file',data)
            })
        },1000)
        setTimeout(()=>{
            socket.emit('room',room)
        },1000)
        let roomMembers = Array.from(io.sockets.adapter.rooms.get(room) || []);
            
        for(let i=0;i<roomMembers.length;i++){
            roomMembers[i]=id[roomMembers[i]]
        }
        console.log(roomMembers)
        io.to(room).emit('user',roomMembers)

        
            
        

        

        //code part
        socket.on('getcode',(file)=>{
            console.log(path.join(folderPath,file))
            try{
                let data=fs.readFile(path.join(folderPath,file),'utf-8',(err,data)=>{
                    if(err){
                        console.log("the read error "+err)
                        return
                    }
                    console.log(data)
                    socket.emit('file',data)
                })
            }
            catch(e){
                console.log("error: "+e)
            }
            
        })

        socket.on('write',({data,file})=>{
            fs.writeFileSync(path.join(folderPath,file), data, (err) => {
                if (err) {
                  console.error('Error writing to file:', err);
                }
            });
            console.log(data)
            io.to(room).emit('code',{data:data,id:socket.id,file:file})
        })



        // Handle input from the client
        let inputBuffer = ''; // To store the current input

        socket.on('input', (input) => {
            
            if (input === '\x7f') { // Handle backspace
                if (inputBuffer.length > 0) {
                inputBuffer = inputBuffer.slice(0, -1); // Remove the last character from the buffer
                }
            } else {
                inputBuffer += input; // Append the input to the buffer
            }

            // Send the updated buffer to the child process when Enter is pressed
            if (input === '\n') {
                child.stdin.write(inputBuffer); // Send the entire buffer as input
                inputBuffer = ''; // Clear the buffer after sending
            }
            console.log("terminal part 1")
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            roomMembers = Array.from(io.sockets.adapter.rooms.get(room) || []);
            
            for(let i=0;i<roomMembers.length;i++){
                roomMembers[i]=id[roomMembers[i]]
            }
            console.log(roomMembers)
            io.to(room).emit('user',roomMembers)
            if(roomMembers.length<=0){
                if (child) {
                    child.kill();
                    child.on('exit', () => {
                        fs.rm(folderPath, { recursive: true, force: true }, (err) => {
                            if (err) {
                                console.error('Error deleting the folder:', err);
                            } else {
                                console.log('Folder deleted successfully!');
                            }
                        });
                    });
                }
            }
            
        });
    });
});

server.listen(process.env.PORT, () => {
    console.log('Server running on http://localhost:'+process.env.PORT); 
}); 