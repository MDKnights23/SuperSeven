from my_python_project.main import greet


def test_greet_default():
    assert greet() == "Hello, World!"


def test_greet_custom_name():
    assert greet("Alice") == "Hello, Alice!"
