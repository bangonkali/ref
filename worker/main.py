#!/usr/bin/env python
import os
import sys

from managers.job_manager import JobManager


def main():
    job_manager = JobManager()
    job_manager.start()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
