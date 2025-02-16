from configparser import ConfigParser


def load_config():
    config = ConfigParser()
    config.read(".config")

    return config

config = load_config()