import logging
import sys

def setup_logging():
    # Basic structured logging configuration
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    logger = logging.getLogger("padhaanewala")
    return logger

logger = setup_logging()
