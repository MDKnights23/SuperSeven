def greet(name: str = "World") -> str:
    """Return a friendly greeting."""
    return f"Hello, {name}!"


def main() -> None:
    print(greet())


if __name__ == "__main__":
    main()
