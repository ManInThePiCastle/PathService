#!/bin/bash

zip -FS -r mpc_path_service.zip *
aws lambda update-function-code --function-name=piday2017-mpc-path-service --zip-file fileb://mpc_path_service.zip
