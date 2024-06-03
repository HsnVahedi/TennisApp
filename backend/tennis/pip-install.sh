#!/bin/bash
pip install "$1"
pip freeze > /app/tennis/requirements.txt
