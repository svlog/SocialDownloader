#!/usr/bin/env python3
"""
Backwards-compatibility wrapper pointing to the unified server/media-handler.py.
"""
from server.media_handler_runner import main

if __name__ == "__main__":
    import runpy
    import os
    target = os.path.join(os.path.dirname(__file__), "media-handler.py")
    runpy.run_path(target, run_name="__main__")
