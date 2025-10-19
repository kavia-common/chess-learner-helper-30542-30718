#!/bin/bash
cd /home/kavia/workspace/code-generation/chess-learner-helper-30542-30718/FrontendWebApplication
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

