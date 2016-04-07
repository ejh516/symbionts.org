from __future__ import print_function, division

import sys
import os

print(os.getcwd(), file=sys.stderr)
sys.path.insert(0, "/Library/WebServer/symbionts.org")

from symbionts import app as application
