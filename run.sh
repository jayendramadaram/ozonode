#!/bin/bash
rm -rf orders.sqlite

# Start the watcher and redirect its output to a log file
npm run start-watcher > watcher-logs.txt 2>&1 &

# Start the server and keep its output in the terminal
npm run start-server > server-logs.txt 