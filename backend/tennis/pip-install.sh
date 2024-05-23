#!/bin/bash
pip install "$1"
pip freeze > tennis/requirements.txt
